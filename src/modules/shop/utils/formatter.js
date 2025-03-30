/**
 * Utilidades para formateo de datos
 */

/**
 * Formatea un precio como moneda
 *
 * @param {number} price - Precio a formatear
 * @param {string} locale - Configuración regional
 * @param {string} currency - Código de moneda
 * @returns {string} - Precio formateado
 */
export const formatPrice = (price, locale = 'es-MX', currency = 'MXN') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

/**
 * Formatea una fecha para mostrarla
 *
 * @param {Date|Object|number} timestamp - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} - Fecha formateada
 */
export const formatDate = (timestamp, options = {}) => {
  if (!timestamp) return 'Fecha no disponible';

  const locale = options.locale || 'es-MX';
  const format = options.format || {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  try {
    const date = timestamp.toDate
      ? timestamp.toDate()
      : timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

    return date.toLocaleDateString(locale, format);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
};

/**
 * Formatea un número de teléfono
 *
 * @param {string} phone - Número de teléfono
 * @returns {string} - Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';

  // Eliminar caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');

  // Formatear según longitud
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }

  return phone;
};

/**
 * Formatea una dirección como texto
 *
 * @param {Object} address - Objeto de dirección
 * @returns {string} - Dirección formateada
 */
export const formatAddress = (address) => {
  if (!address) return '';

  const { street, numExt, numInt, colonia, city, state, zip } = address;
  let formattedAddress = street || '';

  if (numExt) formattedAddress += ` #${numExt}`;
  if (numInt) formattedAddress += `, Int. ${numInt}`;
  if (colonia) formattedAddress += `, ${colonia}`;

  formattedAddress += city ? `, ${city}` : '';
  formattedAddress += state ? `, ${state}` : '';
  formattedAddress += zip ? ` ${zip}` : '';

  return formattedAddress;
};