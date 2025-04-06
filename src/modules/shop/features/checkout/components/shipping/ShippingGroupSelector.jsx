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

// Estilos CSS personalizados para los radio buttons y el componente
const styleElement = document.createElement('style');
styleElement.textContent = `
  .shipping-option-radio:checked {
    background-color: #ffffff !important;
    border-color: #198754 !important;
    box-shadow: 0 0 0 0.15rem rgba(25, 135, 84, 0.25) !important;
  }
  
  .shipping-option-radio:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #198754;
    display: block;
  }
  
  .shipping-option-radio {
    width: 18px !important;
    height: 18px !important;
    cursor: pointer !important;
    border: 1px solid #dee2e6 !important;
    appearance: none !important;
    border-radius: 50% !important;
    margin-top: 0 !important;
    position: relative !important;
  }
  
  .shipping-groups-container {
    font-size: 0.95rem;
  }
  
  .shipping-option-selected {
    background-color: rgba(25, 135, 84, 0.05) !important;
    border: 1px solid rgba(25, 135, 84, 0.2) !important;
    border-radius: 0.375rem !important;
  }
  
  .shipping-options-table {
    background-color: #ffffff;
  }
  
  .shipping-options-table table {
    margin-bottom: 0;
    border-collapse: separate;
    border-spacing: 0 0.5rem;
  }
  
  .shipping-options-table thead th {
    font-weight: 500;
    color: #6c757d;
    border-bottom: none;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .shipping-options-table tbody tr {
    transition: all 0.15s ease-in-out;
    cursor: pointer;
    background-color: #fcfcfc;
    border-radius: 0.375rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  }
  
  .shipping-options-table tbody tr:hover {
    background-color: rgba(25, 135, 84, 0.02);
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
  }
  
  .shipping-options-table tbody td {
    padding: 1rem;
    vertical-align: middle;
    border: none;
  }
  
  .shipping-options-table tbody td:first-child {
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }
  
  .shipping-options-table tbody td:last-child {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }
  
  .shipping-option-details {
    margin-top: 0.5rem;
  }
  
  .shipping-option-details-item {
    background-color: rgba(25, 135, 84, 0.03);
    border-radius: 0.25rem;
    padding: 0.5rem;
    margin-bottom: 0.25rem;
    border-left: 2px solid #198754;
    font-size: 0.85rem;
  }
  
  .shipping-option-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
    margin-left: 0.5rem;
    font-weight: 500;
  }
  
  .shipping-options-alert {
    border: none;
    background-color: rgba(25, 135, 84, 0.05);
    color: #198754;
    font-size: 0.9rem;
    padding: 0.75rem;
    border-left: 3px solid #198754;
  }
  
  .shipping-option-price {
    font-size: 1rem;
    font-weight: 500;
  }
  
  .shipping-option-free {
    color: #198754;
    font-weight: 600;
  }
  
  .shipping-section-title {
    font-size: 1rem;
    font-weight: 500;
    color: #212529;
    margin-bottom: 1rem;
  }
  
  .shipping-options-count {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    background-color: rgba(25, 135, 84, 0.1);
    color: #198754;
    border-radius: 1rem;
    font-weight: 500;
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
        <div className="spinner-border text-success" role="status" style={{ width: '2rem', height: '2rem', borderWidth: '0.2em' }}>
          <span className="visually-hidden">Calculando opciones de envío...</span>
        </div>
        <div className="mt-2 text-muted">Calculando opciones de envío...</div>
      </div>
    );
  }
  
  // Si hay error
  if (status.error) {
    return (
      <div className="py-2">
        <div className="alert alert-danger border-0 rounded-3" style={{ borderLeft: '3px solid #dc3545' }} role="alert">
          <div className="d-flex">
            <i className="bi bi-exclamation-circle me-3"></i>
            <div>
              <h6 className="alert-heading fw-semibold mb-1">No se pudieron calcular las opciones</h6>
              <p className="mb-0 small">{status.error}</p>
              {status.debug && (
                <div className="mt-2">
                  <button 
                    className="btn btn-sm btn-outline-danger py-0 px-2" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#errorDebugInfo" 
                    aria-expanded="false" 
                    aria-controls="errorDebugInfo"
                  >
                    <i className="bi bi-code-slash small me-1"></i> Detalles técnicos
                  </button>
                  <div className="collapse mt-2" id="errorDebugInfo">
                    <div className="bg-light rounded p-2">
                      <pre className="mb-0 small text-danger" style={{ fontSize: '0.75rem' }}>{JSON.stringify(status.debug, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Si no hay combinaciones disponibles
  if (shippingCombinations.length === 0 || status.noOptions) {
    return (
      <div className="py-2">
        <div className="alert alert-warning border-0 rounded-3" style={{ borderLeft: '3px solid #ffc107' }} role="alert">
          <div className="d-flex">
            <i className="bi bi-exclamation-triangle me-3"></i>
            <div>
              <h6 className="alert-heading fw-semibold mb-1">No hay opciones disponibles</h6>
              <p className="mb-0 small">No pudimos encontrar opciones de envío para tus productos.</p>
              
              {status.debug && (
                <div className="mt-2">
                  <button 
                    className="btn btn-sm btn-outline-warning py-0 px-2" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#debugInfo" 
                    aria-expanded="false" 
                    aria-controls="debugInfo"
                  >
                    <i className="bi bi-code-slash small me-1"></i> Información técnica
                  </button>
                  <div className="collapse mt-2" id="debugInfo">
                    <div className="bg-light rounded p-2">
                      <pre className="mb-0 small" style={{ fontSize: '0.75rem' }}>{JSON.stringify(status.debug, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                className="btn btn-sm btn-success mt-2" 
                onClick={() => window.location.reload()}
              >
                <i className="bi bi-arrow-repeat me-1"></i> Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="shipping-groups-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="shipping-section-title mb-0">Opciones de envío</h5>
        <span className="shipping-options-count">{shippingCombinations.length} opciones</span>
      </div>
      
      {shippingCombinations.length > 1 && (
        <div className="alert alert-light shipping-options-alert mb-3">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle me-2"></i>
            <div>
              <p className="mb-0">
                <small>
                  Tenemos <strong>{shippingCombinations.length}</strong> opciones disponibles para tus productos
                  {shippingGroups.length > 1 && (
                    <span> en <strong>{shippingGroups.length}</strong> grupos para optimizar costos</span>
                  )}.
                </small>
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="shipping-options-table">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Opción</th>
              <th>Entrega</th>
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
                  className={`${isSelected ? 'shipping-option-selected' : ''}`}
                  onClick={(e) => handleOptionSelect(combination.id, e)}
                >
                  <td className="text-center">
                    <input 
                      type="radio"
                      className="shipping-option-radio" 
                      name="shipping-option"
                      checked={isSelected}
                      onChange={(e) => handleOptionSelect(combination.id, e)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td>
                    {/* Nombre de la combinación */}
                    <div className="d-flex align-items-center">
                      <div className={`me-2 ${isSelected ? 'fw-semibold' : ''}`}>
                        {combination.description || 
                         (combination.selections && Array.isArray(combination.selections) ? 
                            combination.selections.map(s => s.option?.name || 'Opción').join(' + ') : 
                            'Opción de envío'
                         )}
                      </div>
                      {isFreeShipping && (
                        <span className="badge bg-success shipping-option-badge">Gratis</span>
                      )}
                      {combination.selections && combination.selections.length > 1 && (
                        <span className="badge bg-light text-secondary shipping-option-badge">
                          {combination.selections.length} grupos
                        </span>
                      )}
                    </div>
                    
                    {/* Detalles de la combinación */}
                    {isSelected && combination.selections && Array.isArray(combination.selections) && (
                      <div className="shipping-option-details mt-2">
                        {combination.selections.map((selection, selIndex) => (
                          <div key={selection.groupId || `grupo-${selIndex}`} className="shipping-option-details-item">
                            <div className="d-flex justify-content-between">
                              <div>
                                <i className="bi bi-box-seam me-1"></i>
                                <span className="fw-medium">Grupo {selIndex + 1}:</span> {selection.option?.name || 'Opción'}
                              </div>
                              <div className="text-muted">
                                {selection.products?.length || 0} productos
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="text-muted">
                      <i className="bi bi-clock-history me-1 small"></i>
                      {combination.selections && Array.isArray(combination.selections) 
                        ? (combination.selections.map(s => s.option?.estimatedDelivery || '').filter(Boolean).sort().pop() || '3-5 días')
                        : '3-5 días'
                      }
                    </div>
                  </td>
                  <td className="text-end">
                    {isFreeShipping ? (
                      <span className="shipping-option-price shipping-option-free">
                        <i className="bi bi-gift me-1 small"></i>Gratis
                      </span>
                    ) : (
                      <span className="shipping-option-price">
                        ${(combination.totalPrice || 0).toFixed(2)}
                      </span>
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