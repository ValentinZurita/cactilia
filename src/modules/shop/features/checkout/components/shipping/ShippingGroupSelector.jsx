import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  groupProductsByShippingRule, 
  generateShippingCombinations,
  allProductsCovered
} from '../../services/ShippingRuleService';
import './ShippingSelector.css';

// Función para capturar las reglas de envío del panel de diagnóstico
const captureShippingRulesFromDebugPanel = () => {
  try {
    console.log('🔍 Intentando capturar reglas del panel de diagnóstico...');
    
    // Primero intentar capturar el panel de diagnóstico
    const debugPanelEl = document.querySelector('.debug-panel');
    
    if (debugPanelEl) {
      console.log('✅ Panel de diagnóstico encontrado');
      
      // Intentar método 1: Buscar sección directa "Reglas de Envío"
      const reglasTitulo = Array.from(debugPanelEl.querySelectorAll('h3, h4, h5, strong, b')).find(
        el => el.textContent.includes('Reglas de Envío')
      );
      
      if (reglasTitulo) {
        console.log('✅ Encontrada sección "Reglas de Envío"');
        // Buscar el siguiente elemento pre después del título
        let nextEl = reglasTitulo.nextElementSibling;
        while (nextEl && nextEl.tagName !== 'PRE') {
          nextEl = nextEl.nextElementSibling;
        }
        
        if (nextEl && nextEl.tagName === 'PRE') {
          try {
            const rulesJSON = nextEl.textContent;
            const rules = JSON.parse(rulesJSON);
            
            if (Array.isArray(rules) && rules.length > 0) {
              console.log(`✅ Capturadas ${rules.length} reglas del panel de diagnóstico (método 1)`);
              window.__SHIPPING_RULES__ = rules;
              
              // Imprimir detalles de las reglas para depuración
              rules.forEach(rule => {
                console.log(`  📦 Regla ${rule.id} (${rule.zona || 'sin zona'}): ${rule.opciones?.length || 0} opciones`);
              });
              
              return rules;
            }
          } catch (e) {
            console.error('Error al parsear reglas (método 1):', e);
          }
        }
      }
      
      // Método 2: Buscar cualquier pre que contenga las propiedades esperadas
      const allPres = debugPanelEl.querySelectorAll('pre');
      for (const pre of allPres) {
        try {
          if (pre.textContent.includes('"zona":') && 
              (pre.textContent.includes('"opciones":') || pre.textContent.includes('"id":"'))) {
            
            const rulesJSON = pre.textContent;
            const rules = JSON.parse(rulesJSON);
            
            if (Array.isArray(rules) && rules.length > 0) {
              console.log(`✅ Capturadas ${rules.length} reglas del panel de diagnóstico (método 2)`);
              window.__SHIPPING_RULES__ = rules;
              
              // Imprimir detalles de las reglas para depuración
              rules.forEach(rule => {
                console.log(`  📦 Regla ${rule.id} (${rule.zona || 'sin zona'}): ${rule.opciones?.length || 0} opciones`);
              });
              
              return rules;
            }
          }
        } catch (e) {
          // Ignorar errores de parseo en este método
        }
      }
    } else {
      console.log('⚠️ Panel de diagnóstico no encontrado');
    }
  } catch (e) {
    console.error('Error al capturar reglas de envío:', e);
  }
  return null;
};

// Ejecutar captura al cargar
setTimeout(captureShippingRulesFromDebugPanel, 1000);

// Estilos CSS para el componente
const productItemStyle = {
  fontSize: '0.85rem',
  color: '#666',
  marginBottom: '2px',
  display: 'flex',
  justifyContent: 'space-between'
};

const productsListStyle = {
  marginTop: '8px',
  paddingTop: '8px',
  borderTop: '1px solid #eee'
};

const productsGroupStyle = {
  marginTop: '6px',
  paddingTop: '6px',
  borderTop: '1px dashed #eee'
};

const quantityStyle = {
  fontWeight: 'normal',
  color: '#999'
};

const groupTitleStyle = {
  fontSize: '0.8rem',
  fontWeight: 'bold',
  color: '#555',
  margin: '4px 0'
};

