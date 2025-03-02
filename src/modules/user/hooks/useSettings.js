import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice';

/**
 * Hook personalizado para manejar la lógica de la página de configuración
 *
 * @returns {Object} - Estados y funciones para gestionar la configuración del usuario
 */
export const useSettings = () => {
  const dispatch = useDispatch();

  // Obtener datos del usuario desde Redux store
  const { displayName, email, photoURL } = useSelector((state) => state.auth);

  // Estados para los formularios
  const [profileData, setProfileData] = useState({
    displayName: displayName || '',
    email: email || '',
    phoneNumber: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estado para mensajes de éxito/error (locales al componente)
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  /**
   * Manejar cambios en el formulario de perfil
   */
  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  /**
   * Manejar cambios en el formulario de contraseña
   */
  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  /**
   * Manejar envío del formulario de perfil
   */
  const handleProfileSubmit = useCallback((e) => {
    e.preventDefault();
    // En implementación real, aquí se actualizaría el perfil en Firebase

    // Mensaje local para el formulario
    setProfileMessage({
      type: 'success',
      text: 'Perfil actualizado correctamente'
    });

    // Mensaje global para notificar al usuario
    dispatch(addMessage({
      type: 'success',
      text: 'Tu perfil ha sido actualizado',
      autoHide: true,
      duration: 3000
    }));

    // Ocultar mensaje local después de 3 segundos
    setTimeout(() => {
      setProfileMessage({ type: '', text: '' });
    }, 3000);
  }, [dispatch]);

  /**
   * Manejar envío del formulario de contraseña
   */
  const handlePasswordSubmit = useCallback((e) => {
    e.preventDefault();

    // Validación básica
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({
        type: 'error',
        text: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    // En implementación real, aquí se actualizaría la contraseña en Firebase

    // Mensaje local para el formulario
    setPasswordMessage({
      type: 'success',
      text: 'Contraseña actualizada correctamente'
    });

    // Mensaje global para notificar al usuario
    dispatch(addMessage({
      type: 'success',
      text: 'Tu contraseña ha sido actualizada',
      autoHide: true,
      duration: 3000
    }));

    // Limpiar formulario
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setPasswordMessage({ type: '', text: '' });
    }, 3000);
  }, [passwordData, dispatch]);

  return {
    // Estados
    profileData,
    passwordData,
    profileMessage,
    passwordMessage,
    photoURL,

    // Manejadores
    handleProfileChange,
    handlePasswordChange,
    handleProfileSubmit,
    handlePasswordSubmit
  };
};