/**
 * ============================================
 *            UTILIDADES DE FORMATEO
 * ============================================
 * Este archivo contiene funciones de utilidad para
 * formatear fechas, moneda y texto.
 */

// --------------------------------------------
//          FORMATEO DE FECHAS
// --------------------------------------------

/**
 * Formatea una fecha al formato local.
 * Maneja objetos Date, strings, números y Timestamps de Firestore.
 * 
 * @param {Date|string|number|object} date - La fecha a formatear.
 * @param {string} locale - El locale a usar (ej. 'es-MX', 'en-US'). Default: 'es-MX'.
 * @param {Object} options - Opciones de formato adicionales para Intl.DateTimeFormat.
 * @returns {string} La fecha formateada (DD/MM/YYYY por defecto) o un string vacío si la fecha es inválida o hay error.
 */
export const formatDate = (date, locale = 'es-MX', options = {}) => {
  try {
    const defaultOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      ...options
    };
    
    let dateObj;
    // Verificar si es un Timestamp de Firestore (tiene el método .toDate)
    if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate(); 
    } else if (date instanceof Date) {
      // Si ya es un objeto Date
      dateObj = date;
    } else {
      // Intentar parsear otros tipos (string, número)
      dateObj = new Date(date);
    }

    // Verificar si el objeto Date resultante es válido
    if (isNaN(dateObj.getTime())) {
      console.error('[formatDate] Valor de fecha inválido proporcionado:', date);
      return ''; // Devolver cadena vacía para fechas inválidas
    }

    // Formatear la fecha válida
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);

  } catch (error) {
    console.error('[formatDate] Error formateando fecha:', error, 'Input:', date);
    return ''; // Devolver cadena vacía en caso de error
  }
};

// --------------------------------------------
//          FORMATEO DE MONEDA
// --------------------------------------------

/**
 * Formatea un valor numérico a formato de moneda local.
 * 
 * @param {number} amount - El monto a formatear.
 * @param {string} currency - El código de moneda (ISO 4217). Default: 'MXN'.
 * @param {string} locale - El locale a usar (ej. 'es-MX', 'en-US'). Default: 'es-MX'.
 * @returns {string} El monto formateado como moneda (ej. '$1,234.56').
 */
export const formatCurrency = (amount, currency = 'MXN', locale = 'es-MX') => {
  // Asegurarse de que el monto sea un número
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    console.error('[formatCurrency] Valor no numérico proporcionado:', amount);
    return ''; // Devolver cadena vacía si no es un número
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  } catch (error) {
    console.error('[formatCurrency] Error formateando moneda:', error, 'Input:', amount);
    return ''; // Devolver cadena vacía en caso de error
  }
};

// --------------------------------------------
//          MANIPULACIÓN DE TEXTO
// --------------------------------------------

/**
 * Trunca un texto a una longitud máxima especificada y agrega puntos suspensivos.
 * 
 * @param {string} text - El texto a truncar.
 * @param {number} maxLength - La longitud máxima permitida. Default: 100.
 * @returns {string} El texto truncado con '...' al final si excede maxLength, o el texto original.
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string' || text.length <= maxLength) {
    return text || ''; // Devuelve el texto o vacío si es null/undefined
  }
  return text.substring(0, maxLength) + '...';
};

/**
 * Convierte un string a formato "slug" (ideal para URLs amigables).
 * Ej: "Texto con Acentos y Ñ" -> "texto-con-acentos-y-n"
 * 
 * @param {string} text - El texto a convertir.
 * @returns {string} El slug generado.
 */
export const slugify = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toString() // Asegurar que sea string
    .normalize('NFD') // Separar caracteres base de diacríticos (acentos, etc.)
    .replace(/[\u0300-\u036f]/g, '') // Remover los diacríticos
    .toLowerCase() // Convertir a minúsculas
    .trim() // Quitar espacios al inicio y final
    .replace(/\s+/g, '-') // Reemplazar espacios (uno o más) por un solo guion
    .replace(/[^\w-]+/g, '') // Remover caracteres que no sean alfanuméricos o guion
    .replace(/--+/g, '-'); // Reemplazar múltiples guiones seguidos por uno solo
};

// --- NUEVA FUNCIÓN AUXILIAR COPIADA --- (o ajustar comentario si ya existe sección)
/**
 * Formatea un timestamp Unix (segundos) a un formato de fecha y hora local.
 *
 * @param {number} unixTimestamp - Timestamp en segundos.
 * @returns {string} - Fecha y hora formateada (ej. '7 de mayo de 2025, 11:59 p.m.') o 'Fecha no disponible'.
 */
export const formatUnixTimestamp = (unixTimestamp) => {
  if (unixTimestamp === undefined || unixTimestamp === null || isNaN(unixTimestamp)) {
    return 'Fecha no disponible';
  }
  try {
    const date = new Date(unixTimestamp * 1000); // Convertir segundos a milisegundos
    if (isNaN(date.getTime())) {
      console.error('Timestamp Unix inválido para formatear:', unixTimestamp);
      return 'Fecha inválida';
    }
    // Devolver formato completo con hora
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true // Usar formato AM/PM
    });
  } catch (error) {
    console.error('Error formateando timestamp Unix:', error);
    return 'Fecha no disponible';
  }
};
// --- FIN NUEVA FUNCIÓN COPIADA ---