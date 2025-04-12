/**
 * Index file for shipping components
 * Export all shipping-related components for use in the checkout flow
 */

// Main shipping components
export { default as ShippingSelector } from './ShippingSelector';
export { default as ShippingGroupSelector } from './ShippingGroupSelector';
export { default as ShippingOption } from './ShippingOption';
export { default as ShippingOptionsEmpty } from './ShippingOptionsEmpty';

// Hooks
export { useShippingOptions } from './hooks/useShippingOptions';

// Debug components
export { default as ShippingDebugPanel } from './ShippingDebugPanel';

// Utilities
export {
  formatShippingCost,
  hasValidOptions,
  identifyShippingType,
  calculateShippingOptionsGroups,
  getGroupLabel,
  coversAllProducts,
  calculateEstimatedDelivery,
  filterShippingOptions
} from '../../utils/shippingUtils';

// Constants
export * from '../../constants/ShippingConstants';

// Services 
export * from '../../services/shipping'; 