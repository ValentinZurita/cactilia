import React, { useState, useEffect, useRef } from 'react';
import { processCartForShipping } from '../../../cart/services/shippingGroupService';
import './ShippingGroupSelector.css';

/**
 * Componente para seleccionar opciones de envío agrupadas por reglas
 * Muestra los diferentes grupos de envío optimizados y permite seleccionar una combinación
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.cartItems - Productos en el carrito
 * @param {Function} props.onOptionSelect - Función llamada al seleccionar una opción
 * @param {string} props.selectedOptionId - ID de la opción seleccionada
 * @param {string} props.selectedOptionDesc - Descripción de la opción seleccionada
 * @param {Object} props.userAddress - Dirección del usuario (opcional)
 * @param {Function} props.onCombinationsCalculated - Función llamada cuando se calculan las combinaciones
 */
const ShippingGroupSelector = ({ 
  cartItems = [], 
  onOptionSelect = () => {}, 
  selectedOptionId = '',
  selectedOptionDesc = '',
  userAddress = null,
  onCombinationsCalculated = () => {}
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
  
  // Extraer la descripción del ID si no se proporciona explícitamente
  const effectiveSelectedOptionDesc = selectedOptionDesc || selectedOptionId?.includes('-') 
    ? selectedOptionId.split('-').slice(1).join('-').replace(/-/g, ' ') 
    : '';
  
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
            // Usar timeout para evitar problema de referencias inconsistentes durante el renderizado
            setTimeout(() => {
              try {
                const firstOption = combinations[0];
                console.log('🔄 Seleccionando primera opción automáticamente:', firstOption.id);
                
                // Asegurarnos de que el ID es válido antes de seleccionarlo
                if (firstOption && firstOption.id) {
                  initialSelectionMade.current = true;
                  onOptionSelect(firstOption);
                } else {
                  console.warn('⚠️ No se pudo seleccionar la primera opción: ID no válido');
                }
              } catch (err) {
                console.error('Error al seleccionar primera opción:', err);
              }
            }, 100);
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
  
  // Mostrar el selectedOptionId cuando cambie (para debug)
  useEffect(() => {
    console.log('🔍 ShippingGroupSelector: selectedOptionId =', selectedOptionId);
    console.log('🔍 ShippingGroupSelector: selectedOptionDesc =', effectiveSelectedOptionDesc);
    console.log('📦 ShippingCombinations disponibles:', shippingCombinations.length);
    
    if (selectedOptionId) {
      const selectedOption = shippingCombinations.find(c => c.id === selectedOptionId);
      console.log('🔍 Opción seleccionada por ID:', selectedOption ? selectedOption.description || 'Opción' : 'No encontrada');
      
      if (!selectedOption && effectiveSelectedOptionDesc) {
        const selectedByDesc = shippingCombinations.find(
          c => c.description && c.description.toLowerCase().includes(effectiveSelectedOptionDesc.toLowerCase())
        );
        console.log('🔍 Opción seleccionada por descripción:', selectedByDesc ? selectedByDesc.description : 'No encontrada');
      }
    }
  }, [selectedOptionId, effectiveSelectedOptionDesc, shippingCombinations]);
  
  // Manejar selección de opción
  const handleOptionSelect = (option) => {
    // Validar que la opción existe y sigue siendo válida
    const isValidOption = shippingCombinations.some(opt => opt.id === option.id);
    
    if (!isValidOption) {
      console.error('❌ Error: Se intentó seleccionar una opción de envío que ya no es válida:', option.id);
      return;
    }
    
    console.log(`✅ Seleccionada opción de envío: ${option.id} (${option.description || option.name || 'Opción'}) - $${option.totalPrice}`);
    console.log(`🔄 Estado anterior selectedOptionId: ${selectedOptionId}`);
    
    // Pasar el objeto completo con toda la información disponible para facilitar la búsqueda
    // cuando cambiamos entre direcciones
    if (onOptionSelect) {
      const description = option.description || option.name || 'Opción de envío';
      onOptionSelect({
        ...option,
        // Asegurar que tenemos todos los campos críticos
        id: option.id,
        name: option.name || description,
        description: description,
        totalPrice: option.totalPrice || 0,
        isAllFree: option.isAllFree || false
      });
    } else {
      console.error('❌ Error: onOptionSelect no está definido');
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
        <div className="alert alert-danger border-0 rounded-3 shipping-error-alert" role="alert">
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
                      <pre className="mb-0 small text-danger debug-info">{JSON.stringify(status.debug, null, 2)}</pre>
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
        <div className="alert alert-warning border-0 rounded-3 shipping-warning-alert" role="alert">
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
                      <pre className="mb-0 small debug-info">{JSON.stringify(status.debug, null, 2)}</pre>
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
          <tbody>
            {shippingCombinations.map((combination, index) => {
              // Permitir coincidencia por ID o por descripción para manejar diferencias entre sistemas
              const isMatchById = combination.id === selectedOptionId;
              const isMatchByDescription = effectiveSelectedOptionDesc && 
                                          combination.description && 
                                          combination.description.toLowerCase().includes(effectiveSelectedOptionDesc.toLowerCase());
              
              // Una opción está seleccionada si coincide por ID o por descripción
              const isSelected = isMatchById || isMatchByDescription;
              
              // Log para debuggear
              console.log(`Opción ${combination.id}: isSelected=${isSelected}, byId=${isMatchById}, byDesc=${isMatchByDescription}`);
              
              // Verificar si es gratuita
              const isFreeShipping = combination.isAllFree;
              
              // Simplificar descripción eliminando montos redundantes
              let description = combination.description || '';
              if (description.includes('($')) {
                description = description.replace(/\s*\(\$[^)]*\)/g, '');
              }
              
              return (
                <tr 
                  key={combination.id}
                  className={`${isSelected ? 'shipping-option-selected' : 'shipping-option-normal'}`}
                  onClick={() => handleOptionSelect(combination)}
                >
                  <td className="text-center selection-indicator first-cell">
                    <div className={`select-marker ${isSelected ? 'selected' : ''}`}>
                      {isSelected && <i className="bi bi-check"></i>}
                    </div>
                  </td>
                  <td className="shipping-option-info last-cell">
                    {/* Nombre de la combinación */}
                    <div className="d-flex align-items-center justify-content-between">
                      <div className={`shipping-name ${isSelected ? 'fw-semibold' : ''}`}>
                        {description}
                        
                        {combination.selections && combination.selections.length > 1 && (
                          <span className="shipping-group-count">
                            {combination.selections.length} grupos
                          </span>
                        )}
                      </div>
                      
                      <div className="shipping-details d-flex align-items-center">
                        <div className="shipping-delivery me-3">
                          <i className="bi bi-clock-history me-1 small"></i>
                          {combination.selections && Array.isArray(combination.selections) 
                            ? (combination.selections.map(s => s.option?.estimatedDelivery || '').filter(Boolean).sort().pop() || '3-5 días')
                            : '3-5 días'
                          }
                        </div>
                        
                        <div className="shipping-price">
                          {isFreeShipping ? (
                            <span className="shipping-free">Gratis</span>
                          ) : (
                            <span>${(combination.totalPrice || 0).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Detalles de la combinación */}
                    {isSelected && combination.selections && Array.isArray(combination.selections) && combination.selections.length > 1 && (
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