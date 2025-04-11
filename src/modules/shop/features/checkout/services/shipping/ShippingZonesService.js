import { collection, getDocs, query, where } from 'firebase/firestore';
import { FirebaseDB } from '../../../../../../config/firebase/firebaseConfig';

// Colección donde se almacenan las zonas de envío
const SHIPPING_ZONES_COLLECTION = 'zonas_envio';

/**
 * Obtiene todas las zonas de envío activas
 * @returns {Promise<Array>} Zonas de envío activas
 */
export const getActiveShippingZones = async () => {
  try {
    // Query para obtener zonas activas
    const zonesQuery = query(
      collection(FirebaseDB, SHIPPING_ZONES_COLLECTION),
      where('activo', '==', true)
    );
    
    const querySnapshot = await getDocs(zonesQuery);
    const zones = [];
    
    querySnapshot.forEach(doc => {
      zones.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`🌍 Zonas de envío activas obtenidas: ${zones.length}`);
    return zones;
  } catch (error) {
    console.error('Error al obtener zonas de envío activas:', error);
    return [];
  }
};

/**
 * Busca directamente en Firebase zonas que tengan el código postal específico
 * Esto evita tener que filtrar en memoria y puede ser más preciso
 * @param {string} postalCode - Código postal a buscar
 * @returns {Promise<Array>} - Zonas que contienen explícitamente el código postal
 */
export const getZonesWithExactPostalCode = async (postalCode) => {
  if (!postalCode) return [];
  
  try {
    // Buscar zonas que contengan este CP exacto en su array de códigos postales
    const postalCodeQuery = query(
      collection(FirebaseDB, SHIPPING_ZONES_COLLECTION),
      where('activo', '==', true),
      where('codigos_postales', 'array-contains', postalCode)
    );
    
    const querySnapshot = await getDocs(postalCodeQuery);
    const zones = [];
    
    querySnapshot.forEach(doc => {
      zones.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`🔍 Zonas encontradas con CP ${postalCode} exacto: ${zones.length}`);
    return zones;
  } catch (error) {
    console.error(`Error buscando zonas con CP ${postalCode} exacto:`, error);
    return [];
  }
};

/**
 * Obtiene zonas de envío aplicables a un código postal
 * @param {string} postalCode - Código postal del usuario
 * @returns {Promise<Array>} Zonas de envío aplicables
 */
export const getShippingZonesForPostalCode = async (postalCode) => {
  try {
    if (!postalCode) {
      console.warn('⚠️ Código postal no proporcionado');
      return [];
    }
    
    // Normalizar el código postal para comparaciones
    const normalizedPostalCode = postalCode.trim();
    console.log(`🔎 Buscando zonas para CP: ${normalizedPostalCode}`);
    
    // 1. Primero intentar búsqueda directa (más eficiente)
    let applicableZones = await getZonesWithExactPostalCode(normalizedPostalCode);
    
    // 2. Si no encontramos zonas específicas, obtener todas y filtrar con nuestra lógica extendida
    if (applicableZones.length === 0) {
      console.log(`ℹ️ No se encontraron zonas directas, aplicando filtros manuales`);
      
      // Obtener todas las zonas activas
      const allZones = await getActiveShippingZones();
      
      // Filtrar zonas que aplican al código postal
      applicableZones = allZones.filter(zone => {
        // 1. Zonas nacionales aplican a cualquier CP
        if (zone.tipo === 'nacional' || 
            zone.cobertura === 'nacional' || 
            zone.zona?.toLowerCase() === 'nacional' || 
            zone.coverage_type?.toLowerCase() === 'nacional' ||
            zone.national === true) {
          console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica porque es nacional`);
          return true;
        }
        
        // 2. Zonas con lista de códigos postales específicos
        if (zone.codigos_postales && Array.isArray(zone.codigos_postales)) {
          // Verificar si el código postal está en la lista (con normalización)
          const codeInList = zone.codigos_postales.some(cp => 
            cp.toString().trim() === normalizedPostalCode
          );
          
          if (codeInList) {
            console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por coincidencia de CP en lista`);
            return true;
          }
        }
        
        // 3. Zonas con rango de códigos postales
        if (zone.codigo_postal_desde && zone.codigo_postal_hasta) {
          const pcNum = parseInt(normalizedPostalCode);
          const fromNum = parseInt(zone.codigo_postal_desde.toString());
          const toNum = parseInt(zone.codigo_postal_hasta.toString());
          
          if (!isNaN(pcNum) && !isNaN(fromNum) && !isNaN(toNum) && 
              pcNum >= fromNum && pcNum <= toNum) {
            console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por rango de CP ${fromNum}-${toNum}`);
            return true;
          }
        }
        
        // 4. Zonas con formato antiguo de coverage
        if (zone.coverage && zone.coverage.type) {
          // Tipo nacional
          if (zone.coverage.type === 'nationwide' || 
              zone.coverage.type === 'nacional' || 
              zone.coverage.type === 'national') {
            console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica porque tiene coverage type nacional`);
            return true;
          }
          
          // Tipo código postal
          if ((zone.coverage.type === 'postal_code' || 
               zone.coverage.type === 'codigo_postal' || 
               zone.coverage.type === 'zipcode') && 
              zone.coverage.values && Array.isArray(zone.coverage.values)) {
            
            // Verificar si el código postal está en los valores de cobertura
            const codeInValues = zone.coverage.values.some(value => {
              // Puede ser un string o un objeto con propiedad code o codigo
              if (typeof value === 'string') {
                return value.trim() === normalizedPostalCode;
              } else if (value && (value.code || value.codigo)) {
                const code = (value.code || value.codigo).toString().trim();
                return code === normalizedPostalCode;
              }
              return false;
            });
            
            if (codeInValues) {
              console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por coincidencia en coverage.values`);
              return true;
            }
          }
        }
        
        // 5. Coincidir con propiedad zip_codes en cualquier formato
        if (zone.zip_codes) {
          if (Array.isArray(zone.zip_codes)) {
            // Si es un array, buscar coincidencia directa
            const codeInList = zone.zip_codes.some(cp => 
              cp.toString().trim() === normalizedPostalCode
            );
            
            if (codeInList) {
              console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por coincidencia en zip_codes array`);
              return true;
            }
          } else if (typeof zone.zip_codes === 'string') {
            // Si es string, dividir por comas y buscar
            const codesArray = zone.zip_codes.split(',').map(cp => cp.trim());
            const codeInList = codesArray.includes(normalizedPostalCode);
            
            if (codeInList) {
              console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por coincidencia en zip_codes string`);
              return true;
            }
          }
        }
        
        // 6. Comprobar campo zipcode o zip
        if (zone.zipcode === normalizedPostalCode || zone.zip === normalizedPostalCode) {
          console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por coincidencia exacta de zipcode`);
          return true;
        }
        
        // 7. Si tiene una propiedad codigo_postal que coincide
        if (zone.codigo_postal && zone.codigo_postal.toString().trim() === normalizedPostalCode) {
          console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por coincidencia en codigo_postal`);
          return true;
        }
        
        // Si no coincide por ningún criterio, no aplica
        return false;
      });
    }
    
    console.log(`🗺️ Zonas aplicables al CP ${normalizedPostalCode}: ${applicableZones.length}`);
    
    // Si no hay zonas aplicables, buscar zonas nacionales
    if (applicableZones.length === 0) {
      console.log('⚠️ No hay zonas específicas para este CP, buscando zonas nacionales');
      const allZones = await getActiveShippingZones();
      
      // Filtrar solo zonas nacionales
      const nationalZones = allZones.filter(zone => 
        zone.tipo === 'nacional' || 
        zone.cobertura === 'nacional' || 
        zone.zona?.toLowerCase() === 'nacional' || 
        zone.coverage_type?.toLowerCase() === 'nacional' ||
        zone.national === true
      );
      
      if (nationalZones.length > 0) {
        console.log(`✅ Encontradas ${nationalZones.length} zonas nacionales como alternativa`);
        return nationalZones;
      }
    }
    
    return applicableZones;
  } catch (error) {
    console.error('Error al obtener zonas para código postal:', error);
    return [];
  }
};

/**
 * Calcula el precio de envío para unos productos según la regla y opción de mensajería
 * @param {Array} products - Productos a enviar
 * @param {Object} shippingOption - Opción de mensajería
 * @param {Object} zone - Zona de envío
 * @returns {Object} - Información del precio calculado
 */
export const calculateShippingPrice = (products, shippingOption = {}, zone = {}) => {
  try {
    // Si no hay productos o zona, devolver precio 0
    if (!products || !Array.isArray(products) || products.length === 0 || !zone) {
      return {
        price: 0,
        basePrice: 0,
        isFree: true,
        productCount: 0,
        totalWeight: 0,
        exceedsLimits: false
      };
    }
    
    console.log(`🧮 Calculando precio para envío con ${products.length} productos y zona ${zone.id || 'desconocida'}`);
    
    // Precio base (de la opción o de la zona)
    const basePrice = parseFloat(shippingOption.precio || 
                                shippingOption.costo_base || 
                                zone.precio || 
                                zone.costo_base || 
                                0);
    
    // Verificar si hay una regla explícita de envío gratis: directa o por monto mínimo
    const hasForcedFreeShipping = 
      // Envío gratis directo en zona u opción
      zone.envio_gratis === true || 
      shippingOption.envio_gratis === true ||
      // Envío gratis específico para el producto
      products.some(item => {
        const product = item.product || item;
        // Verificar si el producto tiene envío gratis explícito
        return product.free_shipping === true || 
               product.envio_gratis === true ||
               product.shipping_free === true;
      });
    
    // Si está forzado como gratis, terminamos rápido
    if (hasForcedFreeShipping) {
      console.log('✅ Envío gratuito forzado por regla explícita');
      return {
        price: 0,
        basePrice,
        isFree: true,
        freeReason: 'Envío gratuito para este método',
        productCount: products.length,
        totalWeight: products.reduce((sum, item) => {
          const product = item.product || item;
          const quantity = item.quantity || 1;
          const weight = parseFloat(product.weight || product.peso || 0) * quantity;
          return sum + weight;
        }, 0),
        subtotal: products.reduce((sum, item) => {
          const product = item.product || item;
          const quantity = item.quantity || 1;
          const price = parseFloat(product.price || product.precio || 0) * quantity;
          return sum + price;
        }, 0),
        exceedsLimits: false
      };
    }
    
    // Calcular cantidad de productos y peso total
    const productCount = products.length;
    let totalWeight = 0;
    let subtotal = 0;
    
    products.forEach(item => {
      const product = item.product || item;
      const quantity = item.quantity || 1;
      
      // Sumar al peso total
      const productWeight = parseFloat(product.weight || product.peso || 0) * quantity;
      totalWeight += productWeight;
      
      // Sumar al subtotal
      const price = parseFloat(product.price || product.precio || 0) * quantity;
      subtotal += price;
    });
    
    // Verificar límites de paquetes - con manejo especial para paquetes pequeños
    const checkPackageLimits = () => {
      const packageConfig = zone.configuracion_paquetes || {};
      
      // Si solo hay un producto, no considerarlo como exceso
      if (products.length === 1) {
        console.log('ℹ️ Solo hay un producto, ignorando límites de paquete');
        return { exceedsLimits: false };
      }
      
      // Límite de productos por paquete
      if (packageConfig.maximo_productos_por_paquete && 
          productCount > packageConfig.maximo_productos_por_paquete) {
        // En vez de fallar, podríamos considerar envío en múltiples paquetes
        console.log(`⚠️ Excede el máximo de ${packageConfig.maximo_productos_por_paquete} productos por paquete`);
        
        // Calcular cuántos paquetes serían necesarios
        const requiredPackages = Math.ceil(productCount / packageConfig.maximo_productos_por_paquete);
        
        if (requiredPackages > 1) {
          return {
            exceedsLimits: false, // No fallamos, pero indicamos que son múltiples paquetes
            isMultiPackage: true,
            packageCount: requiredPackages,
            limitMessage: `Requiere ${requiredPackages} paquetes (máx. ${packageConfig.maximo_productos_por_paquete} productos por paquete)`
          };
        }
      }
      
      // Límite de peso por paquete
      if (packageConfig.peso_maximo_paquete && 
          totalWeight > packageConfig.peso_maximo_paquete) {
        // En vez de fallar, podríamos considerar envío en múltiples paquetes
        console.log(`⚠️ Excede el peso máximo de ${packageConfig.peso_maximo_paquete} por paquete`);
        
        // Calcular cuántos paquetes serían necesarios
        const requiredPackages = Math.ceil(totalWeight / packageConfig.peso_maximo_paquete);
        
        if (requiredPackages > 1) {
          return {
            exceedsLimits: false, // No fallamos, pero indicamos que son múltiples paquetes
            isMultiPackage: true,
            packageCount: requiredPackages,
            limitMessage: `Requiere ${requiredPackages} paquetes (máx. ${packageConfig.peso_maximo_paquete} de peso por paquete)`
          };
        }
      }
      
      return { exceedsLimits: false };
    };
    
    // Verificar si el paquete excede límites
    const limitCheck = checkPackageLimits();
    
    // Si excede límites y no se puede manejar como múltiples paquetes
    if (limitCheck.exceedsLimits && !limitCheck.isMultiPackage) {
      console.log('❌ Los productos exceden límites y no se pueden dividir en paquetes');
      return {
        ...limitCheck,
        price: 0,
        basePrice: 0,
        isFree: false,
        productCount,
        totalWeight
      };
    }
    
    // Calcular costos extra por productos adicionales
    const extraProductCost = () => {
      let cost = 0;
      
      // Configuración de productos extra
      const extraProductConfig = zone.producto_extra || shippingOption.producto_extra || {};
      
      // Si hay configuración de costo por producto extra
      if (extraProductConfig.costo_por_producto && extraProductConfig.cantidad_base) {
        const baseCount = parseInt(extraProductConfig.cantidad_base);
        const extraCost = parseFloat(extraProductConfig.costo_por_producto);
        
        if (!isNaN(baseCount) && !isNaN(extraCost) && productCount > baseCount) {
          const extraProducts = productCount - baseCount;
          cost = extraProducts * extraCost;
          console.log(`📌 Costo extra por ${extraProducts} productos adicionales: $${cost.toFixed(2)}`);
        }
      }
      
      return cost;
    };
    
    // Calcular costos extra por peso adicional
    const extraWeightCost = () => {
      let cost = 0;
      
      // Configuración de peso extra
      const extraWeightConfig = zone.peso_extra || shippingOption.peso_extra || {};
      
      // Si hay configuración de costo por peso extra
      if (extraWeightConfig.costo_por_kilo && extraWeightConfig.peso_base) {
        const baseWeight = parseFloat(extraWeightConfig.peso_base);
        const extraCost = parseFloat(extraWeightConfig.costo_por_kilo);
        
        if (!isNaN(baseWeight) && !isNaN(extraCost) && totalWeight > baseWeight) {
          const extraWeight = totalWeight - baseWeight;
          cost = extraWeight * extraCost;
          console.log(`📌 Costo extra por ${extraWeight.toFixed(2)} kg adicionales: $${cost.toFixed(2)}`);
        }
      }
      
      return cost;
    };
    
    // Calcular costos adicionales
    const productExtraCost = extraProductCost();
    const weightExtraCost = extraWeightCost();
    const extraCosts = productExtraCost + weightExtraCost;
    
    // Factor multiplicador para múltiples paquetes
    const packageMultiplier = limitCheck.isMultiPackage ? 
      limitCheck.packageCount || Math.ceil(productCount / (zone.configuracion_paquetes?.maximo_productos_por_paquete || 1)) : 
      1;
    
    console.log(`📦 Factor multiplicador por paquetes: ${packageMultiplier}`);
    
    // Verificar si califica para envío gratis por monto mínimo
    const freeShippingMinAmount = parseFloat(zone.envio_gratis_monto_minimo || 
                                             shippingOption.envio_gratis_monto_minimo || 
                                             0);
    
    const qualifiesForFreeShipping = !isNaN(freeShippingMinAmount) && 
                                     freeShippingMinAmount > 0 && 
                                     subtotal >= freeShippingMinAmount;
    
    if (qualifiesForFreeShipping) {
      console.log(`✅ Califica para envío gratis por monto mínimo (subtotal: $${subtotal.toFixed(2)}, mínimo: $${freeShippingMinAmount.toFixed(2)})`);
    }
    
    // Determinar si el envío es gratuito
    const isFree = hasForcedFreeShipping || qualifiesForFreeShipping;
    
    // Calcular precio final
    const finalPrice = isFree ? 0 : (basePrice * packageMultiplier + extraCosts);
    
    console.log(`💰 Precio final calculado: $${finalPrice.toFixed(2)}`);
    
    // Preparar razón para envío gratuito (si aplica)
    let freeReason = null;
    if (isFree) {
      if (hasForcedFreeShipping) {
        freeReason = 'Envío gratuito para este método';
      } else if (qualifiesForFreeShipping) {
        freeReason = `Envío gratuito por compra mínima de $${freeShippingMinAmount.toFixed(2)}`;
      }
    }
    
    return {
      price: finalPrice,
      basePrice,
      isFree,
      freeReason,
      productCount,
      totalWeight,
      subtotal,
      extraProductCost: productExtraCost,
      extraWeightCost: weightExtraCost,
      exceedsLimits: false,
      isMultiPackage: limitCheck.isMultiPackage || false,
      packageCount: limitCheck.packageCount || 1
    };
  } catch (error) {
    console.error('Error al calcular precio de envío:', error);
    // En caso de error, retornar un precio válido por defecto
    return {
      price: 0,
      basePrice: 0,
      isFree: false,
      exceedsLimits: false,
      isError: true,
      errorMessage: 'Error al calcular precio'
    };
  }
}; 