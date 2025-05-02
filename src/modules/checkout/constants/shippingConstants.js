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

/**
 * Mapeo de nombres de estados a sus abreviaciones
 * Se usa para convertir nombres completos (de addresses) a formato abreviado (de zonas_envio)
 */
export const STATE_ABBREVIATIONS = {
  'Aguascalientes': 'AGS',
  'Baja California': 'BC',
  'Baja California Sur': 'BCS',
  'Campeche': 'CAM',
  'Chiapas': 'CHIS',
  'Chihuahua': 'CHIH',
  'Ciudad de México': 'CDMX',
  'Coahuila': 'COAH',
  'Colima': 'COL',
  'Durango': 'DGO',
  'Estado de México': 'MEX',
  'Guanajuato': 'GTO',
  'Guerrero': 'GRO',
  'Hidalgo': 'HGO',
  'Jalisco': 'JAL',
  'Michoacán': 'MICH',
  'Morelos': 'MOR',
  'Nayarit': 'NAY',
  'Nuevo León': 'NL',
  'Oaxaca': 'OAX',
  'Puebla': 'PUE',
  'Querétaro': 'QRO',
  'Quintana Roo': 'QROO',
  'San Luis Potosí': 'SLP',
  'Sinaloa': 'SIN',
  'Sonora': 'SON',
  'Tabasco': 'TAB',
  'Tamaulipas': 'TAMPS',
  'Tlaxcala': 'TLAX',
  'Veracruz': 'VER',
  'Yucatán': 'YUC',
  'Zacatecas': 'ZAC'
};

/**
 * Nombres de colecciones en Firestore usadas en el checkout/shipping
 */
export const FIRESTORE_COLLECTIONS = {
  SHIPPING_RULES: 'zonas_envio',
  // PRODUCTS: 'products', // Probablemente definido en otro lugar globalmente
  // ADDRESSES: 'addresses' // Probablemente definido en otro lugar globalmente
};

/**
 * Prefijo para reglas de estado en zonas_envio
 */
export const STATE_PREFIX = 'estado_';

/**
 * Palabra clave para cobertura nacional
 */
export const NATIONAL_KEYWORD = 'nacional'; 