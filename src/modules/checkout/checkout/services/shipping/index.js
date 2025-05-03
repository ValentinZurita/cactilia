/* eslint-disable */
/**
 * Entry point for shipping-related services and utilities.
 * Centralizes access to different shipping calculation engines and helpers.
 */

// Importar servicios principales
import ShippingService, { getShippingOptions, shippingService } from '../../../../../services/ShippingService.js' // Wrapper del Greedy
// Eliminar importación del servicio de zonas
// import * as ShippingZonesService from '../../../services/ShippingZonesService.js';
// Eliminar importación del motor de reglas no usado
// import * as ShippingRulesEngine from '../../../services/ShippingRulesEngine.js'; 
import * as ShippingRulesGreedy from '../../../services/ShippingRulesGreedy.js' // Lógica principal
// Eliminar importación del servicio de combinación no usado
// import * as CombinationService from '../../../styles/CombinationService.js'; 
// Eliminar importación del servicio de agrupación no usado
// import * as ShippingGroupingService from '../../../services/ShippingGroupingService.js'; 
import { fetchAllShippingRules } from '../../../services/shippingRulesService.js' // Para obtener reglas

/**
 * Check if all cart items are covered by the selected shipping options.
 *
 * @param {Array} cartItems - Array of cart items.
 * @param {Array} selectedOptions - Array of selected shipping option objects.
 * @returns {boolean} - True if all items are covered, false otherwise.
 */
export const areAllItemsCovered = (cartItems, selectedOptions) => {
  const coveredProductIds = new Set();
    selectedOptions.forEach(option => {
    (option.products || []).forEach(productId => {
      coveredProductIds.add(productId);
    });
  });

  const cartItemIds = cartItems.map(item => (item.product || item).id);
  return cartItemIds.every(id => coveredProductIds.has(id));
};

// Export the main service class (Wrapper del Greedy) if needed anywhere, though function export is preferred
// export default ShippingService; // Evitar default export de clase si no es necesario

// Expose individual services and functions for direct import
export {
  getShippingOptions, // Función principal del wrapper Greedy
  shippingService, // Instancia del wrapper Greedy (para compatibilidad)
  // ShippingZonesService, // Eliminar referencia
  // ShippingRulesEngine, // Eliminar referencia
  ShippingRulesGreedy, // Lógica principal
  // CombinationService, // Eliminar referencia
  // ShippingGroupingService, // Eliminar referencia
  fetchAllShippingRules // Función para obtener reglas
};

/**
 * Shorthand object for importing multiple shipping functionalities.
 */
export const shipping = {
  getOptions: getShippingOptions, // Función principal (wrapper Greedy)
  service: shippingService, // Instancia (wrapper Greedy)
  getAllRules: fetchAllShippingRules, // Obtener reglas
  // zones: ShippingZonesService, // Eliminar referencia
  // rulesEngine: ShippingRulesEngine, // Eliminar referencia
  rulesGreedy: ShippingRulesGreedy, // Lógica principal
  // combination: CombinationService, // Eliminar referencia
  // grouping: ShippingGroupingService, // Eliminar referencia
};

// Exportar el objeto shorthand como default para conveniencia
export default shipping;