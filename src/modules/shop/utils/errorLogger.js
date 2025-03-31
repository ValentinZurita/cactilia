/**
 * Centraliza el registro de errores de la aplicación
 * Facilita la implementación futura de sistemas de monitoreo
 */

/**
 * Registra un error con contexto adicional
 *
 * @param {string} message - Mensaje descriptivo del error
 * @param {Error} error - Objeto de error original
 * @param {Object} context - Datos adicionales relevantes para el error
 */
export const logError = (message, error, context = {}) => {
  // Registrar en consola para desarrollo
  console.error(`${message}:`, error);

  if (Object.keys(context).length > 0) {
    console.error('Contexto:', context);
  }

  // Implementación futura para servicios de monitoreo
  // (Sentry, LogRocket, etc )

  // Por ejemplo:
  // if (typeof Sentry !== 'undefined') {
  //   Sentry.captureException(error, {
  //     extra: {
  //       message,
  //       ...context
  //     }
  //   });
  // }
};

/**
 * Registra una advertencia con contexto adicional
 *
 * @param {string} message - Mensaje descriptivo de la advertencia
 * @param {Object} context - Datos adicionales relevantes
 */
export const logWarning = (message, context = {}) => {
  // Registrar en consola para desarrollo
  console.warn(message);

  if (Object.keys(context).length > 0) {
    console.warn('Contexto:', context);
  }

  // Implementación futura para servicios de monitoreo
};

/**
 * Formatea un error para presentarlo al usuario final
 *
 * @param {Error|string} error - Error original
 * @param {string} fallbackMessage - Mensaje predeterminado si no hay error específico
 * @returns {string} Mensaje de error amigable para el usuario
 */
export const formatUserError = (error, fallbackMessage = 'Ha ocurrido un error. Por favor, inténtalo de nuevo.') => {
  // Si no hay error, usar mensaje predeterminado
  if (!error) return fallbackMessage;

  // Si es un string, devolverlo directamente
  if (typeof error === 'string') return error;

  // Si es un error con mensaje, usar ese mensaje
  if (error.message) {
    // Filtrar mensajes técnicos que no deberían mostrarse al usuario
    if (error.message.includes('Firebase') ||
      error.message.includes('network') ||
      error.message.includes('permission')) {
      return fallbackMessage;
    }
    return error.message;
  }

  // En caso de duda, usar mensaje predeterminado
  return fallbackMessage;
};