/**
 * Constantes para el módulo de envío
 */

/**
 * Nombres de colecciones en Firestore
 */
export const FIRESTORE_COLLECTIONS = {
  SHIPPING_RULES: 'zonas_envio',
  PRODUCTS: 'products',
  ADDRESSES: 'addresses'
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
 * Valores por defecto para configuración de paquetes
 * Usados cuando faltan valores en la regla de envío
 */
export const PACKAGE_CONFIG_DEFAULTS = {
  peso_maximo_paquete: 20, // kg
  maximo_productos_por_paquete: 10,
  costo_por_kg_extra: 50, // precio por kg adicional
};

/**
 * Constantes para tipos de cobertura en reglas de envío
 */
export const COVERAGE_TYPES = {
  ZIP: 'zip',
  STATE: 'state',
  NATIONAL: 'national'
};

/**
 * Prefijo para reglas de estado en zonas_envio
 */
export const STATE_PREFIX = 'estado_';

/**
 * Palabra clave para cobertura nacional
 */
export const NATIONAL_KEYWORD = 'nacional'; 