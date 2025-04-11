import { collection, getDocs, query, where } from 'firebase/firestore';
import { FirebaseDB } from '../../../../../config/firebase/firebaseConfig';

/**
 * Servicio para obtener y gestionar dinámicamente las zonas de envío desde Firestore
 */

/**
 * Obtiene todas las zonas de envío activas desde Firestore
 * @returns {Promise<Array>} Lista de zonas de envío
 */
export const getActiveShippingZones = async () => {
  try {
    // Referencia a la colección de zonas_envio
    const shippingZonesRef = collection(FirebaseDB, 'zonas_envio');
    
    // Consulta para obtener solo zonas activas
    const q = query(shippingZonesRef, where('activo', '==', true));
    
    // Ejecutar la consulta
    const zonesSnapshot = await getDocs(q);
    
    // Procesar resultados
    const zones = [];
    zonesSnapshot.forEach(doc => {
      zones.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📦 Obtenidas ${zones.length} zonas de envío activas`);
    return zones;
  } catch (error) {
    console.error('Error al obtener zonas de envío:', error);
    throw error;
  }
};

/**
 * Verifica si un código postal está dentro del rango de una zona de envío
 * @param {Object} zone - Zona de envío a verificar
 * @param {string} postalCode - Código postal a validar
 * @returns {boolean} - true si el código postal es válido para esta zona
 */
export const isPostalCodeInZone = (zone, postalCode) => {
  // Si no hay código postal, no podemos validar
  if (!postalCode) return false;
  
  // Verificar si la zona es nacional (aplica a todos los códigos postales)
  if (zone.ambito === 'nacional' || 
      zone.cobertura === 'nacional' || 
      zone.tipo === 'nacional' || 
      zone.zona === 'Nacional' ||
      zone.zipcodes?.includes('nacional')) {
    return true;
  }
  
  // Verificar códigos postales específicos si están definidos
  if (zone.codigos_postales && Array.isArray(zone.codigos_postales) && zone.codigos_postales.length > 0) {
    return zone.codigos_postales.includes(postalCode);
  }
  
  // Verificar rangos de códigos postales
  if (zone.rangos_postales && Array.isArray(zone.rangos_postales) && zone.rangos_postales.length > 0) {
    for (const rango of zone.rangos_postales) {
      if (postalCode >= rango.inicio && postalCode <= rango.fin) {
        return true;
      }
    }
    return false;
  }
  
  // Si la zona no tiene criterios específicos pero es local, intentamos inferir por nombre
  if (zone.zona === 'Local' && zone.aplica) {
    return true;
  }
  
  return false;
};

/**
 * Obtiene las zonas de envío aplicables para un código postal específico
 * @param {string} postalCode - Código postal del usuario
 * @returns {Promise<Array>} - Lista de zonas de envío aplicables
 */
export const getShippingZonesForPostalCode = async (postalCode) => {
  try {
    const allZones = await getActiveShippingZones();
    
    // Filtrar zonas que aplican al código postal
    const applicableZones = allZones.filter(zone => isPostalCodeInZone(zone, postalCode));
    
    console.log(`📍 Para CP ${postalCode}: ${applicableZones.length} zonas aplicables`);
    return applicableZones;
  } catch (error) {
    console.error(`Error al obtener zonas para CP ${postalCode}:`, error);
    throw error;
  }
};

/**
 * Calcula el precio de envío basado en los productos y las opciones de la zona
 * @param {Array} products - Productos a enviar
 * @param {Object} shippingOption - Opción de mensajería seleccionada
 * @param {Object} zone - Zona de envío
 * @returns {Object} - Información de precio y detalles
 */
export const calculateShippingPrice = (products, shippingOption, zone) => {
  if (!products || !shippingOption || !zone) {
    return { price: 0, details: 'Información incompleta' };
  }
  
  let basePrice = parseFloat(shippingOption.precio || 0);
  let isFreeShipping = false;
  let freeReason = '';
  
  // Calcular subtotal de productos
  const subtotal = products.reduce((total, item) => {
    const price = parseFloat(item.product?.price || item.product?.precio || 0);
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
  
  // Calcular peso total
  const totalWeight = products.reduce((weight, item) => {
    const productWeight = parseFloat(item.product?.weight || item.product?.peso || 0);
    const quantity = item.quantity || 1;
    return weight + (productWeight * quantity);
  }, 0);
  
  // Calcular cantidad de productos
  const productCount = products.reduce((count, item) => count + (item.quantity || 1), 0);
  
  // Verificar envío gratuito global
  if (zone.envio_gratis === true) {
    isFreeShipping = true;
    freeReason = 'Envío gratuito para todos los productos de esta zona';
  }
  // Verificar monto mínimo para envío gratuito
  else if (zone.envio_gratis_monto_minimo && 
          parseFloat(zone.envio_gratis_monto_minimo) > 0 && 
          subtotal >= parseFloat(zone.envio_gratis_monto_minimo)) {
    isFreeShipping = true;
    freeReason = `Subtotal ($${subtotal.toFixed(2)}) mayor al mínimo para envío gratis ($${parseFloat(zone.envio_gratis_monto_minimo).toFixed(2)})`;
  }
  
  // Si aplica envío gratuito, el precio es 0
  if (isFreeShipping) {
    return {
      price: 0,
      basePrice,
      isFree: true,
      freeReason,
      subtotal,
      totalWeight,
      productCount
    };
  }
  
  // Costos adicionales por producto extra
  let extraProductCost = 0;
  const costPerExtraProduct = parseFloat(zone.costo_por_producto_extra || shippingOption.configuracion_paquetes?.costo_por_producto_extra || 0);
  
  if (costPerExtraProduct > 0 && productCount > 1) {
    const extraProducts = productCount - 1;
    extraProductCost = extraProducts * costPerExtraProduct;
    basePrice += extraProductCost;
  }
  
  // Costos adicionales por peso extra
  let extraWeightCost = 0;
  const baseWeight = parseFloat(zone.peso_base || shippingOption.peso_base || 0);
  const costPerExtraKg = parseFloat(zone.costo_por_kg_extra || 
                                  shippingOption.configuracion_paquetes?.costo_por_kg_extra || 0);
  
  if (costPerExtraKg > 0 && baseWeight > 0 && totalWeight > baseWeight) {
    const extraWeight = totalWeight - baseWeight;
    extraWeightCost = extraWeight * costPerExtraKg;
    basePrice += extraWeightCost;
  }
  
  // Verificar límites 
  let exceedsLimits = false;
  let limitMessage = '';
  
  // Límite de productos por paquete
  const maxProductsPerPackage = parseInt(zone.maximo_productos_por_paquete || 
                                       shippingOption.configuracion_paquetes?.maximo_productos_por_paquete || 0);
  
  if (maxProductsPerPackage > 0 && productCount > maxProductsPerPackage) {
    exceedsLimits = true;
    limitMessage = `Excede el máximo de productos por paquete (${maxProductsPerPackage})`;
  }
  
  // Límite de peso por paquete
  const maxWeightPerPackage = parseFloat(zone.peso_maximo_paquete || 
                                       shippingOption.configuracion_paquetes?.peso_maximo_paquete || 0);
  
  if (maxWeightPerPackage > 0 && totalWeight > maxWeightPerPackage) {
    exceedsLimits = true;
    limitMessage = `${limitMessage ? limitMessage + ' y ' : ''}excede el peso máximo por paquete (${maxWeightPerPackage}kg)`;
  }
  
  return {
    price: basePrice,
    basePrice: parseFloat(shippingOption.precio || 0),
    isFree: false,
    subtotal,
    totalWeight,
    productCount,
    extraProductCost,
    extraWeightCost,
    exceedsLimits,
    limitMessage
  };
};

/**
 * Construye combinaciones óptimas entre varias zonas para cubrir todos los productos
 * @param {Array} cartItems - Productos en el carrito
 * @param {Array} zones - Zonas de envío disponibles
 * @returns {Array} - Lista de combinaciones posibles
 */
export const buildOptimalCombinations = (cartItems, zones) => {
  if (!cartItems || !cartItems.length || !zones || !zones.length) {
    console.warn('📦 No hay productos o zonas para calcular combinaciones');
    return [];
  }
  
  console.log(`📦 Calculando combinaciones para ${cartItems.length} productos y ${zones.length} zonas`);
  
  // Identificar zonas por tipo
  const localZones = zones.filter(z => z.zona === 'Local' || z.ambito === 'local');
  const nationalZones = zones.filter(z => 
    z.zona === 'Nacional' || 
    z.ambito === 'nacional' || 
    z.cobertura === 'nacional' || 
    z.tipo === 'nacional'
  );
  const otherZones = zones.filter(z => 
    !localZones.some(lz => lz.id === z.id) && 
    !nationalZones.some(nz => nz.id === z.id)
  );
  
  console.log(`📍 Zonas identificadas: ${localZones.length} locales, ${nationalZones.length} nacionales, ${otherZones.length} otras`);
  
  // Mapa para rastrear qué productos están cubiertos por qué zonas
  const zonesByProduct = new Map(); // productId => [zoneIds]
  
  // Para cada producto, determinar qué zonas lo cubren
  cartItems.forEach(item => {
    const productId = item.product?.id;
    if (!productId) return;
    
    const compatibleZones = [];
    
    // Primero intentar con reglas definidas en el producto
    const productRules = item.product?.shippingRuleIds || 
                         [item.product?.shippingRuleId] || 
                         (item.product?.shippingRules || []).map(r => r.id || r.ruleId);
    
    if (productRules && productRules.length > 0) {
      // Usar reglas definidas en el producto
      productRules.forEach(ruleId => {
        const matchingZone = zones.find(z => z.id === ruleId);
        if (matchingZone) {
          compatibleZones.push(matchingZone.id);
        }
      });
    }
    
    // Si no hay reglas específicas, asumir que zonas nacionales cubren todo
    if (compatibleZones.length === 0 && nationalZones.length > 0) {
      nationalZones.forEach(zone => {
        compatibleZones.push(zone.id);
      });
    }
    
    // Registrar las zonas compatibles para este producto
    if (compatibleZones.length > 0) {
      zonesByProduct.set(productId, compatibleZones);
    } else {
      console.warn(`⚠️ Producto ${productId} no tiene zonas de envío compatibles`);
    }
  });
  
  // Verificar si todos los productos están cubiertos por al menos una zona
  const allProductsCovered = Array.from(zonesByProduct.values()).every(zones => zones.length > 0);
  
  if (!allProductsCovered) {
    console.warn('❌ No todos los productos tienen zonas de envío compatibles');
    return []; // No podemos construir combinaciones válidas
  }
  
  // Las combinaciones que generaremos
  const combinations = [];
  
  // CASO 1: Verificar si hay una sola zona que cubra todos los productos
  zones.forEach(zone => {
    // Verificar si esta zona cubre todos los productos
    const allCoveredByThisZone = Array.from(zonesByProduct.entries()).every(([productId, compatibleZones]) => 
      compatibleZones.includes(zone.id)
    );
    
    if (allCoveredByThisZone && zone.opciones_mensajeria && Array.isArray(zone.opciones_mensajeria)) {
      console.log(`✅ Zona "${zone.zona}" cubre todos los productos`);
      
      // Crear opciones para esta zona única
      zone.opciones_mensajeria.forEach((option, optionIndex) => {
        // Calcular precio y detalles para todos los productos
        const priceDetails = calculateShippingPrice(cartItems, option, zone);
        
        // Crear opción
        combinations.push({
          id: `${zone.id}-${optionIndex}`,
          zoneId: zone.id,
          zoneName: zone.zona,
          description: zone.zona,
          option: {
            name: option.nombre || "Servicio de envío",
            label: option.label || `Opción ${optionIndex + 1}`,
            price: priceDetails.price,
            isFree: priceDetails.isFree,
            freeReason: priceDetails.freeReason,
            estimatedDelivery: `${option.minDays || 1}-${option.maxDays || 10} días`
          },
          carrier: option.nombre || zone.zona,
          deliveryTime: `${option.minDays || 1}-${option.maxDays || 10} días`,
          products: cartItems,
          totalPrice: priceDetails.price,
          coversAllProducts: true,
          exceedsLimits: priceDetails.exceedsLimits,
          limitMessage: priceDetails.limitMessage,
          selections: [{
            groupId: zone.id,
            ruleName: zone.zona,
            option: {
              name: option.nombre || "Servicio de envío",
              price: priceDetails.price,
              isFree: priceDetails.isFree,
              estimatedDelivery: `${option.minDays || 1}-${option.maxDays || 10} días`
            },
            products: cartItems
          }]
        });
      });
    }
  });
  
  // Si ya tenemos opciones que cubren todo, no necesitamos combinaciones
  if (combinations.length > 0) {
    console.log(`✅ Generadas ${combinations.length} opciones simples que cubren todos los productos`);
    return combinations;
  }
  
  // CASO 2: Intentar crear combinaciones, priorizando Local+Nacional
  if (localZones.length > 0 && nationalZones.length > 0) {
    console.log('🔄 Creando combinaciones Local+Nacional');
    
    // Identificar qué productos pueden enviarse con zona local
    const localProducts = [];
    const nationalProducts = [];
    
    // Para cada producto, decidir si puede enviarse con envío local o nacional
    cartItems.forEach(item => {
      const productId = item.product?.id;
      if (!productId) return;
      
      const compatibleZones = zonesByProduct.get(productId) || [];
      
      // Verificar si el producto puede enviarse con zona local
      const hasLocalOption = compatibleZones.some(zoneId => 
        localZones.some(localZone => localZone.id === zoneId)
      );
      
      if (hasLocalOption) {
        localProducts.push(item);
      } else {
        // Si no tiene opción local, debe enviarse con nacional
        nationalProducts.push(item);
      }
    });
    
    // Verificar si podemos cubrir todos los productos con esta combinación
    if (localProducts.length + nationalProducts.length === cartItems.length) {
      console.log(`✅ Combinación viable: ${localProducts.length} productos locales + ${nationalProducts.length} productos nacionales`);
      
      // Usar la primera zona local y nacional para simplificar
      const localZone = localZones[0];
      const nationalZone = nationalZones[0];
      
      // Para cada opción nacional (suele tener más variedad)
      if (nationalZone.opciones_mensajeria && Array.isArray(nationalZone.opciones_mensajeria)) {
        nationalZone.opciones_mensajeria.forEach((nationalOption, nationalIndex) => {
          // Usar primera opción local (o iterar si hay varias opciones locales)
          if (localZone.opciones_mensajeria && localZone.opciones_mensajeria.length > 0) {
            const localOption = localZone.opciones_mensajeria[0];
            
            // Calcular precios
            const localPriceDetails = calculateShippingPrice(localProducts, localOption, localZone);
            const nationalPriceDetails = calculateShippingPrice(nationalProducts, nationalOption, nationalZone);
            
            // Crear combinación mixta
            combinations.push({
              id: `combined-${localZone.id}-${nationalZone.id}-${nationalIndex}`,
              description: 'Combinado (Local + Nacional)',
              isMixed: true,
              coversAllProducts: true,
              totalPrice: localPriceDetails.price + nationalPriceDetails.price,
              carrier: 'Servicios combinados',
              deliveryTime: `${nationalOption.minDays || 1}-${nationalOption.maxDays || 10} días`,
              option: {
                name: 'Local y Nacional',
                label: nationalOption.label || `Opción ${nationalIndex + 1}`,
                price: localPriceDetails.price + nationalPriceDetails.price,
                isFree: localPriceDetails.isFree && nationalPriceDetails.isFree,
                estimatedDelivery: `${nationalOption.minDays || 1}-${nationalOption.maxDays || 10} días`
              },
              // Datos para UI
              freeProducts: localPriceDetails.isFree ? localProducts : [],
              paidProducts: localProducts.concat(nationalProducts),
              freePrice: localPriceDetails.price,
              paidPrice: nationalPriceDetails.price,
              freeGroupName: 'Local',
              paidGroupName: 'Nacional',
              // Selecciones para procesamiento
              selections: [
                {
                  groupId: localZone.id,
                  ruleName: 'Local',
                  option: {
                    name: localOption.nombre || "Servicio local",
                    price: localPriceDetails.price,
                    isFree: localPriceDetails.isFree,
                    estimatedDelivery: `${localOption.minDays || 1}-${localOption.maxDays || 1} días`
                  },
                  products: localProducts
                },
                {
                  groupId: nationalZone.id,
                  ruleName: 'Nacional',
                  option: {
                    name: nationalOption.nombre || "Servicio nacional",
                    price: nationalPriceDetails.price,
                    isFree: nationalPriceDetails.isFree,
                    estimatedDelivery: `${nationalOption.minDays || 1}-${nationalOption.maxDays || 10} días`
                  },
                  products: nationalProducts
                }
              ]
            });
          }
        });
      }
    } else {
      console.warn('❌ No se puede cubrir todos los productos con combinación Local+Nacional');
    }
  }
  
  // CASO 3: Si todavía no tenemos combinaciones, intentar una solución genérica
  // que combine todas las zonas necesarias para cubrir todos los productos
  if (combinations.length === 0) {
    console.log('🔄 Intentando crear una combinación genérica con todas las zonas necesarias');
    
    // Mapa de productos ya cubiertos
    const coveredProducts = new Set();
    
    // Lista de zonas a usar
    const zonesNeeded = [];
    
    // Agregar primero las zonas nacionales (más cobertura)
    nationalZones.forEach(zone => {
      zonesNeeded.push(zone);
      
      // Marcar los productos cubiertos por esta zona
      cartItems.forEach(item => {
        const productId = item.product?.id;
        if (productId) {
          const compatibleZones = zonesByProduct.get(productId) || [];
          if (compatibleZones.includes(zone.id)) {
            coveredProducts.add(productId);
          }
        }
      });
    });
    
    // Luego agregar zonas locales si son necesarias
    localZones.forEach(zone => {
      // Verificar si esta zona cubre algún producto aún no cubierto
      let coversNewProducts = false;
      
      cartItems.forEach(item => {
        const productId = item.product?.id;
        if (productId && !coveredProducts.has(productId)) {
          const compatibleZones = zonesByProduct.get(productId) || [];
          if (compatibleZones.includes(zone.id)) {
            coversNewProducts = true;
            coveredProducts.add(productId);
          }
        }
      });
      
      if (coversNewProducts) {
        zonesNeeded.push(zone);
      }
    });
    
    // Finalmente agregar otras zonas si son necesarias
    otherZones.forEach(zone => {
      // Verificar si esta zona cubre algún producto aún no cubierto
      let coversNewProducts = false;
      
      cartItems.forEach(item => {
        const productId = item.product?.id;
        if (productId && !coveredProducts.has(productId)) {
          const compatibleZones = zonesByProduct.get(productId) || [];
          if (compatibleZones.includes(zone.id)) {
            coversNewProducts = true;
            coveredProducts.add(productId);
          }
        }
      });
      
      if (coversNewProducts) {
        zonesNeeded.push(zone);
      }
    });
    
    // Verificar si hemos cubierto todos los productos
    const allCovered = cartItems.every(item => {
      const productId = item.product?.id;
      return productId && coveredProducts.has(productId);
    });
    
    if (allCovered) {
      console.log(`✅ Encontrada combinación genérica con ${zonesNeeded.length} zonas`);
      
      // Crear selecciones para cada zona
      const selections = [];
      const zonePrices = [];
      
      zonesNeeded.forEach(zone => {
        // Identificar productos compatibles con esta zona
        const compatibleProducts = cartItems.filter(item => {
          const productId = item.product?.id;
          if (!productId) return false;
          
          const compatibleZones = zonesByProduct.get(productId) || [];
          return compatibleZones.includes(zone.id);
        });
        
        // Usar primera opción de mensajería
        if (zone.opciones_mensajeria && zone.opciones_mensajeria.length > 0) {
          const option = zone.opciones_mensajeria[0];
          
          // Calcular precio para estos productos
          const priceDetails = calculateShippingPrice(compatibleProducts, option, zone);
          
          // Agregar selección
          selections.push({
            groupId: zone.id,
            ruleName: zone.zona,
            option: {
              name: option.nombre || "Servicio de envío",
              price: priceDetails.price,
              isFree: priceDetails.isFree,
              estimatedDelivery: `${option.minDays || 1}-${option.maxDays || 10} días`
            },
            products: compatibleProducts
          });
          
          // Registrar precio
          zonePrices.push({
            zoneId: zone.id,
            zoneName: zone.zona,
            price: priceDetails.price,
            isFree: priceDetails.isFree
          });
        }
      });
      
      // Calcular precio total
      const totalPrice = zonePrices.reduce((sum, zonePrice) => sum + zonePrice.price, 0);
      
      // Crear combinación
      combinations.push({
        id: `multi-zone-${Date.now()}`,
        description: `Combinación multi-zona (${zonesNeeded.length} servicios)`,
        isMixed: true,
        coversAllProducts: true,
        totalPrice,
        carrier: 'Servicios combinados',
        deliveryTime: "1-10 días", // Estimado genérico
        option: {
          name: 'Combinación óptima',
          label: 'Opción combinada',
          price: totalPrice,
          isFree: totalPrice === 0,
          estimatedDelivery: "1-10 días"
        },
        // Selecciones para procesamiento
        selections,
        // Para UI
        isMultiOption: true,
        zonePrices
      });
    } else {
      console.warn('❌ No se pudo encontrar una combinación que cubra todos los productos');
    }
  }
  
  console.log(`📦 Generadas ${combinations.length} combinaciones de envío`);
  
  // Si no hay combinaciones, intentar una última estrategia: usar solo envío nacional
  if (combinations.length === 0 && nationalZones.length > 0) {
    console.log('🔄 Intentando crear opción con solo envío nacional');
    
    const nationalZone = nationalZones[0];
    
    if (nationalZone.opciones_mensajeria && nationalZone.opciones_mensajeria.length > 0) {
      nationalZone.opciones_mensajeria.forEach((option, optionIndex) => {
        // Calcular precio para todos los productos
        const priceDetails = calculateShippingPrice(cartItems, option, nationalZone);
        
        // Crear opción
        combinations.push({
          id: `nacional-${nationalZone.id}-${optionIndex}`,
          zoneId: nationalZone.id,
          zoneName: nationalZone.zona,
          description: `${nationalZone.zona} (todos los productos)`,
          option: {
            name: option.nombre || "Servicio de envío",
            label: option.label || `Opción ${optionIndex + 1}`,
            price: priceDetails.price,
            isFree: priceDetails.isFree,
            freeReason: priceDetails.freeReason,
            estimatedDelivery: `${option.minDays || 1}-${option.maxDays || 10} días`
          },
          carrier: option.nombre || nationalZone.zona,
          deliveryTime: `${option.minDays || 1}-${option.maxDays || 10} días`,
          products: cartItems,
          totalPrice: priceDetails.price,
          coversAllProducts: true,
          exceedsLimits: priceDetails.exceedsLimits,
          limitMessage: priceDetails.limitMessage,
          selections: [{
            groupId: nationalZone.id,
            ruleName: nationalZone.zona,
            option: {
              name: option.nombre || "Servicio de envío",
              price: priceDetails.price,
              isFree: priceDetails.isFree,
              estimatedDelivery: `${option.minDays || 1}-${option.maxDays || 10} días`
            },
            products: cartItems
          }]
        });
      });
    }
  }
  
  // Ordenar combinaciones: primero completas, luego por precio
  return combinations.sort((a, b) => {
    // Primero por cobertura
    if (a.coversAllProducts && !b.coversAllProducts) return -1;
    if (!a.coversAllProducts && b.coversAllProducts) return 1;
    
    // Luego por precio
    return a.totalPrice - b.totalPrice;
  });
};

/**
 * Obtiene todas las opciones de envío disponibles para un carrito y dirección
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} address - Dirección del usuario
 * @returns {Promise<Array>} - Lista de opciones de envío disponibles
 */
export const getShippingOptions = async (cartItems, address) => {
  try {
    if (!cartItems || !cartItems.length || !address) {
      console.warn('❌ Datos incompletos para calcular opciones de envío');
      return [];
    }
    
    const postalCode = address.zip || address.zipcode || address.postalCode || '';
    
    if (!postalCode) {
      console.warn('❌ Dirección sin código postal');
      return [];
    }
    
    // 1. Obtener zonas de envío aplicables para el código postal
    const zones = await getShippingZonesForPostalCode(postalCode);
    
    if (!zones || zones.length === 0) {
      console.warn(`❌ No hay zonas de envío para el código postal ${postalCode}`);
      return [];
    }
    
    // 2. Construir combinaciones óptimas
    const options = buildOptimalCombinations(cartItems, zones);
    
    console.log(`✅ Generadas ${options.length} opciones de envío para el CP ${postalCode}`);
    return options;
  } catch (error) {
    console.error('Error al obtener opciones de envío:', error);
    throw error;
  }
}; 