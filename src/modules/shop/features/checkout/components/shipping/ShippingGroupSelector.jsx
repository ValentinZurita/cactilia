import React, { useEffect, useState, useRef } from 'react';
import { getShippingOptions } from '../../services/shipping/ShippingService';
import './ShippingGroupSelector.css';

/**
 * Componente para seleccionar grupos de envío
 * Muestra opciones de envío agrupadas por zona y tipo
 */
const ShippingGroupSelector = ({
  cartItems,
  onOptionSelect,
  selectedOptionId,
  userAddress,
  shippingOptions = []
}) => {
  // Estado para opciones de envío agrupadas
  const [groupedOptions, setGroupedOptions] = useState([]);
  // Estado para manejo de errores
  const [error, setError] = useState(null);
  // Estado para indicar carga
  const [loading, setLoading] = useState(false);
  // Ref para controlar si ya procesamos opciones nacionales
  const nationalOptionsProcessedRef = useRef(false);
  
  // Función para cargar opciones nacionales independientes
  useEffect(() => {
    // Intentar cargar opciones nacionales de localStorage al inicio
    try {
      const savedNationalOptions = localStorage.getItem('nationalShippingOptions');
      if (savedNationalOptions) {
        const parsedOptions = JSON.parse(savedNationalOptions);
        if (parsedOptions && parsedOptions.length > 0) {
          console.log(`🔄 Cargando ${parsedOptions.length} opciones nacionales desde localStorage`);
          nationalOptionsProcessedRef.current = true;
        }
      }
    } catch (e) {
      console.error('Error al cargar opciones nacionales desde localStorage:', e);
    }
  }, []);
  
  // Cargar opciones de envío al montar el componente o cambiar dirección
  useEffect(() => {
    const loadShippingOptions = async () => {
      if (!userAddress || !cartItems || cartItems.length === 0) {
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Si ya tenemos opciones precalculadas, las usamos
        if (shippingOptions && shippingOptions.length > 0) {
          // Desactivar preservación para forzar recálculo
          const preserveNationalOptions = false; // Forzar recálculo siempre
          console.log(`🔍 Procesando opciones de envío nuevas`);
          
          processShippingOptions(shippingOptions, preserveNationalOptions);
        } else {
          // Si no, obtenemos nuevas opciones del servicio
          const options = await getShippingOptions(cartItems, userAddress);
          processShippingOptions(options, false); // Desactivar preservación
        }
      } catch (err) {
        console.error('Error al cargar opciones de envío:', err);
        setError('No pudimos cargar las opciones de envío. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    loadShippingOptions();
  }, [cartItems, userAddress, shippingOptions]);
  
  // Procesar opciones de envío para agruparlas lógicamente
  const processShippingOptions = (options, preserveNationalOptions = false) => {
    if (!options || options.length === 0) {
      setGroupedOptions([]);
      return;
    }
    
    console.log('✅ Procesando opciones de envío:', options);
    
    // Si necesitamos preservar las opciones nacionales, las recuperamos
    let allNationalOptions = [];
    
    // Primero intentar recuperar del estado
    if (preserveNationalOptions) {
      try {
        // Buscar grupo de opciones nacionales en las opciones actuales
        const nationalGroup = groupedOptions.find(group => group.id === 'nacional_direct_shipping');
        if (nationalGroup && nationalGroup.options && nationalGroup.options.length > 0) {
          console.log(`🔒 Preservando ${nationalGroup.options.length} opciones nacionales existentes del estado`);
          allNationalOptions = [...nationalGroup.options];
        } 
        // Si no hay en el estado, intentar cargar desde localStorage
        else {
          const savedNationalOptions = localStorage.getItem('nationalShippingOptions');
          if (savedNationalOptions) {
            const parsedOptions = JSON.parse(savedNationalOptions);
            if (parsedOptions && parsedOptions.length > 0) {
              console.log(`🔒 Cargando ${parsedOptions.length} opciones nacionales desde localStorage`);
              allNationalOptions = parsedOptions;
            }
          }
        }
      } catch (e) {
        console.error('Error al recuperar opciones nacionales:', e);
      }
    }
    
    // Si no estamos preservando o no se encontraron opciones guardadas, extraer nuevas
    if (allNationalOptions.length === 0) {
      console.log('🔍 Extrayendo nuevas opciones nacionales...');
      // Extraer opciones nacionales de las combinaciones
      options.forEach(option => {
        if (option.combination && option.combination.options) {
          // Filtrar opciones nacionales
          const nationalOptions = option.combination.options.filter(opt => 
            (opt.zoneType && opt.zoneType.toLowerCase().includes('nacional')) ||
            (opt.zoneName && opt.zoneName.toLowerCase().includes('nacional') || 
             opt.zoneName && opt.zoneName.toLowerCase().includes('national'))
          );
          
          // Agregar opciones nacionales únicas
          if (nationalOptions.length > 0) {
            nationalOptions.forEach(natOpt => {
              // Solo procesar si tiene información de carrier/label
              if (natOpt.carrierName && natOpt.carrierLabel) {
                // Verificar si ya existe una opción similar
                const existsAlready = allNationalOptions.some(existing => 
                  existing.carrierName === natOpt.carrierName && 
                  existing.carrierLabel === natOpt.carrierLabel
                );
                
                if (!existsAlready) {
                  const standaloneCopy = {
                    ...natOpt,
                    id: `single_national_${natOpt.id || Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    name: `${natOpt.carrierName} - ${natOpt.carrierLabel}`,
                    description: `Servicio de envío nacional ${natOpt.carrierLabel.toLowerCase()}`,
                    type: 'nacional',
                    standalone: true
                  };
                  allNationalOptions.push(standaloneCopy);
                }
              }
            });
          }
        }
      });
      
      // Guardar en localStorage para futuros renders
      if (allNationalOptions.length > 0) {
        try {
          localStorage.setItem('nationalShippingOptions', JSON.stringify(allNationalOptions));
          nationalOptionsProcessedRef.current = true;
          console.log(`💾 Guardadas ${allNationalOptions.length} opciones nacionales en localStorage`);
        } catch (e) {
          console.error('Error al guardar opciones nacionales en localStorage:', e);
        }
      }
    }
    
    console.log(`✅ Tenemos ${allNationalOptions.length} opciones nacionales independientes`);
    
    // Primero, identificamos todos los tipos de zonas disponibles
    const zoneTypes = new Set();
    options.forEach(option => {
      if (option.type) {
        zoneTypes.add(option.type.toLowerCase());
      } else if (option.zoneName) {
        zoneTypes.add(option.zoneName.toLowerCase());
      }
    });
    
    // Usaremos este conjunto para evitar duplicados
    const processedOptionIds = new Set();
    
    // Luego, creamos grupos dinámicos basados en los datos
    const groups = [];
    
    // Primero mostramos las opciones fallback, si existen
    const fallbackOptions = options.filter(option => option.isFallback);
    if (fallbackOptions.length > 0) {
      fallbackOptions.forEach(option => processedOptionIds.add(option.id || option.optionId));
      
      groups.push({
        id: 'fallback_shipping',
        title: 'Opción de Envío',
        subtitle: 'Esta opción garantiza la entrega de todos tus productos',
        options: fallbackOptions,
        icon: 'bi-truck'
      });
    }
    
    // Grupo especial: opciones gratuitas que cubren todos los productos
    const freeOptions = options.filter(option => 
      !option.isFallback &&
      option.price === 0 &&
      (option.combination?.isComplete || option.coversAllProducts) &&
      !processedOptionIds.has(option.id || option.optionId)
    );
    
    if (freeOptions.length > 0) {
      freeOptions.forEach(option => processedOptionIds.add(option.id || option.optionId));
      
      groups.push({
        id: 'free_shipping',
        title: 'Envío gratuito',
        subtitle: 'Todas tus compras sin costo de envío',
        options: freeOptions,
        icon: 'bi-gift'
      });
    }
    
    // Grupos por tipo de zona
    zoneTypes.forEach(zoneType => {
      // Filtrar opciones no gratuitas de este tipo y que no sean fallback
      // y que no hayan sido procesadas ya
      const typeOptions = options.filter(option => {
        const optionId = option.id || option.optionId;
        
        if (option.isFallback || processedOptionIds.has(optionId)) {
          return false;
        }
        
        if ((option.type && option.type.toLowerCase() === zoneType) ||
            (option.zoneName && option.zoneName.toLowerCase() === zoneType)) {
          return true;
        }
        return false;
      });
      
      // Solo añadir si hay opciones
      if (typeOptions.length > 0) {
        typeOptions.forEach(option => processedOptionIds.add(option.id || option.optionId));
        
        // Nombre bonito para el tipo de zona
        let title = '';
        let icon = '';
        let subtitle = '';
        
        if (zoneType.includes('local')) {
          title = 'Envío local';
          subtitle = 'Opciones para productos con envío en tu zona';
          icon = 'bi-pin-map';
        } else if (zoneType.includes('nacional') || zoneType.includes('national')) {
          title = 'Envío nacional';
          subtitle = 'Opciones para productos con envío a nivel nacional';
          icon = 'bi-truck';
        } else if (zoneType.includes('internacional') || zoneType.includes('international')) {
          title = 'Envío internacional';
          subtitle = 'Opciones para envío fuera del país';
          icon = 'bi-globe';
        } else {
          // Si es otro tipo que no reconocemos, usar el nombre directamente
          // Primera letra en mayúscula y resto en minúscula
          const formattedType = zoneType.charAt(0).toUpperCase() + zoneType.slice(1).toLowerCase();
          title = `Envío ${formattedType}`;
          subtitle = `Opciones de envío para servicio ${formattedType}`;
          icon = 'bi-box';
        }
        
        groups.push({
          id: `zone_${zoneType}`,
          title,
          subtitle,
          options: typeOptions,
          icon
        });
      }
    });
    
    // Grupo especial para opciones nacionales extraídas
    if (allNationalOptions.length > 0) {
      groups.push({
        id: 'nacional_direct_shipping',
        title: 'Envío Nacional Directo',
        subtitle: 'Opciones de mensajería disponibles a nivel nacional',
        options: allNationalOptions,
        icon: 'bi-truck',
        priority: 20  // Mayor prioridad = aparece antes
      });
    }
    
    // Grupo especial: combinaciones (opciones que usan múltiples servicios)
    const combinedOptions = options.filter(option => 
      !option.isFallback &&
      !processedOptionIds.has(option.id || option.optionId) &&
      (option.type === 'combined' || 
       (option.combination && option.combination.options && option.combination.options.length > 1))
    );
    
    if (combinedOptions.length > 0) {
      combinedOptions.forEach(option => processedOptionIds.add(option.id || option.optionId));
      
      groups.push({
        id: 'combined_shipping',
        title: 'Combinaciones de envío',
        subtitle: 'Opciones que combinan diferentes métodos para todos tus productos',
        options: combinedOptions,
        icon: 'bi-box-seam',
        priority: 10  // Menor prioridad = aparece después
      });
    }
    
    // Si no logramos agrupar nada, mostrar todas las opciones en un solo grupo
    if (groups.length === 0 && options.length > 0) {
      groups.push({
        id: 'all_options',
        title: 'Todas las opciones de envío',
        subtitle: 'Todos los métodos disponibles para tus productos',
        options: options,
        icon: 'bi-box2'
      });
    }
    
    console.log(`📊 Grupos de opciones de envío generados: ${groups.length}`);
    setGroupedOptions(groups);
  };
  
  // Renderizar opción de envío individual
  const renderShippingOption = (option) => {
    // Preparar clases y estados
    const isSelected = selectedOptionId === option.id || selectedOptionId === option.optionId;
    const cardClasses = `shipping-option-card ${isSelected ? 'selected' : ''}`;
    
    // Calcular propiedades de la opción
    const isFree = option.isFree || option.price === 0;
    const isMultiPackage = option.multiPackage || option.packageCount > 1 || 
                          (option.packages && option.packages.length > 1);
    
    // Normalizar el formato de los paquetes si están en formato alternativo
    if (option.packages && option.packages.length > 0) {
      option.packages.forEach(pkg => {
        // Si el paquete usa 'items' en lugar de 'products', normalizar
        if (pkg.items && !pkg.products) {
          pkg.products = pkg.items;
          // Usar totalQuantity para productCount si está disponible
          if (pkg.totalQuantity && !pkg.productCount) {
            pkg.productCount = pkg.totalQuantity;
          }
        }
        
        // Si el paquete usa 'totalWeight' en lugar de 'packageWeight', normalizar
        if (pkg.totalWeight !== undefined && pkg.packageWeight === undefined) {
          pkg.packageWeight = pkg.totalWeight;
        }
      });
    }

    // Asegurarse de que todos los paquetes tengan datos de productos
    // Este es el paso crucial para corregir los paquetes vacíos
    if (option.packages && option.packages.length > 0) {
      // Si hay paquetes vacíos, pero hay productos en el carrito, distribuir los productos
      const emptyPackages = option.packages.filter(pkg => 
        (!pkg.products || pkg.products.length === 0) && 
        (!pkg.items || pkg.items.length === 0) && 
        pkg.packageWeight === 0 && 
        pkg.totalWeight === 0
      );
      
      if (emptyPackages.length > 0 && cartItems && cartItems.length > 0) {
        console.log('⚠️ Detectados paquetes vacíos, reasignando productos...');
        
        // Distribución simple: un producto por paquete
        cartItems.forEach((item, index) => {
          const packageIndex = index % option.packages.length;
          if (!option.packages[packageIndex].products) {
            option.packages[packageIndex].products = [];
          }
          option.packages[packageIndex].products.push(item);
          
          // Calcular peso del producto
        const product = item.product || item;
          const weight = parseFloat(product.weight || product.peso || 0);
          const quantity = parseInt(item.quantity || 1);
          
          // Actualizar peso del paquete
          option.packages[packageIndex].packageWeight = 
            (option.packages[packageIndex].packageWeight || 0) + (weight * quantity);
        });
      }
    }
    
    // Re-calcular el peso total y cantidad de productos después de la corrección
    const productCount = option.products?.length || 
      (option.packages ? option.packages.reduce((sum, pkg) => sum + (pkg.products?.length || pkg.items?.length || 0), 0) : 0);
    
    const totalWeight = option.totalWeight || 
      (option.packages ? option.packages.reduce((sum, pkg) => sum + (pkg.packageWeight || pkg.totalWeight || 0), 0) : 0);
    
    // Funciones auxiliares para obtener textos de display
    const getDeliveryTimeText = () => {
      const minDays = option.minDays || 3;
      const maxDays = option.maxDays || 7;
      
      if (minDays === maxDays) {
        return `Entrega en ${minDays} días`;
      }
      
      return `Entrega en ${minDays}-${maxDays} días`;
    };
    
    const getOptionDisplayName = () => {
      // Simplificar el nombre si es muy largo
      const name = option.name || 'Opción de envío';
      if (name.length > 25) {
        return `${name.substring(0, 22)}...`;
      }
      return name;
    };
    
    // Renderizar desglose de costos
    const renderCostBreakdown = () => {
      if (!option.costBreakdown) return null;

      return (
        <div className="cost-breakdown mt-2">
          <small>
            <i className="bi bi-receipt me-1"></i>
            <strong>Desglose de costos:</strong>
          </small>
          <ul className="cost-list mt-1 mb-0">
            {option.costBreakdown.map((cost, idx) => (
              <li key={idx}>
                {cost.name}: {cost.isFree ? 'Gratis' : `$${cost.cost.toFixed(2)}`}
                {' '}({cost.totalWeight?.toFixed(2) || 0} kg)
              </li>
            ))}
          </ul>
        </div>
      );
    };

    // Renderizar detalle de productos
    const renderProductDetails = () => {
      if (!option.products && !option.packages) return null;
      
      // Recolectar todos los productos de todos los formatos
      let allProducts = option.products || [];
      
      // Comprobar si tenemos formato de paquetes y extraer productos
      if (option.packages) {
        option.packages.forEach(pkg => {
          // Manejar ambos formatos: 'products' o 'items'
          const packageProducts = pkg.products || pkg.items || [];
          if (packageProducts.length > 0) {
            allProducts = [...allProducts, ...packageProducts];
          }
        });
      }
      
      // Si hay datos disponibles en la propiedad groupInfo, usarlos también
      if (option.groupInfo && option.groupInfo.items && option.groupInfo.items.length > 0) {
        allProducts = [...allProducts, ...option.groupInfo.items];
      }
      
      // Si aún no hay productos, usar los del carrito como último recurso
      if (allProducts.length === 0 && cartItems) {
        allProducts = cartItems;
      }
      
      // Verificar si estamos en modo de 1 producto por paquete
      const isOneProductPerPackage = option.maxProductsPerPackage === 1 || 
                                   (option.packages && option.packages.length === cartItems.length);
      
      // Si es un producto por paquete, no deduplicar - mostrar todos los productos del carrito
      if (isOneProductPerPackage && cartItems && cartItems.length > 0) {
        return (
          <div className="product-details mt-2">
            <small>
              <i className="bi bi-box me-1"></i>
              <strong>Productos incluidos:</strong>
            </small>
            <ul className="products-list mt-1 mb-0">
              {cartItems.map((item, idx) => {
                const product = item.product || item;
                const name = product.name || product.title || `Producto #${product.id}`;
                const weight = parseFloat(product.weight || product.peso || 0);
                return (
                  <li key={idx} className="product-item">
                    {name} ({weight.toFixed(2)} kg)
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }
      
      // Para otros casos, deduplicar productos usando un Map para evitar repeticiones
      const productMap = new Map();
      allProducts.forEach(item => {
        const product = item.product || item;
        const productId = product.id || product.productId;
        if (!productMap.has(productId)) {
          productMap.set(productId, item);
        }
      });
      
      // Convertir Map de productos únicos de nuevo a array
      const uniqueProducts = Array.from(productMap.values());
      
      // Si no hay categorización por peso pero hay productos, mostrar lista básica
      if (!option.costBreakdown?.some(b => b.weightSummary) && uniqueProducts.length > 0) {
        return (
          <div className="product-details mt-2">
            <small>
              <i className="bi bi-box me-1"></i>
              <strong>Productos incluidos:</strong>
            </small>
            <ul className="products-list mt-1 mb-0">
              {uniqueProducts.map((item, idx) => {
                const product = item.product || item;
                const name = product.name || product.title || `Producto #${product.id}`;
                const weight = parseFloat(product.weight || product.peso || 0);
                return (
                  <li key={idx} className="product-item">
                    {name} ({weight.toFixed(2)} kg)
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }
      
      // Si hay categorización por peso, mostrarla
      
      return (
        <div className="product-details mt-2">
          <small>
            <i className="bi bi-box me-1"></i>
            <strong>Contenido del envío:</strong>
          </small>
          <div className="product-weight-summary mt-1">
            {option.costBreakdown?.map((breakdown, idx) => {
              if (!breakdown.weightSummary) return null;
              const { light, medium, heavy } = breakdown.weightSummary;
              return (
                <div key={idx} className="weight-summary">
                  {light.count > 0 && (
                    <span className="weight-tag light">{light.count} productos ligeros ({light.totalWeight.toFixed(2)} kg)</span>
                  )}
                  {medium.count > 0 && (
                    <span className="weight-tag medium">{medium.count} productos medianos ({medium.totalWeight.toFixed(2)} kg)</span>
                  )}
                  {heavy.count > 0 && (
                    <span className="weight-tag heavy">{heavy.count} productos pesados ({heavy.totalWeight.toFixed(2)} kg)</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    };
    
    return (
      <div 
        key={option.id || option.optionId} 
        className={cardClasses}
        onClick={() => onOptionSelect(option)}
      >
        <div className="shipping-option-header">
          <div className="shipping-option-name">
            <i className={isFree ? 'bi bi-gift' : 'bi bi-truck'}></i>
            <span className="shipping-name">{getOptionDisplayName()}</span>
            {isFree && <span className="shipping-tag free">GRATIS</span>}
            {isMultiPackage && <span className="shipping-tag packages">{option.packageCount || 2} paquetes</span>}
          </div>
          <div className="shipping-option-price">
            {!isFree ? 
              <span>${(option.packages && option.packages.length > 0 ? 
                option.packages.reduce((total, pkg) => total + (pkg.price || option.price || 0), 0) : 
                (option.price || option.totalCost || option.calculatedCost || 0)).toFixed(2)}</span> : 
              <span className="text-success">Gratis</span>
            }
          </div>
        </div>
        
        <div className="shipping-option-details">
          <div className="shipping-detail-item">
            <i className="bi bi-clock"></i>
            <span>{getDeliveryTimeText()}</span>
          </div>
          
          {totalWeight > 0 && (
            <div className="shipping-detail-item">
              <i className="bi bi-box"></i>
              <span>Peso total: {totalWeight.toFixed(2)} kg</span>
            </div>
          )}
          
          {productCount > 0 && (
            <div className="shipping-detail-item">
              <i className="bi bi-cart"></i>
              <span>{productCount} productos</span>
            </div>
          )}
        </div>
        
        {renderProductDetails()}
        {renderCostBreakdown()}
        
        {option.packages && option.packages.length > 0 && (
          <div className="shipping-packages">
            <h6 className="packages-title">Detalle de paquetes:</h6>
            {/* Asegurar que cada paquete tenga un precio */}
            {option.packages.forEach(pkg => {
              if (!pkg.price || pkg.price === 0) {
                // Asignar el precio base completo a cada paquete
                pkg.price = option.price;
              }
            })}
            <div className="packages-list">
              {option.packages.map((pkg, idx) => {
                // Calcular peso y número de productos para este paquete
                const pkgProductCount = pkg.productCount || pkg.products?.length || 0;
                const pkgWeight = pkg.packageWeight || 0;
                
                // Modificar la condición que determina cuándo mostrar "Información en proceso"
                // Ahora consideraremos como válido cualquier paquete con peso o productos
                const hasWeight = pkgWeight > 0;
                const hasProducts = pkgProductCount > 0 || (pkg.products && pkg.products.length > 0);
                const hasItems = pkg.items && pkg.items.length > 0; // Para compatibilidad con otro formato
                
                // Solo mostrar como inválido si no tiene NINGUNO de los datos necesarios
                const showInvalidData = !hasWeight && !hasProducts && !hasItems;
                
                // Si no tiene peso pero tiene productos, calcularlo de los productos
                let displayWeight = pkgWeight;
                if (!hasWeight && (hasProducts || hasItems)) {
                  const products = pkg.products || pkg.items || [];
                  displayWeight = products.reduce((sum, item) => {
                    const product = item.product || item;
                    const weight = parseFloat(product.weight || product.peso || 0);
                    const quantity = parseInt(item.quantity || 1);
                    return sum + (weight * quantity);
                  }, 0);
                }
                
                // Si el peso sigue siendo 0, asignar un valor por defecto
                if (displayWeight === 0) {
                  displayWeight = 0.1; // 100g como peso mínimo por defecto
                }
                
                // Usar totalQuantity si está disponible (de otro formato)
                const displayProductCount = pkgProductCount || pkg.totalQuantity || 1;
                
                console.log(`Paquete ${idx + 1}:`, {
                  pkgPrice: pkg.price,
                  optionPrice: option.price,
                  packageCount: option.packages?.length || 1
                });
                
                const displayPrice = (!pkg.price || pkg.price === 0) ? 
                  option.price : // Precio base completo para cada paquete
                  pkg.price;
                
                return (
                  <div key={idx} className="package-item">
                    <div className="package-header">
                      <span className="package-name">Paquete {idx + 1}</span>
                      <span className="package-price">
                        {(() => {
                          console.log(`Paquete ${idx + 1}:`, {
                            pkgPrice: pkg.price,
                            optionPrice: option.price,
                            packageCount: option.packages?.length || 1
                          });
                          
                          // Asegurar que displayPrice nunca es undefined
                          const displayPrice = pkg.isFree ? 0 : (pkg.price || option.price || option.totalCost || option.calculatedCost || 0);
                          return pkg.isFree ? 'Gratis' : `$${displayPrice.toFixed(2)}`;
                        })()}
                      </span>
                    </div>
                    {showInvalidData ? (
                      <div className="package-info-incomplete">
                        <span>Información de envío en proceso</span>
                      </div>
                    ) : (
                      <div className="package-details">
                        <span>{displayProductCount} productos</span>
                        <span>{(displayWeight || 0).toFixed(2)} kg</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          )}
          
          {(option.freeShippingReason || option.freeReason) && (
          <div className="shipping-option-free-reason">
              <small className="text-success">
                <i className="bi bi-info-circle me-1"></i>
                {option.freeShippingReason || option.freeReason}
              </small>
            </div>
          )}
      </div>
    );
  };
  
  // Renderizar un grupo de opciones de envío
  const renderOptionGroup = (group) => {
    if (!group.options || group.options.length === 0) return null;
    
    return (
      <div key={group.id} className="shipping-option-group mb-4">
        <div className="shipping-group-header">
          <h5>
            <i className={`bi ${group.icon || 'bi-box'} me-2`}></i>
            {group.title}
          </h5>
          <p className="text-muted">{group.subtitle}</p>
        </div>
        
        <div className="shipping-options-container">
          {group.options.map(renderShippingOption)}
        </div>
      </div>
    );
  };
  
  // Si estamos cargando, mostrar spinner
  if (loading) {
    return (
      <div className="shipping-options-loading text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando opciones de envío...</span>
        </div>
        <p className="mt-3">Calculando las mejores opciones de envío para tus productos...</p>
      </div>
    );
  }
  
  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }
  
  // Si no hay opciones, mostrar mensaje
  if (!groupedOptions || groupedOptions.length === 0) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-circle-fill me-2"></i>
        No encontramos opciones de envío disponibles para tu dirección.
        Por favor, verifica que tu dirección sea correcta o contacta a servicio al cliente.
      </div>
    );
  }
  
  // Renderizar grupos de opciones
  return (
    <div className="shipping-groups-container">
      {groupedOptions
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))  // Ordenar por prioridad
        .map(renderOptionGroup)}
    </div>
  );
};

export default ShippingGroupSelector; 