/**
 * Exportaciones principales del módulo NewShipping3
 * Proporciona acceso a componentes, hooks y utilidades
 */

// Componentes principales
export { ShippingManager } from './components/ShippingManager.jsx'
export { ShippingManagerForCheckout } from './components/ShippingManagerForCheckout.jsx'
export { ShippingOptions } from './components/ShippingOptions.jsx'
export { AddressSelector } from './components/AddressSelector.jsx'
export { ShippingPackage } from './components/ShippingPackage.jsx'
export { UnshippableProducts } from './components/UnshippableProducts.jsx'

// Hooks
export { useShippingOptions } from './hooks/useShippingOptions.js'
export { useShippingRules } from './hooks/useShippingRules.js'
export { useGreedyPackaging } from './hooks/useGreedyPackaging.js'

// Servicios
export {
  fetchAllShippingRules,
  fetchShippingRuleById,
  fetchShippingRulesByIds,
} from './services/shippingRulesService.js'

export {
  fetchProductById,
  fetchProductsByIds,
  extractShippingRuleIds,
} from './services/productsService.js'

export {
  fetchAddressById,
  fetchAddressesByUserId,
} from './services/addressesService.js'

// Utilidades
export {
  isRuleApplicableForAddress,
  getCoverageType,
  doesRuleCoverZipCode,
  doesRuleCoverState,
  hasNationalCoverage,
  getStateIdentifier,
} from './utils/coverageUtils.js'

export {
  groupIntoPackages,
  calculatePackageCost,
  calculateTotalShippingCost,
  calculateItemWeight,
  calculateTotalWeight,
} from './utils/packagingUtils.js'

export {
  filterShippableProducts,
  getApplicableRules,
  groupProductsByShippingRule,
  prepareShippingOptions,
} from './utils/shippingUtils.js'