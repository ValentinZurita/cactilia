/**
 * Utilidades de formateo para fechas, moneda y texto
 */

/**
 * Formatea una fecha al formato local
 * @param {Date|string|number} date - La fecha a formatear
 * @param {string} locale - El locale a usar (default: 'es-MX')
 * @param {Object} options - Opciones de formato
 * @returns {string} La fecha formateada
 */
export const formatDate = (date, locale = 'es-MX', options = {}) => {
  const defaultOptions = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    ...options
  };
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
};

/**
 * Formatea un valor a formato de moneda
 * @param {number} amount - El monto a formatear
 * @param {string} currency - El código de moneda (default: 'MXN')
 * @param {string} locale - El locale a usar (default: 'es-MX')
 * @returns {string} El monto formateado como moneda
 */
export const formatCurrency = (amount, currency = 'MXN', locale = 'es-MX') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Trunca un texto a una longitud específica y agrega puntos suspensivos
 * @param {string} text - El texto a truncar
 * @param {number} maxLength - La longitud máxima (default: 100)
 * @returns {string} El texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Convierte un string a formato slug (URL amigable)
 * @param {string} text - El texto a convertir
 * @returns {string} El slug generado
 */
export const slugify = (text) => {
  return text
    .toString()
    .normalize('NFD') // Normalizar acentos
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/[^\w-]+/g, '') // Remover caracteres especiales
    .replace(/--+/g, '-'); // Reemplazar múltiples guiones con uno solo
};