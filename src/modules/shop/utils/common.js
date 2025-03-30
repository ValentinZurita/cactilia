/**
 * Utilidades comunes
 */

/**
 * Genera un ID único
 * @param {string} prefix - Prefijo para el ID
 * @returns {string} - ID único
 */
export const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${randomStr}`;
};

/**
 * Retorna un array de valores únicos
 * @param {Array} array - Array con posibles duplicados
 * @returns {Array} - Array con valores únicos
 */
export const getUniqueValues = (array) => {
  return [...new Set(array)];
};

/**
 * Agrupa elementos de un array por una propiedad
 * @param {Array} array - Array a agrupar
 * @param {string} key - Propiedad por la que agrupar
 * @returns {Object} - Objeto con elementos agrupados
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const keyValue = item[key] || 'other';

    if (!result[keyValue]) {
      result[keyValue] = [];
    }

    result[keyValue].push(item);
    return result;
  }, {});
};

/**
 * Delay asíncrono
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise} - Promesa que se resuelve después del tiempo especificado
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo a añadir si se trunca
 * @returns {string} - Texto truncado
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};