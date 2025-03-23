
/**
 * Convierte el timestamp (Firestore o número) a fecha legible
 * @param {Object|number} timestamp - Puede ser un objeto de Firebase, un objeto Date o un número (milisegundos)
 * @param {Object} options - Opciones de formateado (locale, formato)
 * @returns {string} Fecha formateada en español, o un mensaje de error si no se puede formatear
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
 * Convierte el timestamp a un formato relativo (hace X tiempo)
 * @param {Object|number} timestamp - Puede ser un objeto de Firebase, un objeto Date o un número
 * @returns {string} Texto indicando cuánto tiempo ha pasado (ej: "hace 2 días")
 */
export const getRelativeTime = (timestamp) => {
  if (!timestamp) return '';

  try {
    const date = timestamp.toDate
      ? timestamp.toDate()
      : timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'hace unos segundos';
    }

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
    const date = timestamp.toDate
      ? timestamp.toDate()
      : timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

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
    const firstDate = date1.toDate
      ? date1.toDate()
      : date1.seconds
        ? new Date(date1.seconds * 1000)
        : new Date(date1);

    const secondDate = date2.toDate
      ? date2.toDate()
      : date2.seconds
        ? new Date(date2.seconds * 1000)
        : new Date(date2);

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