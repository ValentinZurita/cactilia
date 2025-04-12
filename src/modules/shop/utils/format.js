/**
 * Utilidades para formateo de datos
 */

/**
 * Formatea un precio como moneda
 * @param {number} price - Precio a formatear
 * @param {string} locale - Configuración regional
 * @param {string} currency - Código de moneda
 * @returns {string} - Precio formateado
 */
export const formatPrice = (price, locale = 'es-MX', currency = 'MXN') => {
  // Validación más estricta para asegurar que sea un número válido
  if (price === null || price === undefined || isNaN(parseFloat(price))) {
    return '$0.00';
  }
  
  // Convertir a número para asegurar que sea un valor numérico
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericPrice);
  } catch (error) {
    console.error('Error al formatear precio:', error);
    return `$${numericPrice.toFixed(2)}`;
  }
};

/**
 * Formatea una dirección como texto
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

/**
 * Formatea un número de teléfono
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