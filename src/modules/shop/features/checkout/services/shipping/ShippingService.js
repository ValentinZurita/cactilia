import { getActiveShippingZones, getShippingZonesForPostalCode } from './ShippingZonesService';
import { groupProductsByRule, allProductsCovered } from './RuleService';
import { buildCombinations } from './CombinationService';

/**
 * Main ShippingService to coordinate shipping functionality
 */
class ShippingService {
  /**
   * Get all available shipping options for a cart and address
   * @param {Array} cartItems - Cart items with product information
   * @param {Object} addressInfo - User's address information
   * @returns {Promise<Array>} - Array of shipping options organized for display
   */
  async getShippingOptions(cartItems, addressInfo) {
    try {
      if (!cartItems?.length) {
        console.log('⚠️ No cart items provided');
        return [];
      }

      // Normalize address format - handle both postalCode and zip/zipcode formats
      let postalCode = addressInfo?.postalCode || addressInfo?.zip || addressInfo?.zipcode || '';
      if (!postalCode) {
        console.log('⚠️ No postal code provided in address:', addressInfo);
        throw new Error('Se requiere un código postal para calcular opciones de envío');
      }

      // Normalizar código postal: eliminar espacios, guiones y asegurar formato consistente
      postalCode = postalCode.toString().trim().replace(/[-\s]/g, '');
      
      // Log detallado de dirección para debug
      console.log('🏠 Información completa de dirección para envío:', {
        postalCode,
        state: addressInfo?.state || addressInfo?.provincia || addressInfo?.estado || '',
        city: addressInfo?.city || addressInfo?.ciudad || addressInfo?.localidad || '',
        fullAddress: addressInfo
      });

      const normalizedAddress = {
        ...addressInfo,
        postalCode,
        state: addressInfo?.state || addressInfo?.provincia || addressInfo?.estado || '',
        city: addressInfo?.city || addressInfo?.ciudad || addressInfo?.localidad || ''
      };

      console.log('🔍 Fetching shipping zones for postal code:', postalCode);
      
      // Get applicable shipping zones
      const zones = await getShippingZonesForPostalCode(postalCode);
      console.log(`✅ Found ${zones.length} applicable shipping zones for postal code ${postalCode}`);
      
      // Si encontramos zonas, mostrar detalles para debugging
      if (zones.length > 0) {
        console.log('🗺️ Zonas aplicables encontradas:', zones.map(zone => ({
          id: zone.id,
          nombre: zone.nombre || zone.zona || 'Sin nombre',
          tipo: zone.tipo || zone.coverage_type || 'estándar'
        })));
      }

      // Group products by shipping rule
      const productGroups = groupProductsByRule(cartItems);
      console.log('🔍 Products grouped by rule:', productGroups.length, 'groups');
      
      // Log detallado de los grupos para diagnóstico
      productGroups.forEach((group, index) => {
        console.log(`🧩 Grupo ${index + 1}: Regla ${group.ruleId}, ${group.products.length} productos`);
        
        // Mostrar qué productos están en este grupo
        const productIds = group.products.map(p => p.product?.id || p.id);
        console.log(`📦 Productos en grupo ${index + 1}:`, productIds);
      });
      
      let combinations = [];
      
      if (zones?.length) {
        // Build shipping combinations
        combinations = buildCombinations(cartItems, zones, productGroups);
        console.log(`✅ Generated ${combinations.length} shipping combinations`);
        
        // Si hay combinaciones, mostrar detalles
        if (combinations.length > 0) {
          console.log('📊 Resumen de combinaciones generadas:');
          combinations.forEach((combo, index) => {
            console.log(`  Combinación ${index + 1}: ${combo.options.length} opciones, precio total $${combo.totalPrice.toFixed(2)}`);
          });
        }
      }
      
      // If no zones or combinations, try fallback to all active zones
      if (!zones?.length || combinations.length === 0) {
        console.warn('⚠️ No valid combinations found, trying with ALL shipping rules...');
        console.log('📌 Posibles razones: 1) No hay zonas para este CP, 2) Los productos no tienen reglas compatibles, 3) Restricciones de paquetes');
        
        // As a last resort, try with all rules
        const allZones = await getActiveShippingZones();
        console.log(`✅ FALLBACK: Found ${allZones.length} total shipping zones`);
        
        if (allZones?.length) {
          combinations = buildCombinations(cartItems, allZones, productGroups);
          console.log(`✅ FALLBACK: Generated ${combinations.length} shipping combinations with all zones`);
        }
      }
      
      // Si aún no tenemos combinaciones, crear una opción de respaldo (garantizada)
      if (combinations.length === 0 && cartItems.length > 0) {
        console.warn('⚠️ No se encontraron combinaciones válidas después de intentar con todas las reglas');
        console.log('💡 Creando opción de envío de respaldo para garantizar la experiencia del usuario');
        
        // Crear una opción de respaldo que siempre funcione
        combinations = [{
          id: `fallback-${Date.now()}`,
          options: [{
            id: 'fallback-option',
            zoneId: 'fallback',
            zoneName: 'Envío especial',
            zoneType: 'nacional',
            optionName: 'Servicio Multi-Productos',
            carrierId: 'default',
            carrierName: 'Servicio Integral de Envíos',
            products: cartItems,
            price: 950, // Precio fijo razonable para el fallback
            basePrice: 950,
            isFree: false,
            multiPackage: true,
            packageCount: Math.ceil(cartItems.length / 2),
            estimatedDelivery: '5-10 días hábiles',
            isFallback: true
          }],
          totalPrice: 950,
          isComplete: true,
          isFallback: true
        }];
        
        console.log('✅ Opción de respaldo creada para evitar fallo del checkout');
      }
      
      // Transform combinations to options format for the UI
      const options = this.transformCombinationsToOptions(combinations, cartItems);
      
      // Log final de opciones para mostrar al usuario
      console.log(`✅ ${options.length} opciones finales disponibles para mostrar al usuario`);
      
      return options;
    } catch (error) {
      console.error('Error getting shipping options:', error);
      
      // En caso de error, devolver una opción de fallback en lugar de propagar el error
      console.warn('⚠️ Error en el servicio de envío, creando opción de respaldo para evitar bloqueo');
      
      const fallbackOption = [{
        id: `error-fallback-${Date.now()}`,
        name: 'Envío especial',
        carrier: 'Servicio Integral',
        description: 'Envío especial para todos tus productos',
        type: 'nacional',
        minDays: 5,
        maxDays: 10,
        price: 950,
        productIds: cartItems.map(item => item.id || item.product?.id),
        coversAllProducts: true,
        isFallback: true
      }];
      
      return fallbackOption;
    }
  }
  
