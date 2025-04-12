/**
 * Type definitions for the shipping module
 */

/**
 * @typedef {Object} ShippingRule
 * @property {string} id - Rule ID from Firestore
 * @property {string} nombre - Display name of the shipping rule
 * @property {string[]} zipcodes - Array of zipcodes covered by this rule
 * @property {boolean} activo - Whether the rule is active
 * @property {boolean} envio_gratis - Whether shipping is free unconditionally
 * @property {Object} envio_variable - Variable shipping settings
 * @property {boolean} envio_variable.aplica - Whether variable shipping applies
 * @property {number} envio_variable.envio_gratis_monto_minimo - Minimum amount for free shipping
 * @property {Object} configuracion_paquetes - Package configuration
 * @property {number} configuracion_paquetes.peso_maximo_paquete - Maximum weight per package
 * @property {number} configuracion_paquetes.maximo_productos_por_paquete - Maximum products per package
 * @property {number} configuracion_paquetes.costo_por_kg_extra - Cost per extra kg
 * @property {number} minDays - Minimum delivery days
 * @property {number} maxDays - Maximum delivery days
 * @property {number} precio - Base price for the shipping option
 */

/**
 * @typedef {Object} Product
 * @property {string} id - Product ID
 * @property {string} name - Product name
 * @property {number} weight - Product weight in kg
 * @property {number} price - Product price
 * @property {number} stock - Available stock
 * @property {string[]} shippingRuleIds - IDs of applicable shipping rules
 */

/**
 * @typedef {Object} CartItem
 * @property {Product} product - The product
 * @property {number} quantity - Quantity in cart
 */

/**
 * @typedef {Object} Address
 * @property {string} id - Address ID
 * @property {string} state - State/province
 * @property {string} zip - Postal/ZIP code
 * @property {string} city - City
 * @property {string} street - Street address
 */

/**
 * @typedef {Object} Package
 * @property {string} id - Unique package identifier
 * @property {CartItem[]} items - Products in the package
 * @property {number} totalWeight - Total weight of the package
 * @property {number} totalQuantity - Total number of items in the package
 * @property {boolean} exceedsLimits - Whether package exceeds rule limits
 */

/**
 * @typedef {Object} PackageCost
 * @property {number} baseCost - Base cost of shipping
 * @property {number} extraCost - Extra cost for overweight
 * @property {number} totalCost - Total cost for the package
 */

/**
 * @typedef {Object} ShippingOption
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} ruleId - ID of the associated shipping rule
 * @property {number} price - Base price
 * @property {string} deliveryTime - Delivery time estimate
 * @property {boolean} isFree - Whether shipping is free
 * @property {boolean} requiresPackaging - Whether packaging calculation is required
 * @property {number} calculatedCost - Final calculated cost
 * @property {Package[]} packages - Product packages for this option
 */

export {}; 