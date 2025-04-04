import React from 'react';
import { Controller } from 'react-hook-form';

/**
 * Componente para la sección de configuración avanzada
 */
export const AdvancedSection = ({ control, errors, variableShipping, watchRestrictedProducts }) => {
  return (
    <div className="advanced-settings">
      <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Configuración Avanzada</h6>

      {/* Toggle para envío variable */}
      <div className="mb-4">
        <div className="d-flex align-items-center mb-3">
          <Controller
            name="envio_variable.aplica"
            control={control}
            render={({ field }) => (
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  id="envio_variable.aplica"
                  className="form-check-input"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label className="form-check-label ms-2" htmlFor="envio_variable.aplica">
                  <span className="fw-medium">Envío variable</span>
                  <small className="text-muted d-block">
                    Configura precios variables según monto o número de productos
                  </small>
                </label>
              </div>
            )}
          />
        </div>

        {/* Campos de envío variable - Temporalmente deshabilitado hasta crear el componente */}
        {variableShipping && (
          <div className="alert alert-info">
            <p className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Aquí se mostrarán las opciones para configurar precios variables por cantidad de productos o monto.
            </p>
          </div>
        )}
      </div>

      {/* Productos restringidos - Temporalmente deshabilitado hasta crear el componente */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="fw-medium">Productos restringidos</span>
          <small className="text-muted">
            {watchRestrictedProducts ? watchRestrictedProducts.length : 0} producto(s) configurado(s)
          </small>
        </div>

        <div className="alert alert-info">
          <p className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Aquí se mostrará el selector de productos restringidos.
          </p>
        </div>
      </div>
    </div>
  );
}; 