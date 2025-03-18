import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice';
import { login } from '../../../store/auth/authSlice';
import { updateUserData, updateProfilePhoto, getUserData, validateProfileImage } from '../services/userService';

/**
 * Hook personalizado para manejar la lógica de la página de configuración
 * Versión simplificada sin manejo de contraseñas
 *
 * @returns {Object} - Estados y funciones para gestionar la configuración del usuario
 */
export const useSettings = () => {
  const dispatch = useDispatch();

  // Obtener datos del usuario desde Redux store
  const { uid, displayName, email, photoURL, phoneNumber: reduxPhoneNumber } = useSelector((state) => state.auth);

  // Estados para los formularios
  const [profileData, setProfileData] = useState({
    displayName: displayName || '',
    email: email || '',
    phoneNumber: reduxPhoneNumber || ''
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(photoURL || '');

  // Estados para loading
  const [profileLoading, setProfileLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  // Estado para mensajes de éxito/error (locales al componente)
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUserData = async () => {
      if (uid) {
        try {
          const result = await getUserData(uid);

          if (result.ok && result.data) {
            // Actualizar formulario con datos adicionales de Firestore que no están en Redux
            setProfileData(prevData => ({
              ...prevData,
              displayName: result.data.displayName || prevData.displayName,
              phoneNumber: result.data.phoneNumber || prevData.phoneNumber,
              // Otros campos que se obtengan de Firestore pero no estén en Redux
            }));
          }
        } catch (error) {
          console.error('Error cargando datos del usuario:', error);
        }
      }
    };

    loadUserData();
  }, [uid]);

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
   * Manejar cambio de foto de perfil
   */
  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files[0];

    if (file) {
      // Validar el archivo antes de procesarlo
      const { valid, error } = validateProfileImage(file);

      if (!valid) {
        dispatch(addMessage({
          type: 'error',
          text: error,
          autoHide: true,
          duration: 4000
        }));
        return;
      }

      setSelectedPhoto(file);

      // Crear URL para vista previa
      const previewURL = URL.createObjectURL(file);
      setPhotoPreview(previewURL);
    }
  }, [dispatch]);

  /**
   * Comprimir imagen manteniendo calidad razonable
   */
  const compressImage = async (file) => {
    try {
      // Simulación de compresión (en un caso real usarías una biblioteca como browser-image-compression)
      // Nota: En una implementación completa, importarías una biblioteca como:
      // import imageCompression from 'browser-image-compression';

      // Las opciones para una buena compresión serían:
      const options = {
        maxSizeMB: 1, // Máximo 1MB después de compresión
        maxWidthOrHeight: 1200, // Dimensión máxima 1200px
        useWebWorker: true,
        preserveExif: true // Mantener metadatos importantes
      };

      // Simular un retraso de compresión
      await new Promise(resolve => setTimeout(resolve, 100));

      // En un caso real, harías:
      // const compressedFile = await imageCompression(file, options);
      // return compressedFile;

      // Por ahora devolvemos el archivo original
      return file;
    } catch (error) {
      console.error('Error comprimiendo imagen:', error);
      throw error;
    }
  };

  /**
   * Subir y actualizar foto de perfil
   */
  const handlePhotoUpload = useCallback(async () => {
    if (!selectedPhoto) return;

    setPhotoLoading(true);

    try {
      // Comprimir la imagen antes de subirla
      const compressedImage = await compressImage(selectedPhoto);

      // Opciones para la subida
      const uploadOptions = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1200
      };

      const result = await updateProfilePhoto(uid, compressedImage, uploadOptions);

      if (result.ok) {
        // Actualizar el estado en Redux
        dispatch(login({
          uid,
          displayName,
          email,
          photoURL: result.photoURL
        }));

        // Mostrar mensaje de éxito
        dispatch(addMessage({
          type: 'success',
          text: 'Foto de perfil actualizada con éxito',
          autoHide: true,
          duration: 3000
        }));

        // Limpiar estado de selección
        setSelectedPhoto(null);
      } else {
        dispatch(addMessage({
          type: 'error',
          text: result.error || 'Error al actualizar la foto de perfil',
          autoHide: true,
          duration: 4000
        }));
      }
    } catch (error) {
      console.error('Error al subir la foto:', error);
      dispatch(addMessage({
        type: 'error',
        text: 'Error al subir la foto',
        autoHide: true,
        duration: 4000
      }));
    } finally {
      setPhotoLoading(false);
    }
  }, [selectedPhoto, uid, displayName, email, dispatch]);

  /**
   * Manejar envío del formulario de perfil
   */
  const handleProfileSubmit = useCallback(async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      // Preparar datos a actualizar
      const dataToUpdate = {
        displayName: profileData.displayName,
        phoneNumber: profileData.phoneNumber,
      };

      // Actualizar perfil en Firebase
      const result = await updateUserData(uid, dataToUpdate);

      if (result.ok) {
        // Actualizar el estado en Redux
        dispatch(login({
          uid,
          displayName: profileData.displayName,
          email,
          photoURL
        }));

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
      } else {
        setProfileMessage({
          type: 'error',
          text: result.error || 'Error al actualizar el perfil'
        });

        dispatch(addMessage({
          type: 'error',
          text: result.error || 'Error al actualizar el perfil',
          autoHide: true,
          duration: 4000
        }));
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      setProfileMessage({
        type: 'error',
        text: 'Error al actualizar el perfil'
      });
    } finally {
      setProfileLoading(false);

      // Ocultar mensaje local después de 3 segundos
      setTimeout(() => {
        setProfileMessage({ type: '', text: '' });
      }, 3000);
    }
  }, [profileData, uid, email, photoURL, dispatch]);

  return {
    // Estados
    profileData,
    profileMessage,
    photoURL: photoPreview,
    selectedPhoto,
    profileLoading,
    photoLoading,

    // Manejadores
    handleProfileChange,
    handleProfileSubmit,
    handlePhotoChange,
    handlePhotoUpload
  };
};