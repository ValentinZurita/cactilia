import React from 'react';
import { Controller } from 'react-hook-form';

/**
 * Campos para configurar las opciones de envío variable.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.control - Control de react-hook-form
 * @param {Object} props.errors - Errores del formulario
 * @param {string} props.className - Clases adicionales
 */
export const VariableShippingFields = ({ control, errors, className = '' }) => {
  return (
    <div className={`variable-shipping-fields card border-0 bg-light rounded-3 p-3 ${className}`}>
      <div className="card-body">
        <div className="row g-3">
          {/* Monto mínimo para envío gratis */}
          <div className="col-md-6">
            <label htmlFor="envio_gratis_monto_minimo" className="form-label">
              Monto mínimo para envío gratis (MXN)
            </label>
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
            {errors?.envio_variable?.envio_gratis_monto_minimo && (
              <div className="invalid-feedback">
                {errors.envio_variable.envio_gratis_monto_minimo.message}
              </div>
            )}
            <div className="form-text">
              Establece 0 para desactivar el envío gratis por monto
            </div>
          </div>

          {/* Costo por producto extra */}
          <div className="col-md-6">
            <label htmlFor="costo_por_producto_extra" className="form-label">
              Costo por producto adicional (MXN)
            </label>
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
            {errors?.envio_variable?.costo_por_producto_extra && (
              <div className="invalid-feedback">
                {errors.envio_variable.costo_por_producto_extra.message}
              </div>
            )}
            <div className="form-text">
              Establece 0 para no cobrar por productos adicionales
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};