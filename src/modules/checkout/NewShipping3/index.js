/**
 * Exportaciones principales del módulo NewShipping3
 * Proporciona acceso a componentes, hooks y utilidades
 */

// Componentes principales
export { ShippingManager } from './components/ShippingManager';
export { ShippingManagerForCheckout } from './components/ShippingManagerForCheckout';
export { ShippingOptions } from './components/ShippingOptions';
export { AddressSelector } from './components/AddressSelector';
export { ShippingPackage } from './components/ShippingPackage';
export { UnshippableProducts } from './components/UnshippableProducts';

// Hooks
export { useShippingOptions } from './hooks/useShippingOptions';
export { useShippingRules } from './hooks/useShippingRules'; 
export { useGreedyPackaging } from './hooks/useGreedyPackaging';

// Servicios
export { 
  fetchAllShippingRules, 
  fetchShippingRuleById, 
  fetchShippingRulesByIds 
} from './services/shippingRulesService';

export { 
  fetchProductById, 
  fetchProductsByIds, 
  extractShippingRuleIds 
} from './services/productsService';

export { 
  fetchAddressById, 
  fetchAddressesByUserId 
} from './services/addressesService';

// Utilidades
export { 
  isRuleApplicableForAddress, 
  getCoverageType,
  doesRuleCoverZipCode,
  doesRuleCoverState,
  hasNationalCoverage,
  getStateIdentifier
} from './utils/coverageUtils';

export { 
  groupIntoPackages, 
  calculatePackageCost, 
  calculateTotalShippingCost,
  calculateItemWeight,
  calculateTotalWeight
} from './utils/packagingUtils';

export { 
  filterShippableProducts,
  getApplicableRules,
  groupProductsByShippingRule,
  prepareShippingOptions
} from './utils/shippingUtils'; 