import React, { useState, useEffect, useRef } from 'react';
import { processCartForShipping } from '../../../cart/services/shippingGroupService';

// Estilos personalizados para los radio buttons
const radioStyles = {
  radioContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  },
  radioInput: {
    cursor: 'pointer',
    width: '20px',
    height: '20px',
    accentColor: '#198754', // Color verde Bootstrap
    appearance: 'none',
    border: '2px solid #ced4da',
    borderRadius: '50%',
    outline: 'none',
    backgroundColor: '#fff',
    boxShadow: 'none',
    position: 'relative'
  },
  selectedRow: {
    backgroundColor: 'rgba(25, 135, 84, 0.1)' // Verde claro para filas seleccionadas
  }
};

// Estilos CSS personalizados para los radio buttons
const styleElement = document.createElement('style');
styleElement.textContent = `
  .shipping-option-radio:checked {
    background-color: #ffffff !important;
    border-color: #198754 !important;
    box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.25) !important;
  }
  
  .shipping-option-radio:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #198754;
    display: block;
  }
  
  .shipping-option-radio-container {
    padding: 0.5rem;
    cursor: pointer;
  }
  
  .shipping-option-selected {
    background-color: rgba(25, 135, 84, 0.1) !important;
  }
`;
document.head.appendChild(styleElement);

/**
 * Componente para seleccionar opciones de envío agrupadas por reglas
 * Muestra los diferentes grupos de envío optimizados y permite seleccionar una combinación
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.cartItems - Productos en el carrito
 * @param {Function} props.onOptionSelect - Función llamada al seleccionar una opción
 * @param {string} props.selectedOptionId - ID de la opción seleccionada
 * @param {Object} props.userAddress - Dirección del usuario (opcional)
 * @param {Function} props.onCombinationsCalculated - Función llamada cuando se calculan las combinaciones
 */
