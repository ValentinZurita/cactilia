/**
 * Constantes para el módulo de shipping
 */

/**
 * Lista de transportistas/mensajerías disponibles
 */
export const AVAILABLE_CARRIERS = [
  'DHL',
  'Estafeta',
  'FedEx',
  'Redpack',
  'Correos de México',
  'Entrega local',
  'Otros'
];

/**
 * Tipos de cobertura geográfica
 */
export const COVERAGE_TYPES = {
  NATIONAL: 'nacional',
  STATE: 'estado',
  ZIPCODE: 'cp'
};

/**
 * Estados de México para selección
 */
export const MEXICAN_STATES = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Coahuila',
  'Colima',
  'Ciudad de México',
  'Durango',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'México',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas'
];

/**
 * Opciones para tiempo estimado de entrega
 */
export const DELIVERY_TIME_OPTIONS = [
  '1-2 días hábiles',
  '2-3 días hábiles',
  '3-5 días hábiles',
  '5-7 días hábiles',
  '7-10 días hábiles',
  'Más de 10 días'
];

/**
 * Jerarquía de aplicación de reglas (prioridad)
 */
export const RULE_HIERARCHY = [
  'Las reglas específicas de código postal tienen prioridad sobre las reglas estatales',
  'Las reglas estatales tienen prioridad sobre las reglas nacionales',
  'Si no hay coincidencia con ninguna regla, se usará la cobertura nacional (si existe)'
];

/**
 * Acciones para la gestión de reglas
 */
export const RULE_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  TOGGLE_STATUS: 'toggle_status'
};

/**
 * Pasos del formulario
 */
export const FORM_STEPS = {
  BASIC_INFO: 0,
  RULES: 1, 
  METHODS: 2
}; 