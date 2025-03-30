/**
 * Utilidades para manejo de fechas
 */

/**
 * Convierte el timestamp (Firestore o número) a fecha legible
 * @param {Object|number} timestamp - Puede ser un objeto de Firebase, un objeto Date o un número
 * @param {Object} options - Opciones de formateado (locale, formato)
 * @returns {string} Fecha formateada, o mensaje de error si no se puede formatear
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
    const date = convertToDate(timestamp);
    return date.toLocaleDateString(locale, format);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
};

/**
 * Convierte diferentes formatos a objeto Date
 * @param {Object|number|Date} timestamp - Valor a convertir
 * @returns {Date} Objeto Date
 */
export const convertToDate = (timestamp) => {
  if (timestamp instanceof Date) return timestamp;

  if (timestamp && typeof timestamp === 'object') {
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  }

  return new Date(timestamp);
};

/**
 * Convierte el timestamp a un formato relativo (hace X tiempo)
 * @param {Object|number} timestamp - Valor a convertir
 * @returns {string} Texto indicando tiempo transcurrido
 */
export const getRelativeTime = (timestamp) => {
  if (!timestamp) return '';

  try {
    const date = convertToDate(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `hace ${diffInYears} ${diffInYears === 1 ? 'año' : 'años'}`;
  } catch (error) {
    console.error('Error calculando tiempo relativo:', error);
    return '';
  }
};

/**
 * Verifica si una fecha está en el futuro
 * @param {Object|number} timestamp - Timestamp a verificar
 * @returns {boolean} true si la fecha está en el futuro
 */
export const isFutureDate = (timestamp) => {
  if (!timestamp) return false;

  try {
    const date = convertToDate(timestamp);
    return date > new Date();
  } catch (error) {
    console.error('Error verificando fecha futura:', error);
    return false;
  }
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {Object|number} date1 - Primera fecha
 * @param {Object|number} date2 - Segunda fecha (default: fecha actual)
 * @returns {number} Diferencia en días (número entero)
 */
export const getDaysBetween = (date1, date2 = new Date()) => {
  if (!date1) return 0;

  try {
    const firstDate = convertToDate(date1);
    const secondDate = convertToDate(date2);

    // Eliminar la parte de tiempo para comparar solo fechas
    const utc1 = Date.UTC(
      firstDate.getFullYear(),
      firstDate.getMonth(),
      firstDate.getDate()
    );
    const utc2 = Date.UTC(
      secondDate.getFullYear(),
      secondDate.getMonth(),
      secondDate.getDate()
    );

    // Convertir a días (1000ms * 60s * 60min * 24h)
    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculando diferencia de días:', error);
    return 0;
  }
};