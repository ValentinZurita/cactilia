/**
 * Servicios de envío
 * 
 * Este archivo exporta todos los servicios relacionados con envíos y cálculo
 * de costos de envío disponibles en la aplicación.
 */

// Importar servicios principales
import ShippingService, { getShippingOptions, shippingService } from './ShippingService';
import * as ShippingZonesService from './ShippingZonesService';
import * as ShippingRulesEngine from './ShippingRulesEngine';
import * as ShippingRulesGreedy from './ShippingRulesGreedy';
import * as CombinationService from './CombinationService';
import * as ShippingGroupingService from './ShippingGroupingService';

/**
 * Verifica si todos los productos están cubiertos por las opciones de envío seleccionadas
 * @param {Array} selectedOptions - Opciones de envío seleccionadas
 * @param {Array} cartItems - Productos en el carrito
 * @returns {boolean} - True si todos los productos del carrito están cubiertos
 */
export const allProductsCovered = (selectedOptions, cartItems) => {
  if (!selectedOptions || !cartItems || cartItems.length === 0) {
    return false;
  }

  // Obtener todos los IDs de productos del carrito
  const cartItemIds = cartItems.map(item => {
    return (item.product ? item.product.id : item.id);
  });

  // Obtener todos los IDs de productos cubiertos por las opciones de envío
  const coveredProductIds = [];
  
  // Las opciones pueden ser un array o un objeto con claves
  if (Array.isArray(selectedOptions)) {
    selectedOptions.forEach(option => {
      if (option.products && Array.isArray(option.products)) {
        coveredProductIds.push(...option.products);
      }
    });
  } else {
    // Para el caso de un objeto de selecciones
    Object.values(selectedOptions).forEach(option => {
      if (option && option.products && Array.isArray(option.products)) {
        coveredProductIds.push(...option.products);
      }
    });
  }

  // Verificar que todos los productos del carrito estén cubiertos
  return cartItemIds.every(id => coveredProductIds.includes(id));
};

// Export the main service class as default
export default ShippingService;

// Expose individual services for direct import
export {
  getShippingOptions,
  shippingService,
  ShippingZonesService,
  ShippingRulesEngine,
  ShippingRulesGreedy,
  CombinationService,
  ShippingGroupingService
};

// Export individual functions for convenience
export { 
  getActiveShippingZones, 
  getShippingZonesForPostalCode 
} from './ShippingZonesService';

export {
  groupProductsByShippingRules,
  prepareShippingOptionsForCheckout
} from './ShippingGroupingService';

/**
 * Shorthand for importing the service
 */
export const shipping = {
  getOptions: getShippingOptions,
  service: shippingService,
  zones: ShippingZonesService,
  rules: ShippingRulesEngine,
  greedy: ShippingRulesGreedy,
  combine: CombinationService,
  grouping: ShippingGroupingService
}; 