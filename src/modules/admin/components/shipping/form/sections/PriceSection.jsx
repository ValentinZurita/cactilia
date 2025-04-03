import React from 'react';
import { Controller } from 'react-hook-form';

/**
 * Componente para la configuración de precios de envío
 */
const PriceSection = ({ control, errors, watch }) => {
  // Obtener los valores actuales
  const freeShipping = watch('freeShipping');
  const freeShippingThreshold = watch('freeShippingThreshold');
  
  return (
    <div className="py-2">
      <h6 className="text-secondary mb-3">Configuración de precio</h6>
      
      <div className="card border-0 bg-light mb-4">
        <div className="card-body">
          <Controller
            name="freeShipping"
            control={control}
            defaultValue={false}
            render={({ field: { value, onChange } }) => (
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="freeShipping"
                  checked={value}
                  onChange={(e) => {
                    onChange(e.target.checked);
                    if (e.target.checked) {
                      control.setValue('basePrice', 0);
                    }
                  }}
                />
                <label className="form-check-label" htmlFor="freeShipping">
                  <span className="fw-medium">{value ? 'Envío gratuito' : 'Envío con costo'}</span>
                </label>
                <div className="form-text small mt-0">
                  {value
                    ? "Los clientes en esta área no pagarán costo de envío"
                    : "Los clientes en esta área pagarán el costo definido"}
                </div>
              </div>
            )}
          />

          {/* Precio Base - Solo visible cuando NO es envío gratis */}
          <Controller
            name="basePrice"
            control={control}
            defaultValue={0}
            rules={{
              min: {
                value: 0,
                message: 'El precio debe ser mayor o igual a 0'
              }
            }}
            render={({ field }) => (
              <div className={!freeShipping ? '' : 'd-none'}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    step="0.01"
                    className={`form-control ${errors?.basePrice ? 'is-invalid' : ''}`}
                    placeholder="Ej: 50.00"
                    disabled={freeShipping}
                    {...field}
                  />
                  <span className="input-group-text">MXN</span>
                </div>
                {errors?.basePrice && (
                  <div className="invalid-feedback d-block small">
                    {errors.basePrice.message}
                  </div>
                )}
                <div className="form-text small text-end">
                  Precio base por envío
                </div>
              </div>
            )}
          />
        </div>
      </div>
      
      <h6 className="text-secondary mb-3">Condiciones especiales</h6>
      
      <div className="card border-0 bg-light">
        <div className="card-body">
          <Controller
            name="freeShippingThreshold"
            control={control}
            defaultValue={false}
            render={({ field: { value, onChange } }) => (
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="freeShippingThreshold"
                  checked={value}
                  onChange={(e) => {
                    onChange(e.target.checked);
                    if (!e.target.checked) {
                      control.setValue('minOrderAmount', 0);
                    }
                  }}
                />
                <label className="form-check-label" htmlFor="freeShippingThreshold">
                  <span className="fw-medium">Envío gratis a partir de cierto monto</span>
                </label>
              </div>
            )}
          />
          
          {/* Monto mínimo para envío gratis */}
          <Controller
            name="minOrderAmount"
            control={control}
            defaultValue={0}
            rules={{
              min: {
                value: 0,
                message: 'El monto debe ser mayor o igual a 0'
              }
            }}
            render={({ field }) => (
              <div className={freeShippingThreshold ? '' : 'd-none'}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    step="0.01"
                    className={`form-control ${errors?.minOrderAmount ? 'is-invalid' : ''}`}
                    placeholder="Ej: 1500.00"
                    disabled={!freeShippingThreshold}
                    {...field}
                  />
                  <span className="input-group-text">MXN</span>
                </div>
                {errors?.minOrderAmount && (
                  <div className="invalid-feedback d-block small">
                    {errors.minOrderAmount.message}
                  </div>
                )}
                <div className="form-text small text-end">
                  Monto mínimo de compra para envío gratis
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default PriceSection; 