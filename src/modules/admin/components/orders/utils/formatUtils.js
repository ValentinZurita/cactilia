/**
 * Utilitarios mejorados para formatear fechas y precios,
 * con mejor manejo de formatos de Firestore y fechas
 */

/**
 * Formatear fecha de pedido para mostrar
 * Maneja varios formatos de fecha incluidos ISO strings
 * @param {Object|Date|string} timestamp - Timestamp a formatear
 * @returns {string} - Fecha formateada
 */
export const formatOrderDate = (timestamp) => {
  if (!timestamp) return 'Fecha no disponible';

  try {
    // Determinar el tipo de timestamp y convertirlo a Date
    let date;

    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      // Si es un string ISO (ej: de una serialización previa)
      date = new Date(timestamp);
    } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      // Es un Timestamp de Firestore
      date = timestamp.toDate();
    } else if (timestamp.seconds && timestamp.nanoseconds) {
      // Es un objeto tipo Timestamp pero sin método toDate
      date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    } else {
      // Intentar convertir desde string o número
      date = new Date(timestamp);
    }

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida:', timestamp);
      return 'Fecha inválida';
    }

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (err) {
    console.error('Error formateando fecha:', err, timestamp);
    return 'Fecha no disponible';
  }
};

/**
 * Formatear precio con formato de moneda
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Precio formateado
 */
export const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return '$0.00';

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

/**
 * Convierte objetos de fecha de Firestore a objetos Date de JavaScript
 * @param {Object} firestoreTimestamp - Timestamp de Firestore
 * @returns {Date|null} - Fecha convertida o null si no es válida
 */
export const convertFirestoreTimestamp = (firestoreTimestamp) => {
  if (!firestoreTimestamp) return null;

  try {
    // Si es un Timestamp de Firestore con método toDate
    if (firestoreTimestamp.toDate && typeof firestoreTimestamp.toDate === 'function') {
      return firestoreTimestamp.toDate();
    }

    // Si es un objeto con segundos y nanosegundos (formato Firestore serializado)
    if (firestoreTimestamp.seconds !== undefined && firestoreTimestamp.nanoseconds !== undefined) {
      return new Date(firestoreTimestamp.seconds * 1000 + firestoreTimestamp.nanoseconds / 1000000);
    }

    // Si es un string ISO (de una serialización previa)
    if (typeof firestoreTimestamp === 'string' && firestoreTimestamp.match(/^\d{4}-\d{2}-\d{2}T/)) {
      return new Date(firestoreTimestamp);
    }

    // Si es otro tipo de objeto, intentar convertir
    return new Date(firestoreTimestamp);
  } catch (error) {
    console.error('Error al convertir timestamp:', error);
    return null;
  }
};

/**
 * Convierte un objeto Date a formato ISO string
 * @param {Date|Object} date - Fecha a convertir
 * @returns {string|null} - Fecha formateada como ISO string o null si no es válida
 */
export const dateToISOString = (date) => {
  if (!date) return null;

  try {
    // Si ya es un string, verificar si es ISO
    if (typeof date === 'string') {
      if (date.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return date; // Ya es un ISO string
      }
      return new Date(date).toISOString();
    }

    // Si es un timestamp de Firestore
    if (date.toDate && typeof date.toDate === 'function') {
      return date.toDate().toISOString();
    }

    // Si es un objeto timestamp serializado
    if (date.seconds !== undefined && date.nanoseconds !== undefined) {
      return new Date(date.seconds * 1000 + date.nanoseconds / 1000000).toISOString();
    }

    // Si es un objeto Date
    if (date instanceof Date) {
      return date.toISOString();
    }

    // Intentar convertir como último recurso
    return new Date(date).toISOString();
  } catch (error) {
    console.error('Error al convertir fecha a ISO string:', error);
    return null;
  }
};