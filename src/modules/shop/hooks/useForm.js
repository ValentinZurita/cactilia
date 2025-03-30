import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para manejar formularios con validación
 *
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Function} validateFn - Función de validación (opcional)
 * @param {Function} onSubmit - Función a ejecutar al enviar el formulario
 * @returns {Object} Estado y funciones del formulario
 */
export const useForm = (initialValues = {}, validateFn = null, onSubmit = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validar el formulario cuando cambian los valores
  useEffect(() => {
    if (validateFn) {
      const validationErrors = validateFn(values);
      setErrors(validationErrors);
      setIsValid(Object.keys(validationErrors).length === 0);
    } else {
      setIsValid(true);
    }
  }, [values, validateFn]);

  // Manejar cambios en los inputs
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Manejar change directo (para componentes no-DOM)
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Manejar blur para validar campos individuales
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  // Manejar envío del formulario
  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();

    // Marcar todos los campos como touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validar antes de enviar
    if (validateFn) {
      const validationErrors = validateFn(values);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        setIsSubmitting(true);
        if (onSubmit) onSubmit(values);
      }
    } else {
      setIsSubmitting(true);
      if (onSubmit) onSubmit(values);
    }
  }, [values, validateFn, onSubmit]);

  // Reset del formulario
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
    setValues
  };
};
