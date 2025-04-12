/**
 * ShippingService - Servicio para gestionar opciones de envío
 * 
 * Este servicio es un reemplazo simplificado del ShippingService original
 * que implementa solo las funciones necesarias para el checkout.
 */

import { getShippingOptions as getOptions } from './ShippingServiceNew';
import { getActiveShippingZones, getShippingZonesForPostalCode } from './ShippingZonesService';
import { findBestShippingOptions } from './ShippingRulesEngine';

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
        return this.createFallbackOption(cartItems);
      }
      
      // Usar el motor de reglas de envío para encontrar las mejores opciones
      const result = await findBestShippingOptions(cartItems, normalizedAddress, shippingRules);
      
      if (!result.success || !result.options || result.options.length === 0) {
        console.warn('⚠️ No se encontraron opciones de envío válidas');
        return this.createFallbackOption(cartItems);
      }
      
      return result.options;
    } catch (error) {
      console.error('Error getting shipping options:', error);
      return this.createFallbackOption(cartItems);
    }
  }
  
  /**
   * Crea una opción de envío de respaldo para casos de error
   * @param {Array} cartItems - Productos en el carrito
   * @returns {Array} - Opciones de envío de respaldo
   */
  createFallbackOption(cartItems) {
    // En lugar de crear una opción de envío hardcodeada,
    // retornar un array vacío para que el sistema maneje
    // correctamente la falta de opciones de envío
    console.warn('⚠️ No se encontraron opciones de envío válidas para estos productos');
    return [];
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

// Export the getShippingOptions function for direct use
export const getShippingOptions = (cartItems, addressInfo) => {
  // Pasar true para usar el algoritmo Greedy optimizado
  return getOptions(cartItems, addressInfo, true);
};

// Función para uso directo sin Greedy si es necesario
export const getStandardShippingOptions = (cartItems, addressInfo) => {
  return getOptions(cartItems, addressInfo, false);
};

// Re-exportar todo lo demás desde el ShippingServiceNew
export * from './ShippingServiceNew';

// Export for testing and extension
export { shippingService, ShippingService, getActiveShippingZones, getShippingZonesForPostalCode }; 