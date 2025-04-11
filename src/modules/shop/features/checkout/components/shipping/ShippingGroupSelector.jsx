import React, { useState, useEffect, useRef } from 'react';
import { processCartForShipping } from '../../../cart/services/shippingGroupService';
import { groupProductsByShippingRules, prepareShippingOptionsForCheckout } from '../../services/shippingGroupingService';
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
        
        // Método 1: Usar las funciones de shippingGroupingService
        // Este método crea grupos por regla de envío y cada producto puede estar en múltiples grupos
        const shippingGroups = await groupProductsByShippingRules(formattedCartItems);
        console.log('📦 Grupos creados con groupProductsByShippingRules:', shippingGroups.length);
        
        const directOptions = await prepareShippingOptionsForCheckout(shippingGroups, userAddress?.id);
        console.log('🚚 Opciones de envío calculadas directamente:', directOptions.totalOptions?.length);
        
        // Si tenemos opciones directas, usarlas
        if (directOptions && directOptions.totalOptions && directOptions.totalOptions.length > 0) {
          setShippingGroups(directOptions.groups || []);
          
          // Convertir las opciones directas al formato de combinaciones
          // Aseguramos que cada opción de mensajería de cada regla se convierta en una opción individual
          let directCombinations = [];
          
          // Primero procesamos los grupos por separado
          directOptions.groups.forEach(group => {
            const rule = group.rule;
            if (!rule || !rule.opciones_mensajeria || !Array.isArray(rule.opciones_mensajeria)) {
              return;
            }
            
            // Para cada opción de mensajería en la regla, crear una combinación
            rule.opciones_mensajeria.forEach((opcion, optionIndex) => {
              // Calcular si esta opción es gratis
              const isFreeShipping = rule.envio_gratis === true || group.isFreeShipping === true;
              
              // Calcular precio final
              const deliveryCost = isFreeShipping ? 0 : parseFloat(opcion.precio || 0);
              
              // Crear ID único para esta opción
              const optionId = `${rule.id}-${opcion.nombre?.replace(/\s+/g, '-')?.toLowerCase() || 'option'}-${optionIndex}`;
              
              // Generar etiqueta descriptiva
              let optionLabel = opcion.label || opcion.nombre || 'Envío';
              
              // Si es una de las opciones de Correos de México, añadir una etiqueta más descriptiva
              if (opcion.nombre === 'Correos de México') {
                optionLabel = optionIndex === 0 ? 'Basico' : 'Express';
              }
              
              // Añadir combinación
              directCombinations.push({
                id: optionId,
                description: rule.zona === 'Local' ? 'Entrega Local' : optionLabel,
                totalPrice: deliveryCost,
                isAllFree: isFreeShipping,
                carrier: opcion.nombre || 'Servicio de envío',
                ruleId: rule.id,
                ruleName: rule.zona || 'Sin nombre',
                calculatedCost: deliveryCost,
                deliveryTime: opcion.tiempo_entrega || `${opcion.minDays || 1}-${opcion.maxDays || 5} días`,
                selections: [{
                  groupId: group.id || 'default-group',
                  option: {
                    name: opcion.nombre || 'Servicio de envío',
                    price: deliveryCost,
                    estimatedDelivery: opcion.tiempo_entrega || `${opcion.minDays || 1}-${opcion.maxDays || 5} días`,
                    isFreeShipping
                  },
                  products: group.items || []
                }]
              });
            });
          });
          
          // Ordenar las combinaciones para que las gratuitas aparezcan primero
          directCombinations.sort((a, b) => {
            // Primero envío gratis
            if (a.isAllFree && !b.isAllFree) return -1;
            if (!a.isAllFree && b.isAllFree) return 1;
            
            // Luego por precio
            return (a.totalPrice || 0) - (b.totalPrice || 0);
          });
          
          // Generar opciones mixtas combinando grupos (Local + Nacional)
          // Solo si tenemos al menos dos grupos diferentes
          if (directOptions.groups.length > 1) {
            const localGroups = directOptions.groups.filter(g => g.rule?.zona === 'Local');
            const nationalGroups = directOptions.groups.filter(g => g.rule?.zona === 'Nacional');
            
            // Solo crear combinaciones mixtas si hay grupos locales y nacionales
            if (localGroups.length > 0 && nationalGroups.length > 0) {
              console.log('🔄 Creando combinaciones mixtas entre grupos Local y Nacional');
              
              // Para cada grupo local con productos
              localGroups.forEach(localGroup => {
                if (!localGroup.items || !localGroup.rule?.opciones_mensajeria) return;
                
                // Producto(s) que tienen envío local
                const localProducts = localGroup.items;
                
                // Para cada grupo nacional
                nationalGroups.forEach(nationalGroup => {
                  if (!nationalGroup.items || !nationalGroup.rule?.opciones_mensajeria) return;
                  
                  // Productos que solo tienen envío nacional (no están en el grupo local)
                  const nationalOnlyProducts = nationalGroup.items.filter(item => {
                    const itemId = (item.product || item).id;
                    return !localProducts.some(localItem => 
                      (localItem.product || localItem).id === itemId
                    );
                  });
                  
                  // Solo crear combinación mixta si hay productos exclusivos del grupo nacional
                  if (nationalOnlyProducts.length > 0) {
                    // Para cada opción de mensajería nacional
                    nationalGroup.rule.opciones_mensajeria.forEach((nationalOption, optionIndex) => {
                      // Usar la primera opción local (suponiendo que es la más económica)
                      const localOption = localGroup.rule.opciones_mensajeria[0];
                      
                      // Precio nacional
                      const nationalPrice = nationalGroup.isFreeShipping ? 0 : parseFloat(nationalOption.precio || 0);
                      
                      // Crear combinación mixta
                      const mixedCombination = {
                        id: `mixed-${localGroup.id}-${nationalGroup.id}-${optionIndex}`,
                        description: `Mixta: Local + ${optionIndex === 0 ? 'Básico' : 'Express'}`,
                        totalPrice: nationalPrice, // Solo se cobra el envío nacional, el local es gratis
                        isAllFree: nationalPrice === 0,
                        carrier: 'Envío mixto',
                        ruleName: 'Mixto',
                        calculatedCost: nationalPrice,
                        deliveryTime: nationalOption.tiempo_entrega || `${nationalOption.minDays || 3}-${nationalOption.maxDays || 10} días`,
                        isMixed: true,
                        selections: [
                          // Opción local para productos con envío local
                          {
                            groupId: localGroup.id,
                            option: {
                              name: localOption.nombre || 'Entrega Local',
                              price: 0, // Siempre gratis el local
                              estimatedDelivery: localOption.tiempo_entrega || '1-1 días',
                              isFreeShipping: true
                            },
                            products: localProducts
                          },
                          // Opción nacional para productos que solo tienen envío nacional
                          {
                            groupId: nationalGroup.id,
                            option: {
                              name: nationalOption.nombre || 'Envío Nacional',
                              price: nationalPrice,
                              estimatedDelivery: nationalOption.tiempo_entrega || `${nationalOption.minDays || 3}-${nationalOption.maxDays || 10} días`,
                              isFreeShipping: nationalGroup.isFreeShipping
                            },
                            products: nationalOnlyProducts
                          }
                        ]
                      };
                      
                      // Añadir a las combinaciones totales
                      directCombinations.push(mixedCombination);
                    });
                  }
                });
              });
              
              // Re-ordenar después de añadir las combinaciones mixtas
              directCombinations.sort((a, b) => {
                // Primero envío gratis
                if (a.isAllFree && !b.isAllFree) return -1;
                if (!a.isAllFree && b.isAllFree) return 1;
                
                // Luego por precio
                return (a.totalPrice || 0) - (b.totalPrice || 0);
              });
            }
          }
          
          console.log('🚢 Combinaciones generadas:', directCombinations.length);
          setShippingCombinations(directCombinations);
          setStatus({ loading: false, error: null, noOptions: false });
          
          // Notificar al componente padre
          if (onCombinationsCalculated && typeof onCombinationsCalculated === 'function') {
            console.log('🔄 Notificando combinaciones calculadas:', directCombinations.length);
            onCombinationsCalculated(directCombinations);
          }
          
          // Seleccionar automáticamente la primera opción si no hay selección
          if (!selectedOptionId && directCombinations.length > 0 && onOptionSelect && !initialSelectionMade.current) {
            setTimeout(() => {
              try {
                const firstOption = directCombinations[0];
                console.log('🔄 Seleccionando primera opción automáticamente:', firstOption.id);
                
                if (firstOption && firstOption.id) {
                  initialSelectionMade.current = true;
                  onOptionSelect(firstOption);
                }
              } catch (err) {
                console.error('Error al seleccionar primera opción:', err);
              }
            }, 100);
          }
          
          return;
        }
        
        // Método 2: Respaldo - Usar processCartForShipping como estaba originalmente
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
        isAllFree: option.isAllFree || false,
        // Información adicional para mejor integración
        totalCost: option.totalPrice || option.calculatedCost || 0,
        calculatedCost: option.calculatedCost || option.totalPrice || 0,
        carrier: option.carrier,
        deliveryTime: option.deliveryTime,
        isFreeShipping: option.isAllFree,
        ruleId: option.ruleId,
        ruleName: option.ruleName || (option.id.includes('-') ? option.id.split('-')[0] : '')
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
      
      {/* Debug info for single option scenarios */}
      {shippingCombinations.length === 1 && (
        <div className="debug-info small text-muted mb-2">
          Solo hay 1 opción de envío disponible para esta dirección.
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
              
              // Verificar si es gratuita
              const isFreeShipping = combination.isAllFree;
              
              // Simplificar descripción eliminando montos redundantes
              let description = combination.description || '';
              if (description.includes('($')) {
                description = description.replace(/\s*\(\$[^)]*\)/g, '');
              }
              
              return (
                <tr 
                  key={`${combination.id}-${index}`}
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
                        
                        {combination.ruleName && (
                          <span className="badge bg-light text-dark ms-2 small">
                            {combination.ruleName}
                          </span>
                        )}
                        
                        {combination.selections && combination.selections.length > 1 && (
                          <span className="shipping-group-count">
                            {combination.selections.length} grupos
                          </span>
                        )}
                      </div>
                      
                      <div className="shipping-details d-flex align-items-center">
                        <div className="shipping-delivery me-3">
                          <i className="bi bi-clock-history me-1 small"></i>
                          {combination.deliveryTime || 
                            (combination.selections && Array.isArray(combination.selections) 
                              ? (combination.selections.map(s => s.option?.estimatedDelivery || '').filter(Boolean).sort().pop() || '3-5 días')
                              : '3-5 días'
                            )
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
                    
                    {/* Información sobre productos en esta opción */}
                    <div className="mt-1 small text-muted">
                      {combination.selections && combination.selections[0]?.products?.length > 0 && (
                        <div>
                          <i className="bi bi-box small me-1"></i>
                          <span>
                            {combination.selections[0].products.length === 1 
                              ? "1 producto" 
                              : `${combination.selections[0].products.length} productos`}
                            {combination.selections[0].products.map(item => 
                              (item.product?.name || item.name)
                            ).join(", ").length < 50 && 
                              `: ${combination.selections[0].products.map(item => 
                                  (item.product?.name || item.name)
                                ).join(", ")}`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Detalles de la combinación */}
                    {isSelected && combination.selections && Array.isArray(combination.selections) && combination.selections.length > 0 && (
                      <div className="shipping-option-details mt-2">
                        {combination.isMixed ? (
                          <div className="alert alert-light p-2 mb-0">
                            <div className="mb-1 fw-medium">Detalle de envíos separados:</div>
                            {combination.selections.map((selection, selIndex) => (
                              <div key={`${selection.groupId || selIndex}-detail`} className="shipping-option-details-item mb-1">
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <i className="bi bi-box-seam me-1"></i>
                                    <span className="fw-medium">{selIndex === 0 ? 'Envío Local' : 'Envío Nacional'}:</span> {selection.option?.name || 'Opción'}
                                    <span className="ms-1 text-nowrap">
                                      ({selection.option?.isFreeShipping ? 'Gratis' : `$${(selection.option?.price || 0).toFixed(2)}`})
                                    </span>
                                  </div>
                                  <div className="text-muted">
                                    {selection.products?.length || 0} producto(s)
                                  </div>
                                </div>
                                <div className="ps-4 mt-1 mb-1 small text-muted">
                                  <i className="bi bi-dot"></i>
                                  Productos: {selection.products.map(item => 
                                    (item.product?.name || item.name)
                                  ).join(", ")}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          combination.selections.map((selection, selIndex) => (
                            <div key={`${selection.groupId || selIndex}-detail`} className="shipping-option-details-item">
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
                          ))
                        )}
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