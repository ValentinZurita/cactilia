/**
 * Componente para mostrar un paquete de envío individual
 */
import React, { useState } from 'react';
import '../styles/ShippingPackage.css';

/**
 * Componente que muestra un paquete de envío
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.packageData - Datos del paquete
 * @param {boolean} props.selected - Si está seleccionado
 * @param {Array} props.cartItems - Items del carrito para identificar productos incluidos
 */
export const ShippingPackage = ({ packageData, selected = false, cartItems = [] }) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [packagesExpanded, setPackagesExpanded] = useState(false);
  
  if (!packageData) return null;

  // Extraer datos del paquete
  const { 
    name, 
    carrier, 
    serviceType, 
    estimatedDelivery,
    deliveryTime,
    tiempo_entrega,
    totalCost,
    description,
    paquetesInfo,
    products = [],  // IDs de productos en este paquete
    maxProductsPerPackage,
    maxWeightPerPackage,
    rule_id,
    zoneType,
    packagesCount = 1,
    packagesInfo: externalPackagesInfo = [],
    costoExtra = 0,
    price = 0,
    precio_base,
    packagesWithPrices = false, // Indicador de que los paquetes tienen precios individuales calculados
    // Extraer tiempos de los días mínimos y máximos
    minDays,
    maxDays,
    // Datos de la regla original
    opciones_mensajeria,
    configuracion_paquetes
  } = packageData;

  // Debug para ver qué nombre recibe el componente
  console.log(`📦 ShippingPackage recibe nombre: "${name}"`);

  // Obtener detalles de los productos incluidos en este paquete
  const packProducts = cartItems
    .filter(item => {
      const productId = (item.product ? item.product.id : item.id);
      return products.includes(productId);
    })
    .map(item => {
      const product = item.product || item;
      return {
        id: product.id,
        name: product.name || product.nombre || '',
        quantity: item.quantity || 1,
        weight: product.weight || product.peso || 0,
        price: product.price || product.precio || 0
      };
    });
    
  // Calcular la cantidad total de productos incluyendo cantidades
  const totalProductUnits = packProducts.reduce((sum, product) => {
    return sum + product.quantity;
  }, 0);
  
  // Calcular peso total para mostrar en la UI
  const totalWeight = packProducts.reduce((sum, product) => {
    return sum + (parseFloat(product.weight) * product.quantity);
  }, 0).toFixed(2);
  
  // Debug más detallado de la configuración
  console.log(`📦 DEBUG DATOS RECIBIDOS (${name}):`);
  console.log(`- packageData.totalCost = ${totalCost}`);
  console.log(`- packageData.price = ${price}`);
  console.log(`- packageData.rule_id = ${rule_id}`);
  
  // Función auxiliar para calcular el precio de un paquete basado en su peso
  const calculatePackagePrice = (weight) => {
    // Obtener la configuración del paquete
    const config = packageData.configuracion_paquetes || 
                 (packageData.opciones_mensajeria && 
                  packageData.opciones_mensajeria.length > 0 && 
                  packageData.opciones_mensajeria[0].configuracion_paquetes) || 
                 null;
    
    // Debug de la configuración
    console.log(`📦 [DEBUG] Datos de configuración para cálculo de precio:`);
    if (config) {
      console.log(`- Configuración encontrada: peso_maximo_paquete=${config.peso_maximo_paquete}, costo_por_kg_extra=${config.costo_por_kg_extra}`);
    } else {
      console.log(`- SIN CONFIGURACIÓN DE PAQUETES`);
    }
    
    // Obtener el precio base
    let basePrice = 0;
    
    // Primero intentamos obtener de precio_base explícito
    if (packageData.precio_base !== undefined && !isNaN(parseFloat(packageData.precio_base))) {
      basePrice = parseFloat(packageData.precio_base);
      console.log(`📊 [PRECIO] Precio base explícito: $${basePrice}`);
    }
    // Luego de la primera opción de mensajería
    else if (packageData.opciones_mensajeria && 
            packageData.opciones_mensajeria.length > 0 && 
            packageData.opciones_mensajeria[0].precio !== undefined) {
      basePrice = parseFloat(packageData.opciones_mensajeria[0].precio) || 0;
      console.log(`📊 [PRECIO] Precio base de opción de mensajería: $${basePrice}`);
    }
    // Si no hay nada, usar el valor estándar que debería ser 350 según los logs
    else {
      basePrice = 350; // Valor conocido para esta regla de envío
      console.log(`📊 [PRECIO] Usando precio base predeterminado para Nacional: $${basePrice}`);
    }
    
    // Debug log
    console.log(`📋 [PRECIO] Cálculo para paquete - Peso: ${weight}kg, Precio base: $${basePrice}`);
    
    // Solo aplicar sobrecosto si hay configuración con peso máximo y costo por kg extra
    if (config && 
        config.peso_maximo_paquete !== undefined && 
        !isNaN(parseFloat(config.peso_maximo_paquete)) && 
        config.costo_por_kg_extra !== undefined && 
        !isNaN(parseFloat(config.costo_por_kg_extra)) &&
        parseFloat(config.costo_por_kg_extra) > 0) {
        
      const pesoMaximoPaquete = parseFloat(config.peso_maximo_paquete);
      const costoPorKgExtra = parseFloat(config.costo_por_kg_extra);
      
      console.log(`📋 [PRECIO] Peso máximo: ${pesoMaximoPaquete}kg, Costo por kg extra: $${costoPorKgExtra}`);
      
      // Solo aplicar sobrecosto si el peso excede el máximo
      if (weight > pesoMaximoPaquete) {
        // El peso extra es la diferencia entre el peso actual y el máximo permitido
        const pesoExtra = weight - pesoMaximoPaquete;
        // Redondear hacia arriba al kilo siguiente para el cálculo del sobrecosto
        const kilosExtraRedondeados = Math.ceil(pesoExtra);
        const costoExtra = kilosExtraRedondeados * costoPorKgExtra;
        
        console.log(`📦 [PRECIO] CARGO POR PESO EXTRA - Peso: ${weight}kg, Máximo: ${pesoMaximoPaquete}kg`);
        console.log(`📦 [PRECIO] Peso extra: ${pesoExtra}kg → ${kilosExtraRedondeados}kg (redondeado)`);
        console.log(`📦 [PRECIO] Sobrecosto: ${kilosExtraRedondeados} kg x $${costoPorKgExtra} = $${costoExtra}`);
        console.log(`📦 [PRECIO] Total: $${basePrice} + $${costoExtra} = $${basePrice + costoExtra}`);
        
        // Retornar precio base + costo adicional por peso extra
        return basePrice + costoExtra;
      } else {
        console.log(`📦 [PRECIO] SIN CARGO EXTRA - Peso: ${weight}kg está dentro del límite de ${pesoMaximoPaquete}kg`);
        return basePrice;
      }
    } else {
      console.log(`📦 [PRECIO] SIN CONFIGURACIÓN COMPLETA - Usando solo precio base $${basePrice}`);
      return basePrice;
    }
  };
  
  // Distribuir productos en paquetes según restricciones
  const calculatePackages = () => {
    // Imprimimos la configuración de paquetes para debugging
    console.log(`📦 [DEBUG] Datos para cálculo de paquetes:`);
    console.log(`- configuracion_paquetes:`, packageData.configuracion_paquetes);
    console.log(`- opciones_mensajeria:`, packageData.opciones_mensajeria);
    console.log(`- maxProductsPerPackage:`, maxProductsPerPackage);
    console.log(`- maxWeightPerPackage:`, maxWeightPerPackage);
    
    // Obtenemos configuración desde el origen correcto
    const config = packageData.configuracion_paquetes || 
                  (packageData.opciones_mensajeria && 
                   packageData.opciones_mensajeria.length > 0 && 
                   packageData.opciones_mensajeria[0].configuracion_paquetes) || 
                  null;
    
    // Si ya tenemos paquetes con precios individuales calculados en el servicio
    if (externalPackagesInfo && externalPackagesInfo.length > 0 && packagesWithPrices) {
      console.log(`📦 [DEBUG] Usando paquetes precalculados con precios individuales`);
      return externalPackagesInfo.map((pkg, index) => {
        const pkgProducts = packProducts.filter(p => pkg.products.includes(p.id));
        const weight = pkg.weight || pkgProducts.reduce((sum, p) => sum + (parseFloat(p.weight) * p.quantity), 0);
        
        return {
          ...pkg,
          id: pkg.id || `pkg_${index + 1}`,
          products: pkgProducts,
          weight,
          price: pkg.packagePrice || calculatePackagePrice(weight)
        };
      });
    }

    // Si hay restricción de 1 producto por paquete, distribuimos incluyendo cantidades
    const pesoMaximoPaquete = config?.peso_maximo_paquete ? parseFloat(config.peso_maximo_paquete) : 
                             maxWeightPerPackage ? parseFloat(maxWeightPerPackage) : null;
    
    const maximoProductosPorPaquete = config?.maximo_productos_por_paquete ? parseInt(config.maximo_productos_por_paquete, 10) : 
                                     maxProductsPerPackage ? parseInt(maxProductsPerPackage, 10) : null;
    
    console.log(`📦 [DEBUG] Límites calculados - Peso máximo: ${pesoMaximoPaquete}kg, Máx. productos: ${maximoProductosPorPaquete}`);
    
    if (maximoProductosPorPaquete === 1) {
      console.log(`📦 [DEBUG] Usando distribución 1 producto por paquete`);
      let packages = [];
      
      // Distribuir cada unidad como paquete independiente
      packProducts.forEach(product => {
        for (let i = 0; i < product.quantity; i++) {
          const weight = parseFloat(product.weight);
          packages.push({
            id: `pkg_${packages.length + 1}`,
            products: [{...product, quantity: 1}],
            weight: weight,
            price: calculatePackagePrice(weight)
          });
        }
      });
      
      return packages;
    }
    // Si hay restricción de peso máximo por paquete
    else if (pesoMaximoPaquete && !isNaN(pesoMaximoPaquete) && pesoMaximoPaquete > 0) {
      console.log(`📦 [DEBUG] Usando distribución por peso máximo: ${pesoMaximoPaquete}kg`);
      let packages = [];
      let currentPackageProducts = [];
      let currentPackageWeight = 0;
      
      // Primero, desglosamos productos con cantidades mayores a 1
      let expandedProducts = [];
      packProducts.forEach(product => {
        // Si son productos con cantidades altas, pero poco peso, los agrupamos
        const productWeight = parseFloat(product.weight) || 0;
        
        if (product.quantity > 1 && productWeight * product.quantity <= pesoMaximoPaquete) {
          // Podemos mantener el producto completo
          expandedProducts.push({...product});
        } else if (product.quantity > 1) {
          // Necesitamos dividir este producto en unidades
          for (let i = 0; i < product.quantity; i++) {
            expandedProducts.push({
              ...product,
              quantity: 1
            });
          }
        } else {
          // Producto normal con cantidad 1
          expandedProducts.push({...product});
        }
      });
      
      // Ahora distribuimos los productos en paquetes según el peso
      expandedProducts.forEach(product => {
        const productWeight = (parseFloat(product.weight) || 0) * product.quantity;
        
        // Si añadir este producto supera el peso máximo, crear un nuevo paquete
        if (currentPackageWeight + productWeight > pesoMaximoPaquete) {
          // Si el paquete actual no está vacío, lo añadimos a la lista
          if (currentPackageProducts.length > 0) {
            packages.push({
              id: `pkg_${packages.length + 1}`,
              products: [...currentPackageProducts],
              weight: currentPackageWeight,
              price: calculatePackagePrice(currentPackageWeight)
            });
          }
          
          // Iniciar un nuevo paquete con este producto
          currentPackageProducts = [product];
          currentPackageWeight = productWeight;
        } else {
          // Si cabe, añadimos el producto al paquete actual
          currentPackageProducts.push(product);
          currentPackageWeight += productWeight;
        }
      });
      
      // Añadir el último paquete si tiene productos
      if (currentPackageProducts.length > 0) {
        packages.push({
          id: `pkg_${packages.length + 1}`,
          products: currentPackageProducts,
          weight: currentPackageWeight,
          price: calculatePackagePrice(currentPackageWeight)
        });
      }
      
      return packages;
    }
    // Si no hay restricciones específicas pero sí hay paquetes predefinidos, usarlos
    else if (externalPackagesInfo && externalPackagesInfo.length > 0) {
      console.log(`📦 [DEBUG] Usando paquetes predefinidos sin precios`);
      return externalPackagesInfo.map((pkg, index) => {
        const pkgProducts = packProducts.filter(p => pkg.products.includes(p.id));
        const weight = pkgProducts.reduce((sum, p) => sum + (parseFloat(p.weight) * p.quantity), 0);
        
        return {
          ...pkg,
          id: pkg.id || `pkg_${index + 1}`,
          products: pkgProducts,
          weight,
          price: calculatePackagePrice(weight)
        };
      });
    }
    // Si no hay restricciones, todos en un solo paquete
    else {
      console.log(`📦 [DEBUG] Sin restricciones - Todos los productos en un paquete`);
      const totalWeightValue = parseFloat(totalWeight);
      return [{
        id: 'pkg_1',
        products: packProducts,
        weight: totalWeightValue,
        price: calculatePackagePrice(totalWeightValue)
      }];
    }
  };
  
  const packages = calculatePackages();
  const actualPackageCount = packages.length;
  
  // Calcular el costo total real sumando el costo de cada paquete
  const calculatedTotalCost = packages.reduce((sum, pkg) => sum + pkg.price, 0);
  
  // Formatear costo total
  const formattedTotalCost = calculatedTotalCost === 0 
    ? 'GRATIS' 
    : new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
      }).format(calculatedTotalCost);
  
  // Log para depuración de precios por paquete
  console.log(`💰 RESUMEN DE PRECIOS POR PAQUETE:`);
  packages.forEach((pkg, index) => {
    console.log(`- Paquete ${index + 1}: Peso ${pkg.weight}kg, Precio: $${pkg.price}`);
  });
  console.log(`- TOTAL: $${calculatedTotalCost}`);
  
  // Verificar si hay diferencias significativas entre los precios de los paquetes
  const precioDiferentes = packages.length > 1 && 
    packages.some(pkg => Math.abs(pkg.price - packages[0].price) > 5); // 5 pesos de diferencia es significativo
  
  if (precioDiferentes) {
    console.log(`💰 ATENCIÓN: Los paquetes tienen precios diferentes - Debe mostrar desglose`);
  }
  
  // Determinar el tiempo de entrega basado en las diferentes fuentes disponibles
  let displayDeliveryTime = '';
  
  // Orden de prioridad para determinar el tiempo de entrega
  if (tiempo_entrega && tiempo_entrega.trim().length > 0) {
    // 1. Usar tiempo_entrega si existe (viene directamente de la regla)
    displayDeliveryTime = tiempo_entrega;
    console.log(`📦 Usando tiempo_entrega: "${displayDeliveryTime}"`);
  } else if (deliveryTime && deliveryTime.trim().length > 0) {
    // 2. Usar deliveryTime si existe (calculado por el algoritmo greedy)
    displayDeliveryTime = deliveryTime;
    console.log(`📦 Usando deliveryTime: "${displayDeliveryTime}"`);
  } else if (estimatedDelivery && estimatedDelivery.trim().length > 0) {
    // 3. Usar estimatedDelivery si existe
    displayDeliveryTime = estimatedDelivery;
    console.log(`📦 Usando estimatedDelivery: "${displayDeliveryTime}"`);
  } else if (minDays !== undefined && maxDays !== undefined) {
    // 4. Construir a partir de minDays y maxDays
    if (minDays === maxDays) {
      displayDeliveryTime = `${minDays} días hábiles`;
    } else {
      displayDeliveryTime = `${minDays} a ${maxDays} días hábiles`;
    }
    console.log(`📦 Construyendo desde minDays=${minDays} y maxDays=${maxDays}: "${displayDeliveryTime}"`);
  } else {
    // 5. Valor predeterminado solo si no hay otra información
    displayDeliveryTime = "Tiempo de entrega variable";
    console.log(`📦 Usando valor predeterminado: "${displayDeliveryTime}"`);
  }
  
  // Determinar el tipo de envío para mostrar el icono correcto
  const getShippingIcon = () => {
    if (zoneType === 'express') return <i className="bi bi-truck shipping-express"></i>;
    if (zoneType === 'local') return <i className="bi bi-truck"></i>;
    if (zoneType === 'nacional') return <i className="bi bi-truck"></i>;
    return <i className="bi bi-box"></i>;
  };
  
  // Manejar la selección de esta opción
  const handleSelect = () => {
    // Implementa la lógica para seleccionar este paquete
  };
  
  // Alternar la visualización de detalles
  const toggleDetails = (e) => {
    e.stopPropagation();
    setDetailsExpanded(!detailsExpanded);
  };

  return (
    <div 
      className={`shipping-package ${selected ? 'selected' : ''}`}
      onClick={handleSelect}
    >
      <div className="shipping-package-header">
        <div className="shipping-package-icon">
          {getShippingIcon()}
        </div>
        <div className="shipping-package-info">
          <h3>{name} {carrier && `- ${carrier}`}</h3>
          <div className="shipping-package-details">
            {displayDeliveryTime ? (
              <div className="shipping-delivery-time">
                <i className="bi bi-clock"></i>
                <span>{displayDeliveryTime}</span>
              </div>
            ) : null}
          </div>
        </div>
        {/* Mostrar costo total real basado en el número de paquetes */}
        <div className="shipping-package-price">
          {calculatedTotalCost === 0 ? (
            <span className="free-shipping">GRATIS</span>
          ) : (
            <>
              {packages.length > 1 && packages.some(pkg => Math.abs(pkg.price - packages[0].price) > 5) ? (
                <div className="shipping-total-price">
                  <span className="shipping-total-cost">Desde</span>
                  <span>{formattedTotalCost}</span>
                </div>
              ) : (
                <span>{formattedTotalCost}</span>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="shipping-package-body">
        <div className="shipping-package-summary">
          <div className="summary-pill">
            <i className="bi bi-boxes"></i>
            <span>{totalProductUnits} producto{totalProductUnits !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="summary-pill">
            <i className="bi bi-weight"></i>
            <span>{totalWeight} kg</span>
          </div>
          
          {maxProductsPerPackage && (
            <div className="summary-pill">
              <i className="bi bi-box"></i>
              <span>Máx. {maxProductsPerPackage} producto{maxProductsPerPackage !== 1 ? 's' : ''}/paquete</span>
            </div>
          )}
          
          {maxWeightPerPackage && (
            <div className="summary-pill">
              <i className="bi bi-weight"></i>
              <span>Máx. {maxWeightPerPackage} kg/paquete</span>
            </div>
          )}
          
          {/* Mostrar cantidad de paquetes si hay más de uno */}
          {packages.length > 1 && (
            <div className="summary-pill">
              <i className="bi bi-archive"></i>
              <span>{packages.length} paquetes</span>
            </div>
          )}
          
          <button className="details-toggle" onClick={toggleDetails}>
            {detailsExpanded ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>}
            <span>{detailsExpanded ? 'Ocultar detalles' : 'Ver detalles'}</span>
          </button>
        </div>
        
        {detailsExpanded && (
          <div className="shipping-package-expanded">
            <div className="products-breakdown">
              {packages.map((pkg, index) => {
                // Formatear el precio individual de este paquete específico
                const formattedPackagePrice = pkg.price === 0 
                  ? 'GRATIS' 
                  : new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                      minimumFractionDigits: 2
                    }).format(pkg.price);
                
                return (
                  <div key={pkg.id} className="package-breakdown">
                    <div className="package-header-breakdown">
                      <h5>Paquete {index + 1}</h5>
                      <span className="package-price">{formattedPackagePrice}</span>
                    </div>
                    <ul className="product-list">
                      {pkg.products.map(product => (
                        <li key={`${pkg.id}_${product.id}`} className="product-item">
                          <div className="product-details">
                            <span className="shipping-product-name-detail">{product.name} {product.quantity > 1 ? `(${product.quantity})` : ''}</span>
                            {product.weight > 0 && (
                              <span className="product-weight">{(parseFloat(product.weight) * product.quantity).toFixed(2)} kg</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            
            {/* Mostrar resumen de costos cuando hay múltiples paquetes con precios distintos */}
            {packages.length > 1 && (
              <div className="cost-summary">
                <h5>Resumen de costos</h5>
                <ul className="cost-breakdown-list">
                  {packages.some(pkg => pkg.price !== packages[0].price) ? (
                    // Si hay paquetes con precios diferentes, mostrar desglose
                    packages.map((pkg, index) => (
                      <li key={`cost_${index}`} className="cost-item">
                        <span>Paquete {index + 1} ({pkg.weight.toFixed(2)} kg):</span>
                        <span className="cost-value">
                          {pkg.price === 0 
                            ? 'GRATIS' 
                            : new Intl.NumberFormat('es-MX', {
                                style: 'currency',
                                currency: 'MXN',
                                minimumFractionDigits: 2
                              }).format(pkg.price)}
                        </span>
                      </li>
                    ))
                  ) : (
                    // Si todos los paquetes tienen el mismo precio, mostrar precio unitario
                    <li className="cost-item">
                      <span>{packages.length} paquetes x {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                        minimumFractionDigits: 2
                      }).format(packages[0].price)}</span>
                    </li>
                  )}
                  <li className="cost-item total">
                    <span><strong>Total:</strong></span>
                    <span className="cost-value"><strong>{formattedTotalCost}</strong></span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 