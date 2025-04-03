import React from 'react';
import { Controller } from 'react-hook-form';
import { RestrictedProductsSelector } from '../form/RestrictedProductsSelector.jsx'
import { VariableShippingFields } from '../form/VariableShippingFields.jsx'


/**
 * Componente para la sección de configuración avanzada de una regla de envío.
 */
export const ShippingAdvancedSection = ({
                                          control,
                                          errors,
                                          watch
                                        }) => {
  const watchVariableShipping = watch('envio_variable.aplica');
  const watchRestrictedProducts = watch('productos_restringidos', []);

  return (
    <div className="advanced-settings">
      <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">
        Configuración Avanzada
      </h6>

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

        {/* Campos de envío variable */}
        {watchVariableShipping && (
          <VariableShippingFields
            control={control}
            errors={errors}
            className="mb-4"
          />
        )}
      </div>

      {/* Productos restringidos */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="fw-medium">Productos restringidos</span>
          <small className="text-muted">
            {watchRestrictedProducts.length} producto(s) configurado(s)
          </small>
        </div>

        <RestrictedProductsSelector
          control={control}
        />
      </div>
    </div>
  );
};