import React from 'react';
import { Controller } from 'react-hook-form';

/**
 * Campos para configurar las opciones de envío variable.
 * Renovado con diseño minimalista
 */
export const VariableShippingFields = ({ control, errors, className = '' }) => {
  return (
    <div className={`variable-shipping-fields ${className}`}>
      <div className="card border-0 rounded-4 bg-light p-0">
        <div className="card-body p-3">
          <div className="alert alert-secondary py-2 mb-3">
            <div className="d-flex">
              <i className="bi bi-info-circle text-secondary me-2 mt-1"></i>
              <p className="mb-0 small">
                Configura cómo se calcula el envío según el monto total y la cantidad de productos
              </p>
            </div>
          </div>

          <div className="row g-3">
            {/* Monto mínimo para envío gratis */}
            <div className="col-md-6">
              <label htmlFor="envio_gratis_monto_minimo" className="form-label text-secondary small">
                Monto mínimo para envío gratis
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">$</span>
                <Controller
                  name="envio_variable.envio_gratis_monto_minimo"
                  control={control}
                  rules={{
                    min: {
                      value: 0,
                      message: 'El monto debe ser mayor o igual a 0'
                    }
                  }}
                  render={({ field }) => (
                    <input
                      type="number"
                      step="0.01"
                      id="envio_gratis_monto_minimo"
                      className={`form-control ${
                        errors?.envio_variable?.envio_gratis_monto_minimo ? 'is-invalid' : ''
                      }`}
                      placeholder="Ej: 999.00"
                      {...field}
                    />
                  )}
                />
                <span className="input-group-text bg-white">MXN</span>
              </div>
              {errors?.envio_variable?.envio_gratis_monto_minimo && (
                <div className="invalid-feedback d-block">
                  {errors.envio_variable.envio_gratis_monto_minimo.message}
                </div>
              )}
              <div className="form-text small">
                <i className="bi bi-lightbulb me-1"></i>
                Cuando el cliente compre por este monto o más, el envío será gratuito. Establece 0 para desactivar esta opción.
              </div>
            </div>

            {/* Costo por producto extra */}
            <div className="col-md-6">
              <label htmlFor="costo_por_producto_extra" className="form-label text-secondary small">
                Costo por producto adicional
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">$</span>
                <Controller
                  name="envio_variable.costo_por_producto_extra"
                  control={control}
                  rules={{
                    min: {
                      value: 0,
                      message: 'El costo debe ser mayor o igual a 0'
                    }
                  }}
                  render={({ field }) => (
                    <input
                      type="number"
                      step="0.01"
                      id="costo_por_producto_extra"
                      className={`form-control ${
                        errors?.envio_variable?.costo_por_producto_extra ? 'is-invalid' : ''
                      }`}
                      placeholder="Ej: 15.00"
                      {...field}
                    />
                  )}
                />
                <span className="input-group-text bg-white">MXN</span>
              </div>
              {errors?.envio_variable?.costo_por_producto_extra && (
                <div className="invalid-feedback d-block">
                  {errors.envio_variable.costo_por_producto_extra.message}
                </div>
              )}
              <div className="form-text small">
                <i className="bi bi-lightbulb me-1"></i>
                Este costo se sumará al precio base por cada producto adicional en el carrito. Establece 0 si no deseas cobrar extra.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};