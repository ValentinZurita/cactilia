/**
 * Index file for shipping package
 * Export all shipping-related package for use in the checkout flow
 */

// Main shipping package
export { default as ShippingSelector } from './ShippingSelector.jsx'
export { default as ShippingGroupSelector } from './ShippingGroupSelector.jsx'
export { default as ShippingOption } from './ShippingOption.jsx'
export { default as ShippingOptionsEmpty } from './ShippingOptionsEmpty'

// Hooks
export { useShippingOptions2 } from '../../hooks/useShippingOptions2.js'

// Debug package
export { default as ShippingDebugPanel } from './ShippingDebugPanel'

// Utilities
export {
  formatShippingCost,
  hasValidOptions,
  identifyShippingType,
  calculateShippingOptionsGroups,
  getGroupLabel,
  coversAllProducts,
  calculateEstimatedDelivery,
  filterShippingOptions,
} from '../../utils/shippingUtils.js'

// Constants
export * from '../../constants/ShippingConstants2.js'

// Services 
export * from '../../checkout/services/shipping/index.js'