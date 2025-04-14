export const getErrorMessage = jest.fn(errorCode => {
  const errorMap = {
    'auth/user-not-found': 'No existe una cuenta con este email.',
    'auth/invalid-email': 'El formato del correo electrónico es inválido.',
    'auth/too-many-requests': 'Demasiados intentos. Por favor, inténtalo más tarde.',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
  };
  
  return errorMap[errorCode] || 'Error desconocido';
}); 