const freeTagStyle = {
  display: 'inline-block',
  backgroundColor: '#4CAF50',
  color: 'white',
  fontSize: '0.7rem',
  padding: '1px 4px',
  borderRadius: '3px',
  marginLeft: '5px'
};

/**
 * Componente para mostrar los productos incluidos en una opción de envío
 */
const ProductsList = ({ products, isMixed, freeProducts, paidProducts, isFreeGroup, freeGroupName, paidGroupName, freeProductsCount, paidProductsCount, freeProductsWeight, paidProductsWeight, freeGroupSubtotal, paidGroupSubtotal }) => {
  if (!products || products.length === 0) return null;
  
  // Si es una opción mixta, mostrar los productos separados por tipo de envío
  if (isMixed && freeProducts && paidProducts) {
    return (
      <div style={productsListStyle}>
        <p style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>
          Productos incluidos:
        </p>
        
        {/* Productos con envío gratuito */}
        {freeProducts.length > 0 && (
          <div style={productsGroupStyle}>
            <p style={groupTitleStyle}>
              {freeGroupName || "Envío gratuito"} <span style={freeTagStyle}>GRATIS</span>
            </p>
            
            {/* Métricas del grupo gratuito */}
            {(freeProductsCount || freeProductsWeight || freeGroupSubtotal) && (
              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '5px' }}>
                {freeGroupSubtotal && (
                  <span style={{ marginRight: '8px' }}>
                    Subtotal: ${freeGroupSubtotal.toFixed(2)}
                  </span>
                )}
                {freeProductsCount && (
                  <span style={{ marginRight: '8px' }}>
                    {freeProductsCount} {freeProductsCount === 1 ? 'producto' : 'productos'}
                  </span>
                )}
                {freeProductsWeight && (
                  <span>
                    Peso: {freeProductsWeight.toFixed(2)}kg
                  </span>
                )}
              </div>
            )}
            
            {freeProducts.map((item) => {
              const product = item.product || item;
              const quantity = item.quantity || 1;
              
              return (
                <div key={`free-${product.id}`} style={productItemStyle}>
                  <span>{product.name}</span>
                  <span style={quantityStyle}>x{quantity}</span>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Productos con costo de envío */}
        {paidProducts.length > 0 && (
          <div style={productsGroupStyle}>
            <p style={groupTitleStyle}>{paidGroupName || "Envío estándar"}</p>
            
            {/* Métricas del grupo con costo */}
            {(paidProductsCount || paidProductsWeight || paidGroupSubtotal) && (
              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '5px' }}>
                {paidGroupSubtotal && (
                  <span style={{ marginRight: '8px' }}>
                    Subtotal: ${paidGroupSubtotal.toFixed(2)}
                  </span>
                )}
                {paidProductsCount && (
                  <span style={{ marginRight: '8px' }}>
                    {paidProductsCount} {paidProductsCount === 1 ? 'producto' : 'productos'}
                  </span>
                )}
                {paidProductsWeight && (
                  <span>
                    Peso: {paidProductsWeight.toFixed(2)}kg
                  </span>
                )}
              </div>
            )}
            
            {paidProducts.map((item) => {
              const product = item.product || item;
              const quantity = item.quantity || 1;
              
              return (
                <div key={`paid-${product.id}`} style={productItemStyle}>
                  <span>{product.name}</span>
                  <span style={quantityStyle}>x{quantity}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  
  // Mostrar todos los productos en una sola lista
  return (
    <div style={productsListStyle}>
      <p style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>
        Productos incluidos:
      </p>
      {products.map((item) => {
        const product = item.product || item;
        const quantity = item.quantity || 1;
        
        return (
          <div key={product.id} style={productItemStyle}>
            <span>{product.name}</span>
            <span style={quantityStyle}>x{quantity}</span>
          </div>
        );
      })}
    </div>
  );
};

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
 * @param {Array} props.shippingRules - Reglas de envío recibidas como prop
 */
const ShippingGroupSelector = ({ 
  cartItems = [], 
  onOptionSelect = () => {}, 
  selectedOptionId = '',
  selectedOptionDesc = '',
  userAddress = null,
  onCombinationsCalculated = () => {},
  shippingRules = []
}) => {
  // Estados del componente
  const [shippingCombinations, setShippingCombinations] = useState([]);
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [status, setStatus] = useState({
    loading: true,
    error: null,
    noOptions: false,
    debug: null
  });
  
  // Referencia para rastrear cambios en la dirección y evitar bucles infinitos
  const [prevAddressInfo, setPrevAddressInfo] = useState(null);
  const processedRef = useRef(false);

  // Estabilizar las funciones de callback
  const stableOnOptionSelect = useCallback((option) => {
    onOptionSelect(option);
  }, [onOptionSelect]);

  const stableOnCombinationsCalculated = useCallback((combinations) => {
    onCombinationsCalculated(combinations);
  }, [onCombinationsCalculated]);
  
  // Procesar carrito y generar opciones de envío
  useEffect(() => {
    // Evitar procesamiento doble durante montaje inicial
    if (processedRef.current) {
      // Si ya hemos procesado y no hay cambios significativos, salir
      const userPostalCode = userAddress?.zip || userAddress?.zipcode || '';
      const userState = userAddress?.state || userAddress?.provincia || '';
      const addressKey = `${userAddress?.id || 'none'}-${userPostalCode || 'none'}-${userState || 'none'}`;
      const prevKey = prevAddressInfo ? 
        `${prevAddressInfo.id || 'none'}-${prevAddressInfo.postalCode || 'none'}-${prevAddressInfo.state || 'none'}` : 
        null;
      
      if (prevKey === addressKey && shippingCombinations.length > 0) {
        console.log('🔄 Evitando procesamiento redundante');
        return;
      }
    }

    if (!cartItems || cartItems.length === 0) {
      setStatus({ 
        loading: false, 
        error: 'No hay productos en el carrito', 
        noOptions: true 
      });
      return;
    }

    // Comprobar si la dirección ha cambiado para evitar recálculos innecesarios
    const userPostalCode = userAddress?.zip || userAddress?.zipcode || '';
    const userState = userAddress?.state || userAddress?.provincia || '';
    const currentAddressInfo = {
      id: userAddress?.id,
      postalCode: userPostalCode,
      state: userState
    };
    
    // Comparar direcciones para evitar re-cálculos innecesarios
    const addressChanged = 
      !prevAddressInfo || 
      prevAddressInfo.id !== currentAddressInfo.id || 
      prevAddressInfo.postalCode !== currentAddressInfo.postalCode ||
      prevAddressInfo.state !== currentAddressInfo.state;
    
    // Si la dirección no ha cambiado y ya tenemos combinaciones, evitar recalcular
    if (!addressChanged && shippingCombinations.length > 0) {
      console.log('🔍 Dirección sin cambios, manteniendo opciones existentes');
      return;
    }

    setStatus(prevStatus => ({ ...prevStatus, loading: true }));
    setPrevAddressInfo(currentAddressInfo);
    
    // Función asíncrona para procesar el carrito
    const processCart = async () => {
      try {
        console.log('🔍 ShippingGroupSelector: Procesando opciones de envío');
        console.log('📦 Productos en carrito:', cartItems.length);
        console.log('📦 Detalle del primer producto:', cartItems[0]);
        
        console.log('🔍 Código postal de la dirección seleccionada:', userPostalCode);
        console.log('🔍 Dirección completa:', userAddress);
        
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
        
        console.log('📦 Items formateados:', formattedCartItems);
        
        // Usar el nuevo servicio para calcular las opciones de envío
        const productGroups = groupProductsByShippingRule(formattedCartItems);
        console.log('📦 Grupos de productos:', productGroups);
        
        // Usar las reglas recibidas como prop si están disponibles
        let availableRules = shippingRules;
        
        // Si no hay reglas en las props, intentar otros métodos
        if (!availableRules || !Array.isArray(availableRules) || availableRules.length === 0) {
          console.log('⚠️ No hay reglas en las props, buscando de otras fuentes...');
          
          // Intentar obtener las reglas directamente del DOM si están disponibles
          try {
            // Si no tenemos reglas guardadas, intentar capturarlas de nuevo
            if (!window.__SHIPPING_RULES__) {
              console.log('🔄 Intentando capturar reglas de nuevo...');
              captureShippingRulesFromDebugPanel();
            }
            
            // Método 1: Reglas capturadas del panel de diagnóstico
            if (window.__SHIPPING_RULES__ && Array.isArray(window.__SHIPPING_RULES__)) {
              console.log('📋 Usando reglas de envío desde __SHIPPING_RULES__:', window.__SHIPPING_RULES__.length);
              availableRules = window.__SHIPPING_RULES__;
            }
            // Método 2: Reglas desde el debug del checkout
            else if (window.checkoutDebug && window.checkoutDebug.shippingRules) {
              console.log('📋 Usando reglas de envío desde checkoutDebug:', window.checkoutDebug.shippingRules.length);
              availableRules = window.checkoutDebug.shippingRules;
            } 
            // Método 3: Reglas desde el contexto
            else if (window.__CHECKOUT_CONTEXT__ && window.__CHECKOUT_CONTEXT__.shippingRules) {
              console.log('📋 Usando reglas de envío desde CHECKOUT_CONTEXT');
              availableRules = window.__CHECKOUT_CONTEXT__.shippingRules;
            }
          } catch (error) {
            console.error('❌ Error al obtener reglas:', error);
          }
        } else {
          console.log('✅ Usando reglas de envío desde props:', availableRules.length);
        }
        
        // Si no hay reglas, no podemos continuar
        if (!availableRules || !Array.isArray(availableRules) || availableRules.length === 0) {
          console.log('⚠️ No se encontraron reglas de envío disponibles');
          setStatus({ 
            loading: false, 
            error: 'No hay reglas de envío configuradas para este pedido. Por favor contacta al administrador.', 
            noOptions: true 
          });
          
          // Notificar al componente padre
          if (onCombinationsCalculated) {
            stableOnCombinationsCalculated([]);
          }
          return;
        }
        
        // Generar combinaciones de envío válidas - aquí pasamos el código postal y estado
        const combinations = generateShippingCombinations(
          productGroups, 
          { 
            postalCode: userPostalCode, 
            state: userState,
            addressId: userAddress?.id 
          }, 
          availableRules
        );
        console.log('🚢 Combinaciones generadas:', combinations);

        // Si no hay combinaciones válidas
        if (!combinations || combinations.length === 0) {
          setStatus({ 
            loading: false, 
            error: 'No hay opciones de envío disponibles para esta dirección. Intenta seleccionar otra dirección o contacta al vendedor.', 
            noOptions: true,
            debug: {
              formattedCartItems,
              productGroups,
              userAddress,
              availableRules
            }
          });
          setShippingCombinations([]);
          
          // Notificar al componente padre
          if (onCombinationsCalculated) {
            stableOnCombinationsCalculated([]);
          }
          return;
        }
        
        // Adaptar las combinaciones al formato que espera el componente padre
        const adaptedCombinations = combinations.map(combo => {
          // Estructura base para todas las combinaciones
          const adaptedCombo = {
            id: combo.id,
            description: combo.description || combo.ruleName,
            totalPrice: combo.option.price,
            isAllFree: combo.option.isFree,
            carrier: combo.option.name,
            ruleName: combo.ruleName,
            ruleId: combo.ruleId,
            calculatedCost: combo.option.price,
            deliveryTime: combo.option.estimatedDelivery,
            // Pasar información de los productos para mostrar detalles
            productCount: combo.productCount,
            totalWeight: combo.totalWeight,
            groupSubtotal: combo.groupSubtotal,
            // Incluir los datos de free shipping
            freeReason: combo.option.freeReason,
            // Datos de validación de límites
            exceedsLimits: !!combo.limitMessage,
            limitMessage: combo.limitMessage,
            selections: [{
              groupId: combo.ruleId,
              option: {
                name: combo.option.name,
                price: combo.option.price,
                estimatedDelivery: combo.option.estimatedDelivery,
                isFreeShipping: combo.option.isFree,
                freeReason: combo.option.freeReason
              },
              products: combo.products
            }],
            coversAllProducts: combo.coversAllProducts,
            isComplete: combo.coversAllProducts,
            isMixed: combo.isMixed
          };
          
          // Agregar metadatos específicos para opciones mixtas
          if (combo.isMixed) {
            adaptedCombo.freeProducts = combo.freeProducts;
            adaptedCombo.paidProducts = combo.paidProducts;
            adaptedCombo.freeProductsCount = combo.freeProductsCount;
            adaptedCombo.paidProductsCount = combo.paidProductsCount;
            adaptedCombo.freeProductsWeight = combo.freeProductsWeight;
            adaptedCombo.paidProductsWeight = combo.paidProductsWeight;
            adaptedCombo.freeGroupSubtotal = combo.freeGroupSubtotal;
            adaptedCombo.paidGroupSubtotal = combo.paidGroupSubtotal;
            adaptedCombo.isFreeGroup = combo.isFreeGroup;
            adaptedCombo.freeGroupName = combo.freeGroupName;
            adaptedCombo.paidGroupName = combo.paidGroupName;
            // Datos de validación de límites
            adaptedCombo.freeExceedsLimits = combo.freeExceedsLimits;
            adaptedCombo.freeLimitMessage = combo.freeLimitMessage;
            adaptedCombo.paidExceedsLimits = combo.paidExceedsLimits;
            adaptedCombo.paidLimitMessage = combo.paidLimitMessage;
          }
          
          return adaptedCombo;
        });
        
        setShippingCombinations(adaptedCombinations);
        setStatus({ loading: false, error: null, noOptions: false });
        
        // Notificar al componente padre
        if (onCombinationsCalculated) {
          stableOnCombinationsCalculated(adaptedCombinations);
        }
        
        // Verificar si la opción previamente seleccionada sigue siendo válida
        if (selectedOptionId) {
          const isCurrentSelectionValid = adaptedCombinations.some(option => option.id === selectedOptionId);
          
          if (!isCurrentSelectionValid && adaptedCombinations.length > 0) {
            // Seleccionar automáticamente la primera opción
            stableOnOptionSelect(adaptedCombinations[0]);
          }
        } 
        // Si no hay selección previa, seleccionar la primera opción automáticamente
        else if (adaptedCombinations.length > 0) {
          stableOnOptionSelect(adaptedCombinations[0]);
        }

        // Marcar que ya hemos procesado el carrito
        processedRef.current = true;
      } catch (err) {
        console.error('Error al calcular opciones de envío:', err);
        setStatus({ 
          loading: false, 
          error: 'Error al calcular opciones de envío: ' + (err.message || 'Error desconocido'), 
          noOptions: true, 
          debug: err 
        });
        
        // Notificar al componente padre
        if (onCombinationsCalculated) {
          stableOnCombinationsCalculated([]);
        }
      }
    };
    
    processCart();
  }, [
    cartItems, 
    userAddress, 
    stableOnCombinationsCalculated, 
    stableOnOptionSelect, 
    selectedOptionId,
    shippingRules
  ]);
  
  // Función para manejar la selección de una opción
  const handleOptionSelect = useCallback((option) => {
    if (option) {
      stableOnOptionSelect(option);
    }
  }, [stableOnOptionSelect]);
  
  // Renderizar componente
  return (
    <div className="shipping-group-selector">
      {status.loading ? (
        <div className="shipping-selector__loading">
          <p>Calculando opciones de envío...</p>
        </div>
      ) : status.error ? (
        <div className="shipping-selector__error">
          <p>{status.error}</p>
        </div>
      ) : shippingCombinations.length === 0 ? (
        <div className="shipping-selector__no-options">
          <p>No hay opciones de envío disponibles para tu dirección.</p>
        </div>
      ) : (
        <div className="shipping-options-list">
          {/* Mostrar todas las opciones o solo las 3 primeras */}
          {(showAllOptions 
            ? shippingCombinations 
            : shippingCombinations.slice(0, 3)).map((option) => (
            <div 
              key={option.id}
              className={`shipping-option ${selectedOptionId === option.id ? 'shipping-option--selected' : ''}`}
              onClick={() => handleOptionSelect(option)}
            >
              <div className="shipping-option__radio">
                <input 
                  type="radio" 
                  checked={selectedOptionId === option.id} 
                  onChange={() => handleOptionSelect(option)}
                />
              </div>
              
              <div className="shipping-option__content">
                <div className="shipping-option__header">
                  <h4 className="shipping-option__title">
                    {option.description || option.ruleName}
                    {option.isRecommended && (
                      <span style={{ 
                        marginLeft: '8px', 
                        backgroundColor: '#4CAF50', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '3px', 
                        fontSize: '0.7rem' 
                      }}>
                        RECOMENDADO
                      </span>
                    )}
                  </h4>
                  <span className="shipping-option__price">
                    {option.totalPrice === 0 ? 'Gratis' : `$${parseFloat(option.totalPrice).toFixed(2)}`}
                  </span>
                </div>
                
                <div className="shipping-option__details">
                  <p className="shipping-option__carrier">
                    {option.carrier}
                  </p>
                  <p className="shipping-option__delivery-time">
                    {option.deliveryTime}
                  </p>
                  
                  {/* Mostrar información de envío gratuito si aplica */}
                  {option.totalPrice === 0 && option.option && option.option.freeReason && (
                    <p className="shipping-option__free-reason">
                      <span style={{ color: '#4CAF50', fontSize: '0.85rem' }}>
                        <i className="bi bi-check-circle-fill" style={{ marginRight: '4px' }}></i>
                        {option.option.freeReason}
                      </span>
                    </p>
                  )}
                  
                  {/* Mostrar información de peso y productos si está disponible */}
                  {option.selections && option.selections[0] && (
                    <div className="shipping-option__metrics" style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                      {option.groupSubtotal && (
                        <span style={{ marginRight: '10px' }}>
                          Subtotal: ${option.groupSubtotal.toFixed(2)}
                        </span>
                      )}
                      {option.productCount && (
                        <span style={{ marginRight: '10px' }}>
                          {option.productCount} {option.productCount === 1 ? 'producto' : 'productos'}
                        </span>
                      )}
                      {option.totalWeight && (
                        <span>
                          Peso: {option.totalWeight.toFixed(2)}kg
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Mostrar advertencia sobre límites excedidos si es necesario */}
                  {(option.paidExceedsLimits || option.freeExceedsLimits) && (
                    <p className="shipping-option__warning" style={{ color: '#FF9800', fontSize: '0.85rem', marginTop: '5px' }}>
                      <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '4px' }}></i>
                      {option.paidLimitMessage || option.freeLimitMessage || 'Puede requerir embalaje especial'}
                    </p>
                  )}
                  
                  {/* Mostrar lista de productos incluidos */}
                  <ProductsList 
                    products={option.selections[0]?.products} 
                    isMixed={option.isMixed}
                    freeProducts={option.freeProducts}
                    paidProducts={option.paidProducts}
                    isFreeGroup={option.isFreeGroup}
                    freeGroupName={option.freeGroupName}
                    paidGroupName={option.paidGroupName}
                    // Pasar información adicional para grupos mixtos
                    freeProductsCount={option.freeProductsCount}
                    paidProductsCount={option.paidProductsCount}
                    freeProductsWeight={option.freeProductsWeight}
                    paidProductsWeight={option.paidProductsWeight}
                    freeGroupSubtotal={option.freeGroupSubtotal}
                    paidGroupSubtotal={option.paidGroupSubtotal}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Botón "Ver más opciones" si hay más de 3 opciones */}
          {!showAllOptions && shippingCombinations.length > 3 && (
            <div 
              className="shipping-options-more"
              style={{
                textAlign: 'center',
                padding: '10px',
                marginTop: '10px'
              }}
            >
              <button 
                onClick={() => setShowAllOptions(true)}
                style={{
                  padding: '5px 15px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Ver {shippingCombinations.length - 3} opciones más
              </button>
            </div>
          )}
          
          {/* Botón "Ver menos opciones" si se están mostrando todas */}
          {showAllOptions && shippingCombinations.length > 3 && (
            <div 
              className="shipping-options-less"
              style={{
                textAlign: 'center',
                padding: '10px',
                marginTop: '10px'
              }}
            >
              <button 
                onClick={() => setShowAllOptions(false)}
                style={{
                  padding: '5px 15px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Ver menos opciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShippingGroupSelector; 