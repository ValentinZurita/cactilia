import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

/**
 * Hook personalizado para manejar la lógica del formulario de reglas de envío
 * 
 * COBERTURA GEOGRÁFICA:
 * 
 * El sistema ahora maneja los siguientes formatos en el array de códigos postales (zipcodes):
 * 
 * 1. 'nacional' - Cobertura para todo el país
 * 2. 'estado_XXX' - Cobertura para el estado con código XXX (ej: 'estado_PUE' para Puebla)
 * 3. '12345' - Códigos postales específicos (5 dígitos)
 * 
 * El backend debe priorizar las reglas en este orden:
 * 1. Código postal específico (5 dígitos exactos)
 * 2. Estado (cualquier código postal que comience con los prefijos del estado)
 * 3. Nacional (aplica a cualquier código postal)
 */
export const useShippingForm = (rule = null, isEdit = false, onSave, onComplete) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [zipCodes, setZipCodes] = useState([]);

  // Configurar react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      zipcode: '',
      zipcodes: [],
      zona: '',
      precio_base: 0,
      activo: true,
      envio_gratis: false,
      opciones_mensajeria: [],
      envio_variable: {
        aplica: false,
        envio_gratis_monto_minimo: 999,
        costo_por_producto_extra: 0
      },
      productos_restringidos: []
    }
  });

  // Observar valores para UI condicional
  const watchVariableShipping = watch('envio_variable.aplica');
  const watchRestrictedProducts = watch('productos_restringidos', []);
  const watchEnvioGratis = watch('envio_gratis');
  const watchZipCodes = watch('zipcodes', []);

  // Cargar datos de la regla si estamos en modo edición
  useEffect(() => {
    if (isEdit && rule) {
      // Establecer los valores del formulario
      if (rule.zipcodes && Array.isArray(rule.zipcodes)) {
        setValue('zipcodes', rule.zipcodes);
        setZipCodes(rule.zipcodes);
      } else if (rule.zipcode) {
        // Compatibilidad con versión anterior
        setValue('zipcode', rule.zipcode);
        setValue('zipcodes', [rule.zipcode]);
        setZipCodes([rule.zipcode]);
      }
      
      setValue('zona', rule.zona);
      setValue('precio_base', rule.precio_base);
      setValue('activo', rule.activo);
      setValue('envio_gratis', rule.envio_gratis);
      setValue('opciones_mensajeria', rule.opciones_mensajeria || []);

      // Configurar envío variable
      if (rule.envio_variable && rule.envio_variable.aplica) {
        setValue('envio_variable.aplica', true);
        setValue('envio_variable.envio_gratis_monto_minimo',
          rule.envio_variable.envio_gratis_monto_minimo);
        setValue('envio_variable.costo_por_producto_extra',
          rule.envio_variable.costo_por_producto_extra);
      }

      // Configurar productos restringidos
      if (rule.productos_restringidos && rule.productos_restringidos.length > 0) {
        setValue('productos_restringidos', rule.productos_restringidos);
      }
    }
  }, [isEdit, rule, setValue]);

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    setProcessing(true);
    setError(null);

    try {
      // Formatear valores numéricos
      const formattedData = {
        ...data,
        precio_base: parseFloat(data.precio_base),
        zipcodes: data.zipcodes
      };

      // Configurar envío variable
      if (!watchVariableShipping) {
        formattedData.envio_variable = { aplica: false };
      } else {
        formattedData.envio_variable = {
          ...data.envio_variable,
          envio_gratis_monto_minimo: parseFloat(data.envio_variable.envio_gratis_monto_minimo),
          costo_por_producto_extra: parseFloat(data.envio_variable.costo_por_producto_extra),
        };
      }

      // Guardar la regla
      const result = await onSave(isEdit ? rule.id : null, formattedData);

      if (result.ok) {
        onComplete();
      } else {
        setError(result.error || 'Error al guardar la regla de envío');
      }
    } catch (err) {
      console.error('Error en el formulario:', err);
      setError(err.message || 'Error al procesar el formulario');
    } finally {
      setProcessing(false);
    }
  };

  return {
    // Estados
    processing,
    error,
    activeSection,
    zipCodes,
    
    // Setters
    setActiveSection,
    setZipCodes,
    setError,
    
    // React Hook Form
    control,
    handleSubmit: handleSubmit(onSubmit),
    setValue,
    watch,
    errors,
    
    // Valores observados
    watchVariableShipping,
    watchRestrictedProducts,
    watchEnvioGratis,
    watchZipCodes
  };
}; 