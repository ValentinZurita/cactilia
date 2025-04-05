/**
 * Índice de exportación para el módulo de envío
 * ADAPTADO para la estructura específica de Cactilia
 */

// Componentes
export { default as ShippingCalculator } from './components/shipping/ShippingCalculator';
export { default as ShippingOptionSelector } from './components/shipping/ShippingOptionSelector';

// Servicios
export {
  groupProductsByShippingRules,
  prepareShippingOptionsForCheckout
} from './services/shippingGroupingService';

// API
export {
  fetchShippingRules,
  fetchShippingRuleById,
  fetchShippingRulesByZipCode,
  fetchDefaultNationalRule
} from '../../modules/admin/shipping/api/shippingApi';

// Utilidades
export {
  groupProductsIntoPackages,
  calculatePackageCost,
  calculateTotalShippingCost,
  shouldApplyFreeShipping
} from './utils/shippingCalculator';

export {
  isRuleValidForAddress,
  calculateGroupSubtotal,
  calculateGroupWeight,
  formatShippingCost,
  createDefaultShippingRule
} from './utils/shippingUtils';