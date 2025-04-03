/**
 * Hook personalizado para manejar el formulario de creación/edición de reglas de envío
 */

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FORM_STEPS } from '../constants';

/**
 * Hook para gestionar el formulario de reglas de envío
 * @param {Object} initialData - Datos iniciales para edición (opcional)
 * @param {Function} onSubmit - Función a ejecutar al enviar el formulario
 * @returns {Object} Métodos y estados para el formulario
 */
export const useShippingForm = (initialData = null, onSubmit = null) => {
  // Estado para controlar navegación entre pasos
  const [currentStep, setCurrentStep] = useState(FORM_STEPS.BASIC_INFO);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Integración con react-hook-form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    defaultValues: {
      zona: '',
      zipcodes: [],
      activo: true,
      freeShipping: false,
      freeShippingThreshold: false,
      minOrderAmount: 0,
      opciones_mensajeria: [],
      productos_restringidos: [],
      ...initialData,
    }
  });
  
  // Valores actuales del formulario para usar en renderizado condicional
  const formValues = watch();
  
  /**
   * Navegar al siguiente paso del formulario
   */
  const nextStep = useCallback(() => {
    setCurrentStep(current => {
      const nextIndex = current + 1;
      return nextIndex > Object.values(FORM_STEPS).length - 1 
        ? current 
        : nextIndex;
    });
  }, []);
  
  /**
   * Navegar al paso anterior del formulario
   */
  const prevStep = useCallback(() => {
    setCurrentStep(current => (current > 0 ? current - 1 : current));
  }, []);
  
  /**
   * Ir a un paso específico del formulario
   * @param {number} step - Índice del paso a mostrar
   */
  const goToStep = useCallback((step) => {
    if (step >= 0 && step < Object.values(FORM_STEPS).length) {
      setCurrentStep(step);
    }
  }, []);
  
  /**
   * Procesar el envío del formulario
   * @param {Object} data - Datos del formulario
   */
  const processSubmit = useCallback(async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Validar campos requeridos
      if (!data.zona) {
        throw new Error('El nombre de la zona es obligatorio');
      }
      
      if (!data.zipcodes || data.zipcodes.length === 0) {
        throw new Error('Debe seleccionar al menos un área de cobertura');
      }
      
      if (!data.opciones_mensajeria || data.opciones_mensajeria.length === 0) {
        throw new Error('Debe configurar al menos un método de envío');
      }
      
      // Preparar datos para guardar
      const ruleToSave = {
        zona: data.zona,
        activo: data.activo,
        zipcodes: data.zipcodes,
        opciones_mensajeria: data.opciones_mensajeria,
        // Campos condicionales
        envio_gratis: data.freeShipping || false,
        monto_minimo_gratis: data.freeShippingThreshold ? data.minOrderAmount : null,
        productos_restringidos: data.productos_restringidos || [],
      };
      
      // Llamar a la función de envío proporcionada
      if (onSubmit && typeof onSubmit === 'function') {
        await onSubmit(ruleToSave);
      } else {
        console.warn('No se proporcionó función onSubmit para el formulario');
      }
      
      return ruleToSave;
    } catch (err) {
      setSubmitError(err.message || 'Error al guardar la regla');
      console.error('Error en el envío del formulario:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit]);
  
  /**
   * Manejar cambio de nombre de zona
   * @param {Event} e - Evento del input
   */
  const handleZoneNameChange = useCallback((e) => {
    setValue('zona', e.target.value);
  }, [setValue]);
  
  /**
   * Manejar cambio de estado activo/inactivo
   * @param {boolean} isActive - Nuevo estado
   */
  const handleStatusChange = useCallback((isActive) => {
    setValue('activo', isActive);
  }, [setValue]);
  
  /**
   * Manejar cambios en la selección de cobertura geográfica
   * @param {Array} zipcodes - Lista de códigos o identificadores seleccionados
   */
  const handleCoverageChange = useCallback((zipcodes) => {
    setValue('zipcodes', zipcodes);
  }, [setValue]);
  
  /**
   * Manejar cambios en la configuración de envío gratuito
   * @param {boolean} isFree - Si el envío es gratuito
   */
  const handleFreeShippingChange = useCallback((isFree) => {
    setValue('freeShipping', isFree);
    
    // Si se activa envío gratuito, desactivar umbral
    if (isFree) {
      setValue('freeShippingThreshold', false);
    }
  }, [setValue]);
  
  /**
   * Manejar cambios en la lista de métodos de envío
   * @param {Array} options - Lista de opciones de mensajería
   */
  const handleShippingOptionsChange = useCallback((options) => {
    setValue('opciones_mensajeria', options);
  }, [setValue]);
  
  /**
   * Reiniciar formulario a valores iniciales o por defecto
   */
  const resetForm = useCallback(() => {
    reset({
      zona: '',
      zipcodes: [],
      activo: true,
      freeShipping: false,
      freeShippingThreshold: false,
      minOrderAmount: 0,
      opciones_mensajeria: [],
      productos_restringidos: [],
      ...initialData,
    });
    setCurrentStep(FORM_STEPS.BASIC_INFO);
    setSubmitError(null);
  }, [reset, initialData]);
  
  // Inicializar formulario con datos si se proporcionan al montar
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        freeShipping: initialData.envio_gratis || false,
        freeShippingThreshold: initialData.monto_minimo_gratis ? true : false,
        minOrderAmount: initialData.monto_minimo_gratis || 0,
      });
    }
  }, [initialData, reset]);
  
  return {
    // Estado del formulario
    currentStep,
    isSubmitting,
    submitError,
    isDirty,
    errors,
    formValues,
    
    // Métodos de navegación
    nextStep,
    prevStep,
    goToStep,
    
    // Métodos de formulario
    register,
    control,
    watch,
    setValue,
    handleSubmit: handleSubmit(processSubmit),
    resetForm,
    
    // Manejadores específicos
    handleZoneNameChange,
    handleStatusChange,
    handleCoverageChange,
    handleFreeShippingChange,
    handleShippingOptionsChange,
  };
};

export default useShippingForm; 