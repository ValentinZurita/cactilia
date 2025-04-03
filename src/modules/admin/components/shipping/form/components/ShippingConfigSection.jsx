import React from 'react';
import { Controller } from 'react-hook-form';

/**
 * Componente para manejar la configuración de envío (gratuito o con costo)
 */
export const ShippingConfigSection = ({ control, watch, setValue, errors }) => {
  const watchEnvioGratis = watch('envio_gratis');

  return (
    <>
      <label htmlFor="envio_gratis" className="form-label text-secondary fw-medium">Configuración de Envío</label>
      <div className="card border-0 bg-light rounded-3 p-3 mt-2">
        <div className="d-flex align-items-center">
          <Controller
            name="envio_gratis"
            control={control}
            render={({ field }) => (
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  id="envio_gratis"
                  className="form-check-input"
                  checked={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.checked);
                    if (e.target.checked) {
                      setValue('precio_base', 0);
                    }
                  }}
                />
                <label className="form-check-label fw-medium" htmlFor="envio_gratis">
                  {field.value ? 'Sí, el envío es gratuito' : 'No, el envío tiene costo'}
                </label>
              </div>
            )}
          />
        </div>
        <small className="text-muted d-block mt-2">
          {watchEnvioGratis ? 
            "El cliente no pagará por el envío en esta zona" : 
            "El cliente deberá pagar el costo de envío definido a continuación"}
        </small>
        
        {/* Precio Base - Solo visible cuando NO es envío gratis */}
        {!watchEnvioGratis && (
          <div className="mt-3" style={{ transition: 'all 0.3s ease' }}>
            <label htmlFor="precio_base" className="form-label text-secondary small">
              Costo de envío para el cliente
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white">$</span>
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
              <span className="input-group-text bg-white">MXN</span>
            </div>
            {errors.precio_base && (
              <div className="invalid-feedback d-block">{errors.precio_base.message}</div>
            )}
            <small className="text-muted d-block mt-1">
              Este es el costo que pagará el cliente por el envío
            </small>
          </div>
        )}
        
        {/* Campo oculto para precio_base cuando es envío gratis */}
        {watchEnvioGratis && (
          <Controller
            name="precio_base"
            control={control}
            render={({ field }) => (
              <input type="hidden" {...field} value="0" />
            )}
          />
        )}
      </div>
    </>
  );
}; 