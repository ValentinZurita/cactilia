import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

/**
 * Componente para crear o editar servicios de envío.
 * Se puede usar de manera independiente o integrado en otro formulario.
 */
export const ShippingServiceForm = ({
                                      service = null,
                                      onSave,
                                      onCancel,
                                      isModal = false
                                    }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Configurar react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio_base: 0,
      cobertura: 'nacional', // nacional, regional, local
      tiempo_estimado: '',
      activo: true
    }
  });

  // Cargar datos del servicio si está en modo edición
  useEffect(() => {
    if (service) {
      reset({
        nombre: service.nombre || '',
        descripcion: service.descripcion || '',
        precio_base: service.precio_base || 0,
        cobertura: service.cobertura || 'nacional',
        tiempo_estimado: service.tiempo_estimado || '',
        activo: service.activo !== undefined ? service.activo : true
      });
    }
  }, [service, reset]);

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    setProcessing(true);
    setError(null);

    try {
      // Formatear datos
      const formattedData = {
        ...data,
        precio_base: parseFloat(data.precio_base)
      };

      // Enviar datos al padre
      const result = await onSave(formattedData, service?.id);

      if (!result.ok) {
        throw new Error(result.error || 'Error al guardar el servicio');
      }

      if (!isModal) {
        // Si no es modal, resetear el formulario después de guardar
        reset();
      }

    } catch (err) {
      console.error('Error en el formulario:', err);
      setError(err.message || 'Error al procesar el formulario');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="shipping-service-form">
      {error && (
        <div className="alert alert-danger py-2 mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-3">
          {/* Nombre del servicio */}
          <div className="col-md-6">
            <label htmlFor="nombre" className="form-label text-secondary small">Nombre del servicio</label>
            <Controller
              name="nombre"
              control={control}
              rules={{ required: 'El nombre es obligatorio' }}
              render={({ field }) => (
                <input
                  type="text"
                  id="nombre"
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                  placeholder="Ej: Mensajería Express"
                  {...field}
                />
              )}
            />
            {errors.nombre && (
              <div className="invalid-feedback">{errors.nombre.message}</div>
            )}
          </div>

          {/* Tiempo estimado */}
          <div className="col-md-6">
            <label htmlFor="tiempo_estimado" className="form-label text-secondary small">Tiempo estimado</label>
            <Controller
              name="tiempo_estimado"
              control={control}
              rules={{ required: 'El tiempo estimado es obligatorio' }}
              render={({ field }) => (
                <input
                  type="text"
                  id="tiempo_estimado"
                  className={`form-control ${errors.tiempo_estimado ? 'is-invalid' : ''}`}
                  placeholder="Ej: 1-2 días hábiles"
                  {...field}
                />
              )}
            />
            {errors.tiempo_estimado && (
              <div className="invalid-feedback">{errors.tiempo_estimado.message}</div>
            )}
          </div>

          {/* Precio base */}
          <div className="col-md-4">
            <label htmlFor="precio_base" className="form-label text-secondary small">Precio base (MXN)</label>
            <Controller
              name="precio_base"
              control={control}
              rules={{
                required: 'El precio base es obligatorio',
                min: { value: 0, message: 'El precio debe ser mayor o igual a 0' }
              }}
              render={({ field }) => (
                <div className="input-group">
                  <span className="input-group-text bg-white">$</span>
                  <input
                    type="number"
                    step="0.01"
                    id="precio_base"
                    className={`form-control ${errors.precio_base ? 'is-invalid' : ''}`}
                    placeholder="0.00"
                    {...field}
                  />
                  <span className="input-group-text bg-white">MXN</span>
                </div>
              )}
            />
            {errors.precio_base && (
              <div className="invalid-feedback d-block">{errors.precio_base.message}</div>
            )}
          </div>

          {/* Cobertura */}
          <div className="col-md-4">
            <label htmlFor="cobertura" className="form-label text-secondary small">Cobertura</label>
            <Controller
              name="cobertura"
              control={control}
              render={({ field }) => (
                <select id="cobertura" className="form-select" {...field}>
                  <option value="nacional">Nacional</option>
                  <option value="regional">Regional</option>
                  <option value="local">Local</option>
                </select>
              )}
            />
          </div>

          {/* Estado */}
          <div className="col-md-4">
            <label htmlFor="activo" className="form-label text-secondary small">Estado</label>
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

          {/* Descripción */}
          <div className="col-12">
            <label htmlFor="descripcion" className="form-label text-secondary small">Descripción</label>
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <textarea
                  id="descripcion"
                  className="form-control"
                  rows="3"
                  placeholder="Describa detalles adicionales del servicio"
                  {...field}
                />
              )}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-3"
            onClick={onCancel}
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-outline-dark rounded-3"
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
                {service ? 'Actualizar Servicio' : 'Crear Servicio'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};