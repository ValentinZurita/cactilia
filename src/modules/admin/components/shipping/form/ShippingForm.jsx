import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useShippingServices } from '../hooks/useShippingServices';
import { DeliveryServicesSelector } from './DeliveryServicesSelector';
import { VariableShippingFields } from './VariableShippingFields';
import { RestrictedProductsSelector } from './RestrictedProductsSelector';

/**
 * Formulario para crear o editar reglas de envío.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.rule - Regla de envío para editar (opcional)
 * @param {boolean} props.isEdit - Indica si estamos en modo edición
 * @param {Function} props.onSave - Función para guardar la regla
 * @param {Function} props.onCancel - Función para cancelar
 * @param {Function} props.onComplete - Función a llamar al completar
 */
export const ShippingForm = ({ rule, isEdit = false, onSave, onCancel, onComplete }) => {
  const [hasVariableShipping, setHasVariableShipping] = useState(false);
  const [hasRestrictedProducts, setHasRestrictedProducts] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Obtener servicios de envío disponibles
  const { services, loading: loadingServices } = useShippingServices();

  // Configurar react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      zipcode: '',
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

  // Observar valores para manejar conditional rendering
  const watchVariableShipping = watch('envio_variable.aplica');
  const watchRestrictedProducts = watch('productos_restringidos');

  // Cargar datos de la regla si estamos en modo edición
  useEffect(() => {
    if (isEdit && rule) {
      // Establecer los valores del formulario
      setValue('zipcode', rule.zipcode);
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
        setHasVariableShipping(true);
      }

      // Configurar productos restringidos
      if (rule.productos_restringidos && rule.productos_restringidos.length > 0) {
        setValue('productos_restringidos', rule.productos_restringidos);
        setHasRestrictedProducts(true);
      }
    }
  }, [isEdit, rule, setValue]);

  // Actualizar estados cuando cambian los valores observados
  useEffect(() => {
    setHasVariableShipping(watchVariableShipping);
  }, [watchVariableShipping]);

  useEffect(() => {
    setHasRestrictedProducts(watchRestrictedProducts.length > 0);
  }, [watchRestrictedProducts]);

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    setProcessing(true);
    setError(null);

    try {
      // Formatear valores numéricos
      const formattedData = {
        ...data,
        precio_base: parseFloat(data.precio_base)
      };

      // Si no hay envío variable, eliminar la sección
      if (!hasVariableShipping) {
        formattedData.envio_variable = { aplica: false };
      } else {
        formattedData.envio_variable = {
          ...data.envio_variable,
          envio_gratis_monto_minimo: parseFloat(data.envio_variable.envio_gratis_monto_minimo),
          costo_por_producto_extra: parseFloat(data.envio_variable.costo_por_producto_extra),
        };
      }

      // Si no hay productos restringidos, usar array vacío
      if (!hasRestrictedProducts) {
        formattedData.productos_restringidos = [];
      }

      // Llamar a la función de guardar
      const result = await onSave(isEdit ? rule.id : null, formattedData);

      if (result.ok) {
        reset(); // Limpiar formulario
        onComplete(); // Notificar completado
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

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4">
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row g-4">
            {/* Sección Principal */}
            <div className="col-12">
              <h5 className="card-title mb-3">Información Básica</h5>
              <div className="row g-3">
                {/* Código Postal */}
                <div className="col-md-6">
                  <label htmlFor="zipcode" className="form-label">Código Postal</label>
                  <Controller
                    name="zipcode"
                    control={control}
                    rules={{
                      required: 'El código postal es obligatorio',
                      pattern: {
                        value: /^\d{5}$|^nacional$/,
                        message: 'Ingresa un código postal válido (5 dígitos) o "nacional"'
                      }
                    }}
                    render={({ field }) => (
                      <input
                        type="text"
                        id="zipcode"
                        className={`form-control ${errors.zipcode ? 'is-invalid' : ''}`}
                        placeholder="Ej: 72000 o nacional"
                        {...field}
                      />
                    )}
                  />
                  {errors.zipcode && (
                    <div className="invalid-feedback">{errors.zipcode.message}</div>
                  )}
                </div>

                {/* Zona */}
                <div className="col-md-6">
                  <label htmlFor="zona" className="form-label">Zona</label>
                  <Controller
                    name="zona"
                    control={control}
                    rules={{
                      required: 'La zona es obligatoria'
                    }}
                    render={({ field }) => (
                      <input
                        type="text"
                        id="zona"
                        className={`form-control ${errors.zona ? 'is-invalid' : ''}`}
                        placeholder="Ej: Centro Puebla"
                        {...field}
                      />
                    )}
                  />
                  {errors.zona && (
                    <div className="invalid-feedback">{errors.zona.message}</div>
                  )}
                </div>

                {/* Precio Base */}
                <div className="col-md-4">
                  <label htmlFor="precio_base" className="form-label">Precio Base (MXN)</label>
                  <Controller
                    name="precio_base"
                    control={control}
                    rules={{
                      required: 'El precio base es obligatorio',
                      min: {
                        value: 0,
                        message: 'El precio debe ser mayor o igual a 0'
                      }
                    }}
                    render={({ field }) => (
                      <input
                        type="number"
                        step="0.01"
                        id="precio_base"
                        className={`form-control ${errors.precio_base ? 'is-invalid' : ''}`}
                        placeholder="Ej: 50.00"
                        {...field}
                      />
                    )}
                  />
                  {errors.precio_base && (
                    <div className="invalid-feedback">{errors.precio_base.message}</div>
                  )}
                </div>

                {/* Estado */}
                <div className="col-md-4">
                  <label htmlFor="activo" className="form-label">Estado</label>
                  <Controller
                    name="activo"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="activo"
                        className="form-select"
                        {...field}
                        value={field.value ? 'true' : 'false'}
                        onChange={(e) => field.onChange(e.target.value === 'true')}
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    )}
                  />
                </div>

                {/* Envío Gratis */}
                <div className="col-md-4">
                  <label htmlFor="envio_gratis" className="form-label">Envío Gratis</label>
                  <Controller
                    name="envio_gratis"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="envio_gratis"
                        className="form-select"
                        {...field}
                        value={field.value ? 'true' : 'false'}
                        onChange={(e) => field.onChange(e.target.value === 'true')}
                      >
                        <option value="false">No</option>
                        <option value="true">Sí</option>
                      </select>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Opciones de Mensajería */}
            <div className="col-12">
              <h5 className="card-title border-top pt-4 mb-3">Servicios de Mensajería</h5>
              <DeliveryServicesSelector
                control={control}
                services={services}
                loading={loadingServices}
              />
            </div>

            {/* Opciones avanzadas */}
            <div className="col-12">
              <h5 className="card-title border-top pt-4 mb-3">Opciones Avanzadas</h5>

              {/* Toggle para envío variable */}
              <div className="form-check form-switch mb-3">
                <Controller
                  name="envio_variable.aplica"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="envio_variable.aplica"
                      className="form-check-input"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <label className="form-check-label" htmlFor="envio_variable.aplica">
                  Habilitar envío variable (por monto o productos)
                </label>
              </div>

              {/* Campos de envío variable */}
              {hasVariableShipping && (
                <VariableShippingFields
                  control={control}
                  errors={errors}
                  className="mb-4"
                />
              )}

              {/* Toggle para productos restringidos */}
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  id="enableRestrictedProducts"
                  className="form-check-input"
                  checked={hasRestrictedProducts}
                  onChange={(e) => setHasRestrictedProducts(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="enableRestrictedProducts">
                  Configurar productos restringidos
                </label>
              </div>

              {/* Selector de productos restringidos */}
              {hasRestrictedProducts && (
                <RestrictedProductsSelector
                  control={control}
                />
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={processing}
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  {isEdit ? 'Actualizar Regla' : 'Crear Regla'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};