import { useSelector } from 'react-redux';

/**
 * Hook para acceder al estado de autenticación
 *
 * @returns {Object} Estado de autenticación del usuario
 */
export const useAuth = () => {
  const { status, uid, email, displayName, photoURL, errorMessage } = useSelector(state => state.auth);

  return {
    // Estado de autenticación
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'checking',
    isNotAuthenticated: status === 'not-authenticated',

    // Datos del usuario
    uid,
    email,
    displayName,
    photoURL,

    // Errores
    errorMessage,

    // Helpers
    hasError: !!errorMessage
  };
};