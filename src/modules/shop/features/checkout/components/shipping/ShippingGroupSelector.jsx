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
 * @param {boolean} props.filterOnlyComplete - Si es true, solo muestra opciones que cubren todos los productos
 * @param {boolean} props.groupByZone - Si es true, agrupa las opciones por zona de envío
 */
const ShippingGroupSelector = ({ 
  cartItems = [], 
  onOptionSelect = () => {}, 
  selectedOptionId = '',
  selectedOptionDesc = '',
  userAddress = null,
  onCombinationsCalculated = () => {},
  shippingRules = [],
  filterOnlyComplete = false,
  groupByZone = false
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
  
  // Estado para las opciones agrupadas por zona
  const [zoneGroups, setZoneGroups] = useState({});
  
  // Estado para manejar errores inesperados durante el renderizado
  const [renderError, setRenderError] = useState(null);
  
  // Manejador de errores para capturar problemas durante el renderizado
  useEffect(() => {
    const handleError = (error) => {
      console.error('❌ Error inesperado en ShippingGroupSelector:', error);
      setRenderError(error.message || 'Error inesperado al procesar opciones de envío');
      
      // Notificar al componente padre que no hay combinaciones válidas
      if (onCombinationsCalculated) {
        onCombinationsCalculated([]);
      }
    };
    
    // Agregar listener global para errores (respaldo)
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [onCombinationsCalculated]);
  
  // Función para renderizar una opción de envío
  const renderShippingOption = (option) => {
    try {
      if (!option) return null;
      
      // Determinar si esta opción está seleccionada
      const isSelected = option.id === selectedOptionId;
      
      // Obtener el precio
      const optionPrice = option.totalPrice || option.option?.price || 0;
      
      // Obtener información del transportista
      const carrier = option.carrier || option.option?.name || 'Servicio de envío';
      
      // Obtener información del tiempo de entrega
      const deliveryTime = option.deliveryTime || option.option?.estimatedDelivery || '3-5 días';
      
      // Determinar si cubre todos los productos
      const coversAll = option.coversAllProducts || option.allProductsCovered || false;
      
      // Verificar si hay productos en la opción
      let productsList = [];
      
      // Intentar obtener productos de diferentes fuentes posibles
      if (option.products && option.products.length > 0) {
        productsList = option.products;
      } else if (option.selections && option.selections.length > 0) {
        // Si tiene selecciones, obtener productos de todas las selecciones
        option.selections.forEach(selection => {
          if (selection && selection.products) {
            productsList = [...productsList, ...selection.products];
          }
        });
      }
      
      // Para opciones combinadas
      const isCombinedOption = option.isMultiOption || option.isMixed || 
                              (option.selections && option.selections.length > 1);
      
      return (
        <div 
          key={option.id} 
          className={`shipping-option ${isSelected ? 'shipping-option--selected' : ''} ${!coversAll ? 'shipping-option--incomplete' : ''}`}
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '15px',
            backgroundColor: isSelected ? '#f8f9fa' : 'white',
            borderColor: isSelected ? '#007bff' : (coversAll ? '#e0e0e0' : '#ffc107'),
            position: 'relative',
            transition: 'all 0.2s ease',
          }}
        >
          <div 
            className="shipping-option__select-area"
            onClick={() => handleOptionSelect(option)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            <div className="shipping-option__selector" style={{ marginRight: '15px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid ' + (isSelected ? '#007bff' : '#adb5bd'),
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {isSelected && (
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#007bff'
                  }}></div>
                )}
              </div>
            </div>
                
            <div className="shipping-option__content" style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <h5 style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>
                    {isCombinedOption ? 'Combinación de servicios' : option.description || option.ruleName}
                    
                    {!coversAll && (
                      <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.7rem', verticalAlign: 'middle' }}>
                        Parcial
                      </span>
                    )}
                    
                    {option.isAutoGenerated && (
                      <span className="badge bg-info text-white ms-2" style={{ fontSize: '0.7rem', verticalAlign: 'middle' }}>
                        Optimizado
                      </span>
                    )}
                  </h5>
                </div>
                
                <div className="shipping-option__price">
                  {optionPrice === 0 ? (
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>Gratis</span>
                  ) : (
                    <span style={{ fontWeight: 'bold' }}>${optionPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>
              
              <div className="shipping-option__details">
                <p className="shipping-option__carrier">
                  {isCombinedOption ? 'Servicios combinados' : carrier}
                </p>
                <p className="shipping-option__delivery-time">
                  {deliveryTime}
                </p>
                
                {/* Mostrar información de envío gratuito si aplica */}
                {optionPrice === 0 && option.option && option.option.freeReason && (
                  <p className="shipping-option__free-reason">
                    <span style={{ color: '#4CAF50', fontSize: '0.85rem' }}>
                      <i className="bi bi-check-circle-fill me-1"></i>
                      {option.option.freeReason}
                    </span>
                  </p>
                )}
                
                {/* Mostrar resumen de productos */}
                <div className="shipping-option__products mt-2">
                  <p style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                    <i className="bi bi-box me-1"></i>
                    Productos incluidos:
                  </p>
                  
                  {/* Para opciones combinadas que tienen zonas individuales */}
                  {isCombinedOption && option.combinedZones ? (
                    // Mostrar productos por zona
                    <div className="shipping-option__zones">
                      {option.combinedZones.map((zone, zIndex) => (
                        <div key={`zone-${zIndex}`} className="shipping-option__zone mb-2">
                          <p style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                            <strong>{zone.name || 'Zona'}:</strong>
                            {zone.price === 0 ? (
                              <span className="ms-2" style={{ color: '#28a745' }}>Gratis</span>
                            ) : (
                              <span className="ms-2">${zone.price.toFixed(2)}</span>
                            )}
                          </p>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.8rem' }}>
                            {zone.products && zone.products.map((item, pIndex) => (
                              <li key={`zone-${zIndex}-product-${pIndex}`} style={{ marginLeft: '1rem' }}>
                                {item.product?.name || item.name || 'Producto'}
                                {item.quantity > 1 && <span className="ms-1">x{item.quantity}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : isCombinedOption && option.selections ? (
                    // Mostrar productos por selecciones
                    <div className="shipping-option__selections">
                      {option.selections.map((selection, index) => (
                        <div key={`selection-${index}`} className="shipping-option__selection mb-2">
                          <p style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                            <strong>{selection.ruleName || 'Servicio'} {index + 1}:</strong>
                            {selection.option?.price === 0 ? (
                              <span className="ms-2" style={{ color: '#28a745' }}>Gratis</span>
                            ) : (
                              <span className="ms-2">${(selection.option?.price || 0).toFixed(2)}</span>
                            )}
                          </p>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.8rem' }}>
                            {selection.products && selection.products.map((item, pIndex) => (
                              <li key={`selection-${index}-product-${pIndex}`} style={{ marginLeft: '1rem' }}>
                                {item.product?.name || item.name || 'Producto'}
                                {item.quantity > 1 && <span className="ms-1">x{item.quantity}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : option.freeProducts && option.paidProducts ? (
                    // Mostrar productos agrupados por gratuitos y pagados
                    <div className="shipping-option__mixed-products">
                      {/* Productos gratuitos */}
                      <div className="shipping-option__free-products mb-2">
                        <p style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                          <strong>{option.freeGroupName || 'Local'}:</strong>
                          <span className="ms-2" style={{ color: '#28a745' }}>Gratis</span>
                        </p>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.8rem' }}>
                          {option.freeProducts.map((item, index) => (
                            <li key={`free-product-${index}`} style={{ marginLeft: '1rem' }}>
                              {item.product?.name || item.name || 'Producto'}
                              {item.quantity > 1 && <span className="ms-1">x{item.quantity}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Productos pagados */}
                      <div className="shipping-option__paid-products">
                        <p style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                          <strong>{option.paidGroupName || 'Nacional'}:</strong>
                          <span className="ms-2">
                            ${(option.paidPrice || 0).toFixed(2)}
                          </span>
                        </p>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.8rem' }}>
                          {option.paidProducts.map((item, index) => (
                            <li key={`paid-product-${index}`} style={{ marginLeft: '1rem' }}>
                              {item.product?.name || item.name || 'Producto'}
                              {item.quantity > 1 && <span className="ms-1">x{item.quantity}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    // Mostrar lista simple de productos
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.8rem' }}>
                      {productsList.map((item, index) => (
                        <li key={`product-${index}`}>
                          {item.product?.name || item.name || 'Producto'}
                          {item.quantity > 1 && <span className="ms-1">x{item.quantity}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Botón de selección explícito */}
          <div className="shipping-option__select-button mt-2" style={{ textAlign: 'right' }}>
            <button 
              onClick={() => handleOptionSelect(option)}
              style={{
                backgroundColor: isSelected ? '#007bff' : '#f8f9fa',
                color: isSelected ? 'white' : 'black',
                border: `1px solid ${isSelected ? '#007bff' : '#ccc'}`,
                borderRadius: '3px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {isSelected ? 'Seleccionado' : 'Seleccionar'}
            </button>
          </div>
          
          {/* Indicador de cobertura en la parte inferior */}
          {!coversAll && (
            <div className="shipping-option__coverage-warning mt-2" style={{ fontSize: '0.85rem', color: '#856404' }}>
              <i className="bi bi-exclamation-triangle-fill me-1"></i>
              Esta opción no cubre todos los productos de tu carrito.
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error('Error rendering shipping option:', error);
      return (
        <div className="shipping-option shipping-option--error" style={{
          border: '1px solid #f8d7da',
          borderRadius: '5px',
          padding: '15px',
          marginBottom: '15px',
          backgroundColor: '#f8d7da',
        }}>
          <p style={{ color: '#721c24' }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Error al mostrar esta opción de envío. 
          </p>
        </div>
      );
    }
  };
  
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
  
  /**
   * Función para organizar las combinaciones por zonas de envío
   */
  const organizeOptionsByZone = useCallback((combinations) => {
    if (!combinations || combinations.length === 0) return {};
    
    // Mapa para agrupar las opciones por zona
    const zones = {};
    
    // Identificar opciones por tipo de zona
    combinations.forEach(option => {
      // Obtener la zona del envío
      let zoneName = option.ruleName;
      
      // Si es una opción mixta o combinada, puede tener un nombre especial
      if (option.isMultiOption || option.isMixed || option.isOptimalCombination) {
        zoneName = option.description || 'Combinado';
      }
      
      // Para las opciones combinadas específicas, crear una zona "Combinada"
      if (option.selections && option.selections.length > 1) {
        zoneName = 'Combinado';
      }
      
      // Normalizar los nombres de zonas comunes
      if (zoneName.includes('Local')) zoneName = 'Local';
      if (zoneName.includes('Nacional')) zoneName = 'Nacional';
      
      // Crear la zona si no existe
      if (!zones[zoneName]) {
        zones[zoneName] = {
          name: zoneName,
          options: [],
          completeOptions: [], // Opciones que cubren todos los productos
          partialOptions: []   // Opciones que cubren solo algunos productos
        };
      }
      
      // Verificar si la opción cubre todos los productos
      const coversAll = option.coversAllProducts || option.allProductsCovered || false;
      
      // Agregar la opción a la zona
      zones[zoneName].options.push(option);
      
      // También clasificarla según si cubre todos los productos o no
      if (coversAll) {
        zones[zoneName].completeOptions.push(option);
      } else {
        zones[zoneName].partialOptions.push(option);
      }
    });
    
    // Crear una zona combinada si tenemos zonas separadas que no cubren todos los productos
    if (Object.keys(zones).length > 1) {
      const hasMultiZone = Object.values(zones).some(zone => 
        zone.name !== 'Combinado' && zone.partialOptions.length > 0
      );
      
      // Si tenemos zonas parciales, necesitamos crear combinaciones automáticas
      if (hasMultiZone && !zones['Combinado']) {
        // Encontrar productos no cubiertos
        const zonesToCombine = Object.values(zones)
          .filter(zone => zone.name !== 'Combinado' && zone.partialOptions.length > 0)
          .map(zone => zone.partialOptions[0]); // Tomar la primera opción parcial de cada zona
        
        if (zonesToCombine.length > 1) {
          console.log(`🔄 Creando combinación automática de ${zonesToCombine.length} zonas`);
          
          // Calcular precio total combinado
          const totalPrice = zonesToCombine.reduce((sum, option) => 
            sum + (option.totalPrice || option.option?.price || 0), 0
          );
          
          // Verificar si esta combinación cubre todos los productos
          const combinedProducts = new Set();
          zonesToCombine.forEach(option => {
            if (option.products) {
              option.products.forEach(item => {
                combinedProducts.add(item.product?.id || item.id);
              });
            }
          });
          
          const allProductIds = new Set(cartItems.map(item => item.product?.id || item.id));
          const allCovered = Array.from(allProductIds).every(id => combinedProducts.has(id));
          
          if (allCovered) {
            console.log(`✅ La combinación automática cubre todos los productos`);
            
            // Crear la combinación automática
            const autoCombo = {
              id: `auto-combo-${Date.now()}`,
              description: `Combinación Optimizada`,
              totalPrice: totalPrice,
              isFreeShipping: totalPrice === 0,
              carrier: 'Servicio Combinado',
              deliveryTime: 'Variable según productos',
              isMultiOption: true,
              isAutoGenerated: true,
              coversAllProducts: true,
              allProductsCovered: true,
              selections: zonesToCombine.map(option => ({
                option: option.option || {
                  name: option.ruleName || 'Servicio de envío',
                  price: option.totalPrice || 0,
                },
                products: option.products || [],
                groupId: option.ruleId || option.id,
                ruleName: option.ruleName || option.description,
              })),
              // Incluir detalles de cada zona combinada para mostrar en la UI
              combinedZones: zonesToCombine.map(option => ({
                name: option.ruleName,
                price: option.totalPrice || option.option?.price || 0,
                products: option.products || []
              }))
            };
            
            // Crear o actualizar la zona "Combinado"
            if (!zones['Combinado']) {
              zones['Combinado'] = {
                name: 'Combinado',
                options: [autoCombo],
                completeOptions: [autoCombo],
                partialOptions: []
              };
            } else {
              zones['Combinado'].options.push(autoCombo);
              zones['Combinado'].completeOptions.push(autoCombo);
            }
          }
        }
      }
    }
    
    // Ordenar las opciones dentro de cada zona por precio
    Object.values(zones).forEach(zone => {
      zone.options.sort((a, b) => {
        // Primero por cobertura completa
        if (a.coversAllProducts && !b.coversAllProducts) return -1;
        if (!a.coversAllProducts && b.coversAllProducts) return 1;
        
        // Luego por precio
        const aPrice = a.totalPrice || a.option?.price || 0;
        const bPrice = b.totalPrice || b.option?.price || 0;
        return aPrice - bPrice;
      });
      
      // También ordenar las listas específicas
      zone.completeOptions.sort((a, b) => {
        const aPrice = a.totalPrice || a.option?.price || 0;
        const bPrice = b.totalPrice || b.option?.price || 0;
        return aPrice - bPrice;
      });
      
      zone.partialOptions.sort((a, b) => {
        const aPrice = a.totalPrice || a.option?.price || 0;
        const bPrice = b.totalPrice || b.option?.price || 0;
        return aPrice - bPrice;
      });
    });
    
    return zones;
  }, [cartItems]);
  
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
          availableRules,
          cartItems // pasar los items del carrito para mejor cálculo de combinaciones
        );
        
        // Si se solicita filtrar solo para mostrar opciones completas
        let displayCombinations = combinations;
        if (filterOnlyComplete) {
          // Filtrar sólo las combinaciones que cubren todos los productos
          displayCombinations = combinations.filter(option => 
            option.allProductsCovered === true || option.coversAllProducts === true
          );
          
          console.log(`🔄 Filtrando opciones: ${combinations.length} totales, ${displayCombinations.length} válidas que cubren todo`);
          
          // Si no hay opciones válidas, pero hay opciones parciales, intentar crear combinaciones óptimas
          if (displayCombinations.length === 0 && combinations.length > 0) {
            console.log('🔄 No hay opciones que cubran todos los productos. Intentando crear combinaciones óptimas...');
            
            // Algoritmo para crear combinaciones óptimas entre las opciones disponibles
            const allProductIds = new Set(cartItems.map(item => item.product?.id || item.id));
            console.log(`📦 Total productos a cubrir: ${allProductIds.size}`);
            
            // Crear un mapa para llevar registro de qué productos están cubiertos por cada combinación
            const combinationsCoverage = combinations.map(combo => {
              const coveredIds = new Set();
              if (combo.products) {
                combo.products.forEach(item => {
                  coveredIds.add(item.product?.id || item.id);
                });
              } else if (combo.selections) {
                combo.selections.forEach(selection => {
                  if (selection.products) {
                    selection.products.forEach(item => {
                      coveredIds.add(item.product?.id || item.id);
                    });
                  }
                });
              }
              
              return {
                combination: combo,
                coveredIds: coveredIds,
                price: combo.option?.price || combo.totalPrice || 0,
                isFree: combo.option?.isFree || combo.isFreeShipping || false
              };
            });
            
            // Ordenar por precio (menor a mayor) para priorizar opciones económicas
            combinationsCoverage.sort((a, b) => {
              // Primero opciones gratuitas
              if (a.isFree && !b.isFree) return -1;
              if (!a.isFree && b.isFree) return 1;
              // Luego por precio
              return a.price - b.price;
            });
            
            // Algoritmo greedy para encontrar la combinación de opciones más económica
            // que cubra todos los productos
            const optimalCombinations = [];
            const remainingProducts = new Set(allProductIds);
            
            // Primero, ver si alguna combinación cubre todos los productos
            for (const coverageInfo of combinationsCoverage) {
              if (coverageInfo.coveredIds.size === allProductIds.size) {
                // Si esta combinación ya cubre todos los productos
                const allCovered = Array.from(allProductIds).every(id => 
                  coverageInfo.coveredIds.has(id)
                );
                
                if (allCovered) {
                  console.log(`✅ Encontrada combinación que cubre todos los productos: ${coverageInfo.combination.id}`);
                  optimalCombinations.push(coverageInfo.combination);
                  break;
                }
              }
            }
            
            // Si no encontramos una combinación que cubra todo, buscar la combinación óptima
            if (optimalCombinations.length === 0) {
              console.log('🔄 Buscando combinación óptima entre múltiples opciones...');
              
              // Empezar con la mejor opción
              let bestCoverageIndex = 0;
              let bestCoverageCount = 0;
              
              for (let i = 0; i < combinationsCoverage.length; i++) {
                const coverage = combinationsCoverage[i];
                const coverageCount = Array.from(coverage.coveredIds).filter(id => 
                  remainingProducts.has(id)
                ).length;
                
                if (coverageCount > bestCoverageCount) {
                  bestCoverageCount = coverageCount;
                  bestCoverageIndex = i;
                }
              }
              
              // Añadir la mejor combinación
              const bestCombination = combinationsCoverage[bestCoverageIndex];
              optimalCombinations.push(bestCombination.combination);
              
              // Eliminar productos ya cubiertos
              bestCombination.coveredIds.forEach(id => remainingProducts.delete(id));
              
              // Seguir buscando hasta cubrir todos los productos
              while (remainingProducts.size > 0 && optimalCombinations.length < 3) {
                // Buscar la siguiente mejor opción
                let nextBestCoverageIndex = -1;
                let nextBestCoverageCount = 0;
                
                for (let i = 0; i < combinationsCoverage.length; i++) {
                  const coverage = combinationsCoverage[i];
                  // No repetir combinaciones ya seleccionadas
                  if (optimalCombinations.includes(coverage.combination)) continue;
                  
                  const coverageCount = Array.from(coverage.coveredIds).filter(id => 
                    remainingProducts.has(id)
                  ).length;
                  
                  if (coverageCount > nextBestCoverageCount) {
                    nextBestCoverageCount = coverageCount;
                    nextBestCoverageIndex = i;
                  }
                }
                
                if (nextBestCoverageIndex === -1 || nextBestCoverageCount === 0) {
                  // No se encontraron más opciones que cubran productos restantes
                  break;
                }
                
                // Añadir la siguiente mejor combinación
                const nextBestCombination = combinationsCoverage[nextBestCoverageIndex];
                optimalCombinations.push(nextBestCombination.combination);
                
                // Eliminar productos ya cubiertos
                nextBestCombination.coveredIds.forEach(id => remainingProducts.delete(id));
              }
              
              // Verificar si hemos cubierto todos los productos
              if (remainingProducts.size === 0) {
                console.log(`✅ Encontrada combinación óptima con ${optimalCombinations.length} opciones`);
                
                // Crear una combinación personalizada que incluya todas las opciones óptimas
                const totalPrice = optimalCombinations.reduce((sum, combo) => 
                  sum + (combo.option?.price || combo.totalPrice || 0), 0
                );
                
                // Crear una nueva combinación "multi" que representa la combinación óptima
                const multiOptionCombination = {
                  id: `multi-option-${Date.now()}`,
                  description: `Combinación óptima (${optimalCombinations.length} servicios)`,
                  selections: optimalCombinations.map(combo => ({
                    option: combo.option,
                    products: combo.products,
                    groupId: combo.ruleId || combo.id,
                    ruleName: combo.ruleName || combo.description,
                  })),
                  totalPrice: totalPrice,
                  isFreeShipping: totalPrice === 0,
                  isMultiOption: true,
                  coversAllProducts: true,
                  allProductsCovered: true,
                  optimalCombination: true
                };
                
                // Añadir esta combinación personalizada a las opciones a mostrar
                displayCombinations = [multiOptionCombination];
              } else {
                console.log(`⚠️ No se pudieron cubrir todos los productos. Productos restantes: ${remainingProducts.size}`);
              }
            }
          }
        }
        
        // Guardar las combinaciones en el estado local
        setShippingCombinations(displayCombinations);
        
        // Para diagnóstico: guardar en localStorage temporal
        try {
          localStorage.setItem('__DIAGNOSTICS_SHIPPING_COMBINATIONS', 
            JSON.stringify(displayCombinations.slice(0, 5))
          );
        } catch (e) {
          console.warn('No se pudo guardar diagnóstico en localStorage');
        }
        
        // Notificar al componente padre sobre las combinaciones calculadas
        if (onCombinationsCalculated) {
          stableOnCombinationsCalculated(displayCombinations);
        }
        
        // Actualizar estado
        setStatus(prevStatus => ({ 
          ...prevStatus, 
          loading: false,
          noOptions: displayCombinations.length === 0 
        }));
        
        // Si no hay opciones disponibles, mostrar mensaje
        if (displayCombinations.length === 0) {
          console.log('⚠️ No hay opciones de envío disponibles para esta dirección');
          setStatus(prevStatus => ({ 
            ...prevStatus, 
            error: 'No hay opciones de envío disponibles para esta dirección o que cubran todos tus productos'
          }));
        } else {
          console.log(`✅ ${displayCombinations.length} opciones disponibles`);
        }
        
        // Marcar como procesado
        processedRef.current = true;
        
      } catch (error) {
        console.error('❌ Error al calcular opciones de envío:', error);
        setStatus({ 
          loading: false, 
          error: `Error al calcular opciones de envío: ${error.message}`,
          noOptions: true
        });
      }
    };
    
    processCart();
  }, [userAddress, cartItems, shippingRules, filterOnlyComplete]);
  
  // Efecto para procesar combinaciones cuando cambian
  useEffect(() => {
    if (groupByZone && shippingCombinations.length > 0) {
      const groupedOptions = organizeOptionsByZone(shippingCombinations);
      setZoneGroups(groupedOptions);
      console.log('📊 Opciones agrupadas por zona:', groupedOptions);
    }
  }, [shippingCombinations, groupByZone, organizeOptionsByZone]);
  
  // Función para renderizar un grupo de opciones de envío
  const renderZoneGroup = (zone) => {
    if (!zone || !zone.options || zone.options.length === 0) return null;
    
    // Determinar qué opciones mostrar
    const optionsToShow = filterOnlyComplete ? zone.completeOptions : zone.options;
    
    if (optionsToShow.length === 0) return null;
    
    return (
      <div className="shipping-zone-group mb-4" key={zone.name}>
        <h4 className="shipping-zone-title mb-3">
          <i className={`bi ${zone.name === 'Local' ? 'bi-geo-alt' : zone.name === 'Nacional' ? 'bi-globe' : 'bi-box-seam'} me-2`}></i>
          Envío {zone.name}
          {zone.name === 'Combinado' && (
            <span className="badge bg-info text-white ms-2" style={{ fontSize: '0.7rem' }}>
              Optimizado
            </span>
          )}
        </h4>
        
        <div className="shipping-zone-options">
          {optionsToShow.map(option => renderShippingOption(option))}
        </div>
      </div>
    );
  };
  
  // Función para manejar la selección de una opción
  const handleOptionSelect = useCallback((option) => {
    if (option) {
      stableOnOptionSelect(option);
    }
  }, [stableOnOptionSelect]);
  
  // Renderizar componente con la nueva interfaz por zonas
  if (renderError) {
    return (
      <div className="shipping-selector__error">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Error inesperado:</strong> {renderError}
        </div>
        <p className="mt-3">Por favor, intenta seleccionar otra dirección o contacta a soporte técnico.</p>
      </div>
    );
  }
  
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
      ) : groupByZone ? (
        // Mostrar por zonas
        <div className="shipping-zones-container">
          {Object.values(zoneGroups).map(zone => renderZoneGroup(zone))}
          
          {/* Si hay opción combinada que cubre todos los productos, mostrar recomendación */}
          {zoneGroups['Combinado'] && zoneGroups['Combinado'].completeOptions.length > 0 && (
            <div className="alert alert-success mt-3">
              <i className="bi bi-check-circle-fill me-2"></i>
              <strong>Recomendación:</strong> Hemos creado una combinación de envío que cubre todos tus productos de manera óptima.
            </div>
          )}
        </div>
      ) : (
        // Mostrar lista plana tradicional
        <div className="shipping-options-list">
          {/* Usar el método de renderizado seguro para cada opción */}
          {(showAllOptions 
            ? shippingCombinations 
            : shippingCombinations.slice(0, 3)).map(option => renderShippingOption(option))}
          
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