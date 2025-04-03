import React from 'react';
import { Controller } from 'react-hook-form';

import ZipCodeSection from './ZipCodeSection';
import ZoneField from './ZoneField';
import StatusField from './StatusField';

/**
 * Componente para manejar la configuración de envío (gratuito o con costo)
 */
export const ShippingConfigSection = ({ 
  zipCodes, 
  setZipCodes, 
  control, 
  watch, 
  setValue, 
  errors 
}) => {
  const watchEnvioGratis = watch('envio_gratis');

  return (
    <div className="shipping-config-section mb-4">
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <h5 className="card-title mb-3">Configuración de cobertura</h5>
          
          <ZipCodeSection
            zipCodes={zipCodes}
            setZipCodes={setZipCodes}
            setValue={setValue}
          />

          <div className="alert alert-info mb-4">
            <h6 className="alert-heading mb-2">
              <i className="bi bi-info-circle-fill me-2"></i>
              Sistema jerárquico de reglas de envío
            </h6>
            <p className="mb-2">El sistema aplica las reglas de envío en orden de especificidad:</p>
            <ol>
              <li><strong>Código postal específico:</strong> La regla más prioritaria, se aplica a un código postal exacto (ej: 86610)</li>
              <li><strong>Estado:</strong> Si no hay regla específica para el código postal, se busca una regla para el estado al que pertenece</li>
              <li><strong>Nacional:</strong> Si no hay reglas específicas ni estatales, se aplica la regla nacional</li>
            </ol>
            <p className="small text-muted mb-0">
              <i className="bi bi-lightbulb me-1"></i>
              Ejemplo: Un cliente con código postal 86610 usará primero una regla específica para 86610.
              Si no existe, buscará una regla para Tabasco. Si tampoco existe, usará la regla nacional.
            </p>
          </div>

          <hr className="my-4" />
          
          <h5 className="card-title mb-3">Configuración de precio</h5>
          
          <div className="mb-3">
            <Controller
              name="envio_gratis"
              control={control}
              render={({ field }) => (
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="envio_gratis"
                    checked={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked);
                      if (e.target.checked) {
                        setValue('precio_base', 0);
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor="envio_gratis">
                    {field.value ? 'Envío gratuito' : 'Envío con costo'}
                  </label>
                </div>
              )}
            />
            <div className="form-text">
              {watchEnvioGratis
                ? "El cliente no pagará por el envío en esta zona"
                : "El cliente pagará el costo de envío definido a continuación"}
            </div>
          </div>

          {/* Precio Base - Solo visible cuando NO es envío gratis */}
          {!watchEnvioGratis && (
            <div className="mb-3">
              <label htmlFor="precio_base" className="form-label">
                Costo de envío <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">$</span>
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
                <span className="input-group-text">MXN</span>
              </div>
              {errors.precio_base && (
                <div className="invalid-feedback d-block">{errors.precio_base.message}</div>
              )}
              <div className="form-text">
                El precio que pagará el cliente por el envío
              </div>
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
      </div>
    </div>
  );
};

export default ShippingConfigSection; 