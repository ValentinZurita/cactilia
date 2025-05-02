/**
 * Constants shared across the checkout and shipping modules
 */

/**
 * Coverage types in shipping rules
 */
export const COVERAGE_TYPES = {
  NATIONAL: 'nacional',
  STATE_PREFIX: 'estado_',
  ZIP_SPECIFIC: 'zipcode'
};

/**
 * Rule configuration fallback values - used ONLY when a valid rule exists but 
 * has incomplete configuration parameters in Firebase.
 * 
 * These are NEVER used to create shipping options for products that lack rules.
 * If a product has no valid shipping rules, it's excluded from shipping entirely.
 */
export const RULE_CONFIG_FALLBACKS = {
  // These values are only used when the corresponding values
  // are missing or invalid in the shipping rule from Firebase
  PACKAGE_CONFIG: {
    peso_maximo_paquete: 20, // kg
    maximo_productos_por_paquete: 10,
    costo_por_kg_extra: 10
  },
  DELIVERY_TIME: {
    minDays: 3,
    maxDays: 7
  }
}; 