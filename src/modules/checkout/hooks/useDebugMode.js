import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para manejar el modo de depuración en componentes
 * Permite activar/desactivar el modo de depuración y persiste la preferencia
 * 
 * @param {string} componentName - Nombre del componente para identificación en localStorage
 * @param {boolean} initialValue - Valor inicial del modo de depuración
 * @returns {Array} - [isDebugMode, toggleDebugMode, setDebugMode]
 */
export const useDebugMode = (componentName = 'global', initialValue = false) => {
  // Crear una clave única para este componente
  const storageKey = `debug_mode_${componentName}`;
  
  // Intentar recuperar el valor guardado, o usar el valor inicial
  const getSavedValue = () => {
    try {
      const savedValue = localStorage.getItem(storageKey);
      return savedValue !== null ? JSON.parse(savedValue) : initialValue;
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return initialValue;
    }
  };
  
  const [isDebugMode, setIsDebugMode] = useState(getSavedValue);
  
  // Guardar cambios en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(isDebugMode));
    } catch (error) {
      console.warn('Error saving to localStorage:', error);
    }
  }, [isDebugMode, storageKey]);
  
  // Función para alternar el modo
  const toggleDebugMode = useCallback(() => {
    setIsDebugMode(prevMode => !prevMode);
  }, []);
  
  // Detectar modo de depuración global con teclas (Shift+D)
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Solo activar con Shift+D
      if (event.shiftKey && event.key === 'D') {
        toggleDebugMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleDebugMode]);
  
  return [isDebugMode, toggleDebugMode, setIsDebugMode];
};

export default useDebugMode; 