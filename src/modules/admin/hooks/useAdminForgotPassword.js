import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseAuth } from '../../../config/firebase/firebaseConfig';
import { getErrorMessage } from './utils/errorMessages';

/**
 * Hook personalizado para manejar la recuperación de contraseña del administrador
 * Proporciona estado y funciones para enviar el email de recuperación
 * 
 * @returns {Object} - Funciones y estado para manejar recuperación de contraseña
 */
export const useAdminForgotPassword = () => {
  // Estado único que contiene todos los valores relevantes
  const [state, setState] = useState({
    loading: false,
    error: null,
    success: false
  });
  
  /**
   * Función auxiliar para actualizar parcialmente el estado
   * @param {Object} newState - Nuevos valores de estado a actualizar
   */
  const updateState = (newState) => {
    setState(prev => ({ ...prev, ...newState }));
  };
  
  /**
   * Envía un email de recuperación de contraseña a la dirección especificada
   * @param {Object} formData - Datos del formulario (email)
   */
  const sendPasswordReset = async ({ email }) => {
    // Reiniciar estado
    updateState({ 
      loading: true, 
      error: null, 
      success: false 
    });
    
    try {
      // Configurar opciones para el email de recuperación
      const actionCodeSettings = {
        // URL a la que se redirigirá después de resetear la contraseña
        url: `${window.location.origin}/admin/login`,
        handleCodeInApp: false
      };
      
      // Enviar email de recuperación usando Firebase Auth
      await sendPasswordResetEmail(
        FirebaseAuth, 
        email, 
        actionCodeSettings
      );
      
      // Actualizar estado en caso de éxito
      updateState({ 
        success: true, 
        loading: false 
      });
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      
      // Obtener mensaje de error apropiado basado en el código
      const errorMessage = getErrorMessage(error.code);
      
      // Actualizar estado con el error
      updateState({ 
        error: errorMessage, 
        loading: false 
      });
    }
  };
  
  // Devolver funciones y estado
  return { sendPasswordReset, state };
}; 