/**
 * Utilidad para mapear códigos de error de Firebase a mensajes amigables
 * 
 * @param {string} errorCode - Código de error de Firebase Auth
 * @returns {string} Mensaje de error legible para el usuario
 */
export const getErrorMessage = (errorCode) => {
  // Mapa de códigos de error a mensajes amigables
  const errorMap = {
    'auth/user-not-found': 'No existe una cuenta con este email.',
    'auth/invalid-email': 'El formato del correo electrónico es inválido.',
    'auth/too-many-requests': 'Demasiados intentos. Por favor, inténtalo más tarde.',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
    'auth/internal-error': 'Error interno del servidor. Intenta más tarde.',
    'auth/requires-recent-login': 'Esta acción requiere que inicies sesión nuevamente.'
  };
  
  // Devuelve el mensaje específico o un mensaje genérico si no está mapeado
  return errorMap[errorCode] || 'Ocurrió un error al enviar el email. Inténtalo de nuevo.';
}; 