/**
 * Utilidades para el módulo de shipping
 */

/**
 * Determina el tipo de cobertura de una regla de envío
 * @param {Object} rule - Regla de envío
 * @returns {string} - Tipo de cobertura (Nacional, Regional, CP)
 */
export const getCoverageType = (rule) => {
  if (!rule || !rule.zipcodes || rule.zipcodes.length === 0) {
    return 'No definido';
  }
  
  if (rule.zipcodes.includes('nacional')) {
    return 'Nacional';
  }
  
  if (rule.zipcodes.some(z => z.startsWith('estado_'))) {
    return 'Regional';
  }
  
  return 'CP';
};

/**
 * Extrae el nombre del estado desde un ID con formato 'estado_nombre'
 * @param {string} stateId - ID del estado (ej: 'estado_Jalisco')
 * @returns {string} - Nombre del estado
 */
export const getStateNameFromId = (stateId) => {
  if (!stateId || typeof stateId !== 'string' || !stateId.startsWith('estado_')) {
    return '';
  }
  
  return stateId.replace('estado_', '');
};

/**
 * Formatea un precio para mostrar
 * @param {number} price - Precio a formatear
 * @param {boolean} includeSymbol - Si se debe incluir el símbolo de moneda
 * @returns {string} - Precio formateado
 */
export const formatPrice = (price, includeSymbol = true) => {
  if (price === undefined || price === null) {
    return includeSymbol ? '$0.00' : '0.00';
  }
  
  return includeSymbol 
    ? `$${parseFloat(price).toFixed(2)}`
    : parseFloat(price).toFixed(2);
};

/**
 * Convierte un arreglo de estados a una cadena para mostrar
 * @param {Array} states - Arreglo de IDs de estados
 * @param {number} limit - Límite de estados a mostrar
 * @returns {string} - Texto formateado
 */
export const formatStatesList = (states, limit = 2) => {
  if (!states || !Array.isArray(states) || states.length === 0) {
    return '';
  }
  
  const filteredStates = states
    .filter(s => s.startsWith('estado_'))
    .map(s => getStateNameFromId(s));
  
  if (filteredStates.length === 0) {
    return '';
  }
  
  if (filteredStates.length <= limit) {
    return filteredStates.join(', ');
  }
  
  return `${filteredStates.slice(0, limit).join(', ')} y ${filteredStates.length - limit} más`;
};

/**
 * Validar un código postal mexicano
 * @param {string} zipcode - Código postal a validar
 * @returns {boolean} - Si es válido o no
 */
export const isValidMexicanZipcode = (zipcode) => {
  if (!zipcode || typeof zipcode !== 'string') {
    return false;
  }
  
  // Códigos postales mexicanos: 5 dígitos
  return /^\d{5}$/.test(zipcode);
};

/**
 * Organiza los códigos postales en grupos
 * @param {Array} zipcodes - Lista de códigos postales
 * @returns {Object} - Objeto con zipcodes agrupados
 */
export const groupZipcodes = (zipcodes) => {
  if (!zipcodes || !Array.isArray(zipcodes)) {
    return { individual: [], ranges: [] };
  }
  
  // Detectar rangos de códigos (formato 'xxxxx-xxxxx')
  const ranges = zipcodes.filter(zip => /^\d{5}-\d{5}$/.test(zip));
  
  // Códigos individuales
  const individual = zipcodes.filter(zip => isValidMexicanZipcode(zip));
  
  return { individual, ranges };
};

/**
 * Verifica si una regla incluye envío gratuito
 * @param {Object} rule - Regla de envío
 * @returns {Object} - Información sobre envío gratuito
 */
export const getFreeShippingInfo = (rule) => {
  if (!rule) {
    return { hasFreeShipping: false };
  }
  
  // Envío incondicional gratuito
  if (rule.envio_gratis) {
    return { 
      hasFreeShipping: true, 
      isUnconditional: true 
    };
  }
  
  // Envío gratuito con monto mínimo
  if (rule.monto_minimo_gratis && rule.monto_minimo_gratis > 0) {
    return { 
      hasFreeShipping: true, 
      isUnconditional: false,
      minAmount: rule.monto_minimo_gratis
    };
  }
  
  return { hasFreeShipping: false };
}; 