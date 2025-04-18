/**
 * Shipping Constants for the checkout system
 */

/**
 * Types of shipping
 */
export const SHIPPING_TYPES = {
  EXPRESS: 'express',
  LOCAL: 'local',
  NATIONAL: 'national',
  INTERNATIONAL: 'international',
  STANDARD: 'standard'
};

/**
 * Priority values for different shipping types (lower is higher priority)
 */
export const GROUP_PRIORITIES = {
  express: 10,
  local: 20,
  national: 30,
  international: 40,
  standard: 50
};

/**
 * Terms that identify express shipping
 */
export const EXPRESS_TERMS = ['express', 'rápido', 'urgente', '24h'];

/**
 * Terms that identify local shipping
 */
export const LOCAL_TERMS = ['local', 'ciudad', 'pickup', 'recogida'];

/**
 * Terms that identify national shipping
 */
export const NATIONAL_TERMS = ['nacional', 'estándar', 'normal'];

/**
 * Icons for different shipping types
 */
export const SHIPPING_ICONS = {
  [SHIPPING_TYPES.EXPRESS]: 'bi-lightning-charge-fill',
  [SHIPPING_TYPES.LOCAL]: 'bi-geo-alt-fill',
  [SHIPPING_TYPES.NATIONAL]: 'bi-truck',
  [SHIPPING_TYPES.INTERNATIONAL]: 'bi-globe',
  [SHIPPING_TYPES.STANDARD]: 'bi-box'
}; 