const ShippingGroupSelector = ({ 
  cartItems, 
  onOptionSelect, 
  selectedOptionId,
  userAddress = null,
  onCombinationsCalculated
}) => {
  const [shippingGroups, setShippingGroups] = useState([]);
  const [shippingCombinations, setShippingCombinations] = useState([]);
  const [status, setStatus] = useState({
    loading: true,
    error: null,
    noOptions: false,
    debug: null
  });
  
  // Referencia para controlar si ya se ha seleccionado la primera opción automáticamente
  const initialSelectionMade = useRef(false);
  
  useEffect(() => {
    // Resetear la bandera si cambian los items del carrito o la dirección
    if (!selectedOptionId) {
      initialSelectionMade.current = false;
    }
    
    if (!cartItems || cartItems.length === 0) {
      setStatus({ 
        loading: false, 
        error: 'No hay productos en el carrito', 
        noOptions: true 
      });
      return;
    }

    setStatus(prevStatus => ({ ...prevStatus, loading: true }));
    
    // Función asíncrona para procesar el carrito
    const processCart = async () => {
      try {
        console.log('🔍 ShippingGroupSelector: Procesando opciones de envío');
        console.log('📦 Productos en carrito:', cartItems.length);
        console.log('🏠 Dirección de usuario:', userAddress);
        
        // Asegurarse de que los items del carrito tengan el formato correcto
        const formattedCartItems = cartItems.map(item => {
          // Si el item ya tiene la estructura correcta con product y quantity
          if (item.product && item.product.id) {
            return item;
          }
          
          // Si el item es el producto directamente
          if (item.id) {
            return {
              product: item,
              quantity: item.quantity || 1
            };
          }
          
          // Si tiene otra estructura
          return {
            product: item.productData || item.product || item,
            quantity: item.quantity || 1
          };
        });
        
        console.log('📝 Productos formateados:', formattedCartItems.length);
        
        // Procesar los items del carrito
        const result = await processCartForShipping(formattedCartItems, userAddress);
        
        // Verificar si el resultado es válido
        if (!result || !result.groups || !result.combinations) {
          console.error('❌ El servicio devolvió un resultado inválido:', result);
          setStatus({ 
            loading: false, 
            error: 'No se pudieron obtener opciones de envío', 
            noOptions: true,
            debug: {
              cartItemsCount: cartItems.length,
              formattedItemsCount: formattedCartItems.length,
              hasUserAddress: !!userAddress,
              result: result || 'No hay resultado'
            }
          });
          return;
        }
        
        const { groups, combinations } = result;
        
        console.log(`📊 Resultado: ${groups?.length || 0} grupos, ${combinations?.length || 0} combinaciones`);
        
        if (!groups || !combinations || groups.length === 0 || combinations.length === 0) {
          setStatus({ 
            loading: false, 
            error: 'No se encontraron opciones de envío válidas para los productos seleccionados', 
            noOptions: true,
            debug: {
              cartItemsCount: cartItems.length,
              formattedItemsCount: formattedCartItems.length,
              hasUserAddress: !!userAddress,
              groups: groups || [],
              combinations: combinations || []
            }
          });
        } else {
          setShippingGroups(groups);
          setShippingCombinations(combinations);
          setStatus({ loading: false, error: null, noOptions: false });
          
          // Notificar al componente padre sobre las combinaciones calculadas
          if (onCombinationsCalculated && typeof onCombinationsCalculated === 'function') {
            console.log('🔄 Notificando combinaciones calculadas:', combinations.length);
            onCombinationsCalculated(combinations);
          }
          
          // Solo seleccionar la primera opción automáticamente si no hay opción seleccionada
          // y no se ha realizado la selección inicial
          if (!selectedOptionId && combinations.length > 0 && onOptionSelect && !initialSelectionMade.current) {
            const firstOptionId = combinations[0].id;
            console.log('🔄 Seleccionando primera opción automáticamente:', firstOptionId);
            
            // Asegurarnos de que el ID es válido antes de seleccionarlo
            if (firstOptionId) {
              initialSelectionMade.current = true;
              onOptionSelect(firstOptionId);
            } else {
              console.warn('⚠️ No se pudo seleccionar la primera opción: ID no válido');
            }
          }
        }
      } catch (error) {
        console.error('❌ Error al procesar opciones de envío:', error);
        setStatus({ 
          loading: false, 
          error: `Error al calcular opciones de envío: ${error.message}`,
          noOptions: true,
          debug: { errorStack: error.stack }
        });
      }
    };
    
    // Ejecutar la función asíncrona
    processCart();
  }, [cartItems, userAddress]);
  
  // Manejar selección de opción
  const handleOptionSelect = (optionId, event) => {
    // Prevenir la propagación del evento para evitar doble disparo
    if (event) {
      event.stopPropagation();
    }
    
    console.log('📦 Seleccionando opción manualmente:', optionId);
    
    if (onOptionSelect && optionId) {
      onOptionSelect(optionId);
    }
  };
  
  // Generar texto detallado para una combinación
  const generateDetailsText = (combination) => {
    if (!combination || !combination.selections) return '';
    
    try {
      // Para el formato actual que usa selections
      if (combination.selections && Array.isArray(combination.selections)) {
        return combination.selections.map(selection => 
          `${selection.option?.name || 'Opción'}: ${selection.option?.isFreeShipping ? 'Gratis' : `$${(selection.option?.price || 0).toFixed(2)}`}`
        ).join(' + ');
      }
      
      // Para el formato anterior que usaba groups
      if (combination.groups && Array.isArray(combination.groups)) {
        return combination.groups.map(({ group, option }) => 
          `${group?.ruleName || 'Grupo'}: ${option?.label || 'Opción'} - ${option?.isFreeShipping ? 'Gratis' : `$${(option?.totalCost || 0).toFixed(2)}`}`
        ).join('\n');
      }
      
      // Fallback
      return combination.description || 'Opción de envío';
    } catch (err) {
      console.error('Error generando texto de detalle:', err);
      return 'Opción de envío';
    }
  };
  
  // Si el carrito está vacío, no mostrar nada
  if (!cartItems || cartItems.length === 0) {
    return null;
  }
  
  // Mientras se cargan los datos
  if (status.loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Calculando opciones de envío...</span>
        </div>
        <div className="mt-2">Calculando opciones de envío...</div>
      </div>
    );
  }
  
  // Si hay error
  if (status.error) {
    return (
      <div className="alert alert-danger" role="alert">
        <div className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>
            <strong>Error:</strong> {status.error}
            {status.debug && (
              <div className="mt-2">
                <small className="d-block">Información técnica:</small>
                <code className="d-block mt-1 small">
                  {JSON.stringify(status.debug, null, 2)}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Si no hay combinaciones disponibles
  if (shippingCombinations.length === 0 || status.noOptions) {
    return (
      <div className="alert alert-warning" role="alert">
        <div className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>
            <strong>No hay opciones de envío disponibles</strong>
            <p className="mb-1 mt-1">Lo sentimos, no pudimos encontrar opciones de envío para tus productos.</p>
            
            {status.debug && (
              <div className="mt-2">
                <button 
                  className="btn btn-sm btn-outline-secondary" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#debugInfo" 
                  aria-expanded="false" 
                  aria-controls="debugInfo"
                >
                  Ver información técnica
                </button>
                <div className="collapse mt-2" id="debugInfo">
                  <div className="card card-body bg-light">
                    <pre className="mb-0 small">{JSON.stringify(status.debug, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              className="btn btn-sm btn-primary mt-2" 
              onClick={() => window.location.reload()}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="shipping-groups-container">
      <h4 className="mb-3">Opciones de envío disponibles</h4>
      
      {shippingCombinations.length > 1 && (
        <div className="alert alert-info mb-3">
          <i className="bi bi-info-circle me-2"></i>
          Tenemos <strong>{shippingCombinations.length}</strong> opciones de envío disponibles para tus productos.
          {shippingGroups.length > 1 && (
            <span> Los envíos se realizarán en <strong>{shippingGroups.length}</strong> grupos para optimizar costos.</span>
          )}
        </div>
      )}
      
      <div className="shipping-options-table">
        <table className="table table-hover">
          <thead>
            <tr>
              <th style={{ width: '50px' }}></th>
              <th>Opción de envío</th>
              <th>Tiempo de entrega</th>
              <th className="text-end">Precio</th>
            </tr>
          </thead>
          <tbody>
            {shippingCombinations.map((combination, index) => {
              // Determinar si esta combinación es la seleccionada
              const isSelected = combination.id === selectedOptionId;
              
              // Verificar si es gratuita
              const isFreeShipping = combination.isAllFree;
              
              return (
                <tr 
                  key={combination.id}
                  className={`cursor-pointer ${isSelected ? 'table-primary' : ''}`}
                  style={isSelected ? radioStyles.selectedRow : {}}
                  onClick={(e) => handleOptionSelect(combination.id, e)}
                >
                  <td className="text-center">
                    <div className="form-check d-flex justify-content-center" style={radioStyles.radioContainer}>
                      <input 
                        type="radio"
                        className="form-check-input shipping-option-radio" 
                        name="shipping-option"
                        checked={isSelected}
                        onChange={(e) => handleOptionSelect(combination.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        style={radioStyles.radioInput}
                      />
                    </div>
                  </td>
                  <td>
                    {/* Nombre de la combinación */}
                    <div className="d-flex align-items-center">
                      <span className="me-2">
                        {combination.description || 
                         (combination.selections && Array.isArray(combination.selections) ? 
                            combination.selections.map(s => s.option?.name || 'Opción').join(' + ') : 
                            'Opción de envío'
                         )}
                      </span>
                      {isFreeShipping && (
                        <span className="badge bg-success me-1">Gratis</span>
                      )}
                      {combination.selections && combination.selections.length > 1 && (
                        <span className="badge bg-secondary">
                          {combination.selections.length} grupos
                        </span>
                      )}
                    </div>
                    
                    {/* Detalles de la combinación */}
                    {isSelected && combination.selections && Array.isArray(combination.selections) && (
                      <div className="mt-2 small">
                        {combination.selections.map((selection, selIndex) => (
                          <div key={selection.groupId || `grupo-${selIndex}`} className="mb-1 ms-3">
                            <strong>Grupo {selIndex + 1}:</strong> {selection.option?.name || 'Opción'} 
                            <span className="text-muted ms-1">
                              ({selection.products?.length || 0} productos)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    {/* Mostrar el tiempo de entrega (el más largo de todas las selecciones) */}
                    {combination.selections && Array.isArray(combination.selections) 
                      ? (combination.selections.map(s => s.option?.estimatedDelivery || '').filter(Boolean).sort().pop() || '3-5 días')
                      : '3-5 días'
                    }
                  </td>
                  <td className="text-end fw-bold">
                    {isFreeShipping ? (
                      <span className="text-success">Gratis</span>
                    ) : (
                      <span>${(combination.totalPrice || 0).toFixed(2)}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShippingGroupSelector; 