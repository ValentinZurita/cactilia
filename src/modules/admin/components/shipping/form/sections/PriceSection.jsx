import React from 'react';
import { Controller } from 'react-hook-form';

/**
 * Componente para la configuración de condiciones especiales de precio
 */
const PriceSection = ({ control, errors, watch, setValue }) => {
  // Obtener los valores actuales
  const freeShipping = watch('freeShipping');
  const freeShippingThreshold = watch('freeShippingThreshold');
  const shippingTypes = watch('shippingTypes') || [];
  
  // Función segura para setValue
  const safeSetValue = (field, value) => {
    if (setValue && typeof setValue === 'function') {
      setValue(field, value);
    }
  };
  
  return (
    // Envolver todo en una Card
    <div className="card">
      <div className="card-body p-4"> {/* Añadir padding */}
        <h6 className="card-title mb-4">Política de envío gratuito</h6>
        
        <div className="alert alert-light border small py-2 mb-4">
          <i className="bi bi-info-circle me-2"></i>
          Estas configuraciones afectarán a todos los métodos de envío de esta regla.
        </div>
        
        {/* Checkbox: Envío siempre gratuito */}
        <Controller
          name="freeShipping"
          control={control}
          defaultValue={false}
          render={({ field: { value, onChange } }) => (
            <div className="form-check mb-4"> {/* Mantener margen inferior */}
              <input
                className="form-check-input"
                type="checkbox"
                id="freeShipping"
                checked={value}
                onChange={(e) => {
                  onChange(e.target.checked);
                  if (e.target.checked) {
                    safeSetValue('freeShippingThreshold', false);
                  }
                }}
              />
              <label className="form-check-label fw-medium" htmlFor="freeShipping">
                Envío siempre gratuito
              </label>
              <div className="form-text">
                Los clientes en esta área no pagarán costo de envío, sin importar el monto de su compra.
                {shippingTypes.length > 0 && value && (
                  <div className="text-danger mt-1">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    Los precios configurados en los métodos de envío serán ignorados.
                  </div>
                )}
              </div>
            </div>
          )}
        />
        
        {/* Checkbox: Envío gratis por monto */}
        <Controller
          name="freeShippingThreshold"
          control={control}
          defaultValue={false}
          render={({ field: { value, onChange } }) => (
            <div className={`form-check mb-3 ${freeShipping ? 'opacity-50' : ''}`}>
              <input
                className="form-check-input"
                type="checkbox"
                id="freeShippingThreshold"
                checked={value}
                onChange={(e) => {
                  onChange(e.target.checked);
                  if (!e.target.checked) {
                    safeSetValue('minOrderAmount', 0);
                  }
                }}
                disabled={freeShipping}
              />
              <label className="form-check-label fw-medium" htmlFor="freeShippingThreshold">
                Envío gratis a partir de cierto monto
              </label>
            </div>
          )}
        />
        
        {/* Campo: Monto mínimo para envío gratis */}
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
            // Aplicar mb-3 al contenedor condicional para espaciado general
            <div className={`${freeShippingThreshold && !freeShipping ? 'ms-4 mb-3' : 'd-none'}`}> 
              <div className="input-group mb-2 w-75">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  step="0.01"
                  className={`form-control ${errors?.minOrderAmount ? 'is-invalid' : ''}`}
                  placeholder="Ej: 1500.00"
                  disabled={!freeShippingThreshold || freeShipping}
                  {...field}
                />
                <span className="input-group-text">MXN</span>
              </div>
              {errors?.minOrderAmount && (
                <div className="invalid-feedback d-block">
                  {errors.minOrderAmount.message}
                </div>
              )}
              <div className="form-text">
                El envío será gratuito si el monto del pedido supera esta cantidad.
                {shippingTypes.length > 0 && freeShippingThreshold && !freeShipping && (
                  <div className="text-success mt-1">
                    <i className="bi bi-info-circle-fill me-1"></i>
                    Los precios configurados en los métodos de envío se aplicarán si no se alcanza este monto.
                  </div>
                )}
              </div>
            </div>
          )}
        />
      </div> 
    </div> 
  );
};

export default PriceSection; 