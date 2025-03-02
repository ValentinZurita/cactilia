import { useState } from 'react';
import { useSelector } from 'react-redux';

/**
 * Hook personalizado para manejar la lógica de la página de configuración
 *
 * @returns {Object} - Estados y funciones para gestionar la configuración del usuario
 */
export const useSettings = () => {
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

  // Estado para mensajes de éxito/error
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  /**
   * Manejar cambios en el formulario de perfil
   */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  /**
   * Manejar cambios en el formulario de contraseña
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  /**
   * Manejar envío del formulario de perfil
   */
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // En implementación real, aquí se actualizaría el perfil en Firebase
    setProfileMessage({
      type: 'success',
      text: 'Perfil actualizado correctamente'
    });

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setProfileMessage({ type: '', text: '' });
    }, 3000);
  };

  /**
   * Manejar envío del formulario de contraseña
   */
  const handlePasswordSubmit = (e) => {
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
    setPasswordMessage({
      type: 'success',
      text: 'Contraseña actualizada correctamente'
    });

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
  };

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