  /**
   * Genera una descripción clara para una opción de envío
   * @param {Object} option - Opción de envío
   * @returns {string} - Descripción formateada
   */
  generateOptionDescription(option) {
    if (!option) return '';
    
    // Si es una opción simple
    if (!option.combination || !option.combination.options) {
      return option.carrierName || option.carrier || 'Servicio de envío';
    }
    
    // Para combinaciones, crear una descripción sin duplicados
    const uniqueServices = new Set();
    option.combination.options.forEach(opt => {
      let serviceName = opt.carrierName || opt.carrier || opt.name;
      if (opt.optionName && opt.optionName !== serviceName) {
        serviceName += ` - ${opt.optionName}`;
      }
      uniqueServices.add(serviceName);
    });
    
    return Array.from(uniqueServices).join(' + ');
  }
  
  /**
   * Transform raw shipping combinations into a format suitable for the UI
   * @param {Array} combinations - Raw shipping combinations
   * @param {Array} cartItems - Cart items
   * @returns {Array} - Transformed shipping options
   */
  transformCombinationsToOptions(combinations, cartItems) {
    if (!combinations || combinations.length === 0) {
      return [];
    }
    
    // Extraer IDs únicos de productos en el carrito para mejor conteo
    const cartProductIds = new Set();
    cartItems.forEach(item => {
      const productId = item.product?.id || item.id;
      if (productId) cartProductIds.add(productId);
    });
    console.log(`🧮 Total de productos únicos en carrito: ${cartProductIds.size}`);
    
    const options = [];
    
    combinations.forEach(combination => {
      if (!combination.options || combination.options.length === 0) return;
      
      // Generar un ID único para esta combinación
      const combinationId = combination.id || `combo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Verificar si todos los productos en esta combinación tienen envío gratis
      const allProductsFree = combination.options.every(opt => 
        opt.freeShipping || opt.isFree || opt.price === 0
      );
      
      // Crear descripción clara sin duplicados
      const description = this.generateOptionDescription({
        combination: {
          options: combination.options
        }
      });
      
      // Determinar el tipo de combinación
      const hasLocalDelivery = combination.options.some(opt => 
        opt.zoneType?.toLowerCase() === 'local' || 
        opt.zoneName?.toLowerCase() === 'local'
      );
      
      const hasNationalDelivery = combination.options.some(opt => 
        opt.zoneType?.toLowerCase() === 'nacional' || 
        opt.zoneName?.toLowerCase() === 'national' ||
        opt.zoneName?.toLowerCase() === 'nacional'
      );
      
      let combinationType = 'combined';
      let combinationName = `Combinación de servicios (${combination.options.length})`;
      
      if (hasLocalDelivery && hasNationalDelivery) {
        combinationType = 'local_national';
        combinationName = 'Combinación Local y Nacional';
      }
      
      // Crear la opción
      const option = {
        id: combinationId,
        type: combinationType,
        name: combinationName,
        description,
        price: allProductsFree ? 0 : combination.totalPrice,
        isFree: allProductsFree,
        freeShipping: allProductsFree,
        freeShippingReason: allProductsFree ? 'Envío gratuito para todos los productos' : null,
        combination: {
          id: combinationId,
          isComplete: combination.isComplete || false,
          options: combination.options
        },
        // Información de entrega
        minDays: Math.min(...combination.options.map(opt => 
          parseInt(opt.estimatedDelivery?.split('-')[0]) || 1
        )),
        maxDays: Math.max(...combination.options.map(opt => 
          parseInt(opt.estimatedDelivery?.split('-')[1]) || 7
        )),
        // Información de paquetes
        multiPackage: combination.options.length > 1,
        packageCount: combination.options.length
      };
      
      options.push(option);
    });
    
    // Ordenar por precio y si es envío gratis
    return options.sort((a, b) => {
      if (a.isFree && !b.isFree) return -1;
      if (!a.isFree && b.isFree) return 1;
      return a.price - b.price;
    });
  }
  
  /**
   * Extract minimum days from delivery time string
   * @param {string} deliveryTime - Delivery time string (e.g., "3-5 días")
   * @returns {number} - Minimum days
   */
  extractMinDays(deliveryTime) {
    if (!deliveryTime) return 3; // default
    
    const match = deliveryTime.match(/(\d+)[-–](\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
    
    const singleMatch = deliveryTime.match(/(\d+)/);
    if (singleMatch) {
      return parseInt(singleMatch[1]);
    }
    
    return 3; // default
  }
  
  /**
   * Extract maximum days from delivery time string
   * @param {string} deliveryTime - Delivery time string (e.g., "3-5 días")
   * @returns {number} - Maximum days
   */
  extractMaxDays(deliveryTime) {
    if (!deliveryTime) return 7; // default
    
    const match = deliveryTime.match(/(\d+)[-–](\d+)/);
    if (match) {
      return parseInt(match[2]);
    }
    
    const singleMatch = deliveryTime.match(/(\d+)/);
    if (singleMatch) {
      return parseInt(singleMatch[1]);
    }
    
    return 7; // default
  }
}

// Export as a singleton instance
const shippingService = new ShippingService();

// Export both the instance and the class
export { shippingService, ShippingService };
export default ShippingService;

// Exportar función directa para componentes
export const getShippingOptions = (cartItems, addressInfo) => 
  shippingService.getShippingOptions(cartItems, addressInfo);

// Exportar funciones individuales para acceso directo
export { getActiveShippingZones, getShippingZonesForPostalCode }; 