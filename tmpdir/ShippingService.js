/**
 * ShippingService - Servicio para gestionar opciones de envío
 * 
 * Este servicio proporciona la funcionalidad principal para calcular y optimizar
 * opciones de envío basadas en el carrito y la dirección del usuario.
 */

import { getActiveShippingZones, getShippingZonesForPostalCode } from './ShippingZonesService';
import { findBestShippingOptions } from './ShippingRulesEngine';
import { findBestShippingOptionsGreedy } from './ShippingRulesGreedy';

/**
 * Main ShippingService to coordinate shipping functionality
 */
class ShippingService {
  // ... código existente ...
}

// Export as a singleton instance
const shippingService = new ShippingService();

/**
 * Get all available shipping options for a cart and address
 * @param {Array} cartItems - Cart items with product information
 * @param {Object} addressInfo - User's address information
 * @param {Boolean} useGreedy - Use the Greedy algorithm for optimization (default: true)
 * @returns {Promise<Array>} - Array of shipping options
 */
export const getShippingOptions = async (cartItems, addressInfo, useGreedy = true) => {
  try {
    // Validaciones básicas
    if (!cartItems?.length) {
      console.log('⚠️ No cart items provided');
      return [];
    }

    // Normalize address format
    let postalCode = addressInfo?.postalCode || addressInfo?.zip || addressInfo?.zipcode || '';
    if (!postalCode) {
      console.log('⚠️ No postal code provided in address:', addressInfo);
      throw new Error('Se requiere un código postal para calcular opciones de envío');
    }

    // Normalizar código postal
    postalCode = postalCode.toString().trim().replace(/[-\s]/g, '');
    
    const normalizedAddress = {
      ...addressInfo,
      postalCode,
      state: addressInfo?.state || addressInfo?.provincia || addressInfo?.estado || '',
      city: addressInfo?.city || addressInfo?.ciudad || addressInfo?.localidad || '',
      zip: postalCode
    };

    // Obtener reglas de envío activas
    const shippingRules = await getActiveShippingZones();
    
    if (!shippingRules || shippingRules.length === 0) {
      console.warn('⚠️ No se encontraron reglas de envío activas');
      return [];
    }
    
    // NORMALIZAR PESOS: Implementación directa sin depender de métodos de clase
    const normalizedCartItems = cartItems.map(item => {
      const product = item.product || item;
      let weight = parseFloat(product.weight || product.peso || 0);
      
      // Si el producto no tiene peso definido, asignar uno estimado
      if (weight === 0) {
        weight = 0.5; // Peso genérico: 500g
        console.log(`ℹ️ Producto sin peso asignado. Se usa peso estimado de ${weight}kg`);
      }
      
      return {
        ...item,
        product: {
          ...product,
          weight: weight
        }
      };
    });
    
    // Calcular peso total para diagnóstico
    const totalCartWeight = normalizedCartItems.reduce(
      (sum, item) => sum + (item.product.weight * (item.quantity || 1)), 0
    );
    console.log(`📦 Peso total del carrito: ${totalCartWeight.toFixed(2)}kg`);
    
    // Usar el algoritmo correspondiente
    let result;
    if (useGreedy) {
      console.log('🧮 Usando algoritmo Greedy para optimizar paquetes de envío');
      result = await findBestShippingOptionsGreedy(normalizedCartItems, normalizedAddress, shippingRules);
    } else {
      console.log('🧮 Usando algoritmo standard para calcular opciones de envío');
      result = await findBestShippingOptions(normalizedCartItems, normalizedAddress, shippingRules);
    }
    
    // Verificar resultado
    if (!result.success || !result.options || result.options.length === 0) {
      console.warn('⚠️ No se encontraron opciones de envío válidas');
      return [];
    }
    
    // Simplemente retornar las opciones encontradas sin procesamiento adicional
    console.log(`✅ Se encontraron ${result.options.length} opciones de envío válidas`);
    return result.options;
  } catch (error) {
    console.error('Error getting shipping options:', error);
    // No intentar usar métodos de fallback, simplemente retornar array vacío
    return [];
  }
};

// Export for testing and extension
export { shippingService, ShippingService, getActiveShippingZones, getShippingZonesForPostalCode }; 