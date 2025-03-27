/**
 * Utilidades para trabajar con datos de Firestore en Redux
 */

/**
 * Serializa los datos de Firestore para evitar problemas de circularidad
 * y objetos no serializables en Redux
 *
 * @param {any} data - Datos a serializar
 * @returns {any} - Datos serializados
 */
export const serializeFirestoreData = (data) => {
  if (data === null || data === undefined) {
    return data;
  }

  // Manejar arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeFirestoreData(item));
  }

  // Manejar objetos Date
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Manejar Timestamp de Firestore
  if (data && typeof data === 'object' && data.seconds !== undefined && data.nanoseconds !== undefined) {
    return new Date(data.seconds * 1000 + data.nanoseconds / 1000000).toISOString();
  }

  // Manejar DocumentReference
  if (data && typeof data === 'object' && data.id && data.path && data.type === 'document') {
    return {
      id: data.id,
      path: data.path,
      type: 'document'
    };
  }

  // Manejar QueryDocumentSnapshot
  if (data && typeof data === 'object' && data.id && data._document) {
    return { id: data.id };
  }

  // Si es un objeto complejo, procesar recursivamente cada propiedad
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const result = {};

    for (const key in data) {
      // Evitar propiedades problemáticas y funciones
      if (
        data.hasOwnProperty(key) &&
        !key.startsWith('_') &&
        typeof data[key] !== 'function'
      ) {
        try {
          result[key] = serializeFirestoreData(data[key]);
        } catch (error) {
          console.warn(`Error al serializar propiedad ${key}:`, error);
          // En caso de error, almacenar una representación simple
          result[key] = String(data[key]);
        }
      }
    }

    return result;
  }

  // Para valores primitivos, devolver directamente
  return data;
};

/**
 * Convierte timestamps de Firestore en objetos Date
 *
 * @param {Object} timestamp - Timestamp de Firestore
 * @returns {Date} - Objeto Date
 */
export const firestoreTimestampToDate = (timestamp) => {
  if (!timestamp) return null;

  // Si ya es un Date, devolverlo directamente
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // Si es un string ISO, convertirlo a Date
  if (typeof timestamp === 'string' && timestamp.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return new Date(timestamp);
  }

  // Si es un Timestamp de Firestore
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }

  // Si es un objeto con seconds y nanoseconds (serializado)
  if (timestamp && timestamp.seconds !== undefined && timestamp.nanoseconds !== undefined) {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  }

  // Intentar convertir otros formatos
  try {
    return new Date(timestamp);
  } catch (error) {
    console.error('Error al convertir timestamp a Date:', error);
    return null;
  }
};

/**
 * Recupera un ID a partir de una referencia o ID de documento
 *
 * @param {string|Object} docRefOrId - Referencia al documento o ID
 * @returns {string|null} - ID del documento
 */
export const getDocumentId = (docRefOrId) => {
  if (!docRefOrId) return null;

  // Si es un string, asumimos que ya es un ID
  if (typeof docRefOrId === 'string') {
    return docRefOrId;
  }

  // Si es un objeto con propiedad ID
  if (docRefOrId && docRefOrId.id) {
    return docRefOrId.id;
  }

  // Otros casos
  return null;
};