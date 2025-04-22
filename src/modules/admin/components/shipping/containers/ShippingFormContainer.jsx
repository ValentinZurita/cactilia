import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShippingForm } from '../form/ShippingForm';
import { useShippingRules } from '../hooks/useShippingRules';
import { adaptRuleToFormData, adaptFormDataToRulePayload } from '../utils/shippingDataMapper';

/**
 * Contenedor para la lógica del formulario de reglas de envío.
 * Maneja la carga de datos para edición, la adaptación de datos
 * y el proceso de guardado (creación/actualización).
 */
export const ShippingFormContainer = ({ mode, ruleId, onCancel, onSuccess }) => {
  const navigate = useNavigate(); // O podría pasarse como prop si se prefiere
  const [initialData, setInitialData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  const {
    selectedRule,
    getShippingRuleById,
    createShippingRule,
    updateShippingRule,
  } = useShippingRules();

  // Cargar datos iniciales si estamos en modo edición
  useEffect(() => {
    setSubmissionError(null); // Limpiar errores al cambiar modo/ID
    if (mode === 'edit' && ruleId) {
      setIsLoading(true);
      // Limpiar datos anteriores para evitar flash de contenido incorrecto
      setInitialData({}); 
      const promise = getShippingRuleById(ruleId);
      if (promise && typeof promise.finally === 'function') {
        promise.finally(() => {
          // La actualización de initialData se hará en el siguiente useEffect
          // Aquí solo marcamos que la carga terminó
          setIsLoading(false);
        });
      } else {
        setIsLoading(false); // Asumir síncrono si no hay promesa
      }
    } else if (mode === 'create') {
      // Para creación, empezamos con datos vacíos y sin cargar
      setInitialData({});
      setIsLoading(false);
    }
  }, [mode, ruleId, getShippingRuleById]);

  // Adaptar los datos una vez que selectedRule se actualiza después de la carga
  useEffect(() => {
    if (mode === 'edit' && selectedRule && selectedRule.id === ruleId) {
      setInitialData(adaptRuleToFormData(selectedRule));
      // Asegurarse que isLoading sea false si la regla coincide
      // Esto puede ser redundante si el .finally del primer effect funciona bien
      setIsLoading(false); 
    }
    // Si estamos creando o si la regla cargada no coincide (aún), initialData ya está vacío o se actualizará
    // No necesitamos un else aquí si el estado inicial es {}
  }, [selectedRule, mode, ruleId]);

  // Manejar el guardado (submit del formulario)
  const handleSaveRule = useCallback(async (formData) => {
    setSubmissionError(null);
    setIsSubmitting(true);
    const payload = adaptFormDataToRulePayload(formData);

    try {
      let result;
      if (mode === 'edit' && ruleId) {
        result = await updateShippingRule(ruleId, payload);
      } else {
        result = await createShippingRule(null, payload); 
      }

      if (result && result.ok) {
        onSuccess(); // Llamar al callback de éxito (navegar atrás)
      } else {
        const errorMsg = result?.error || 'Error desconocido al guardar la regla';
        setSubmissionError(errorMsg);
        console.error('Error al guardar:', errorMsg);
        // Considera mostrar el error al usuario de forma más amigable
        alert(`Error al guardar: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Error inesperado al guardar la regla:', err);
      const errorMsg = err.message || 'Error inesperado del servidor';
      setSubmissionError(errorMsg);
      alert(`Error inesperado: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, ruleId, updateShippingRule, createShippingRule, onSuccess]);

  // Renderizado condicional mientras carga o si hay error de carga grave
  if (mode === 'edit' && isLoading) {
    return <p>Cargando datos de la regla...</p>;
  }

  // Si estamos en modo edición y la carga terminó pero initialData sigue vacío
  // (o no tiene el ID esperado), significa que la regla no se cargó correctamente.
  if (mode === 'edit' && !isLoading && (!initialData || initialData.id !== ruleId)) {
     // Comprobar si selectedRule tampoco coincide, lo que confirma el fallo de carga
     if (!selectedRule || selectedRule.id !== ruleId) {
        return <p>Error: No se pudieron cargar los datos para la regla con ID {ruleId}. Verifique que la regla exista.</p>;
     } 
     // Si selectedRule SÍ coincide pero initialData no, podría ser un retraso en la adaptación.
     // Se podría esperar un ciclo más o simplemente mostrar cargando.
     return <p>Preparando formulario...</p>; 
  }

  // Si llegamos aquí, tenemos initialData listos (vacíos para crear, poblados para editar)
  return (
    <ShippingForm
      initialData={initialData} // Pasar datos iniciales adaptados
      onSubmit={handleSaveRule} // Pasar la función de guardado
      onCancel={onCancel}       // Pasar la función de cancelar (navegar atrás)
      isSubmitting={isSubmitting} // Indicar si se está guardando
      submissionError={submissionError} // Pasar error de envío si existe
      mode={mode} // Pasar el modo puede ser útil para el formulario
    />
  );
}; 