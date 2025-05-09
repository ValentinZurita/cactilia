import React from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { FormField } from '../ui';

/**
 * Componente para configurar reglas de envío gratuito
 * @param {object} control - Control de react-hook-form
 * @param {object} errors - Errores de validación
 * @param {object} watch - Función para observar valores
 * @param {function} setValue - Función para establecer valores
 */
const RulesSection = ({ control, errors, watch, setValue }) => {
  // Obtener valores para renderizado condicional
  const freeShipping = watch('freeShipping');
  const freeShippingThreshold = watch('freeShippingThreshold');
  const shippingTypes = watch('opciones_mensajeria') || [];
  
  // Función segura para setValue
  const safeSetValue = (field, value) => {
    if (setValue && typeof setValue === 'function') {
      setValue(field, value);
    }
  };
  
  return (
    <section className="rules-section py-3">
      <h6 className="text-dark mb-4">Política de envío gratuito</h6>
      
      <div className="alert alert-light border small py-2 mb-4">
        <i className="bi bi-info-circle me-2"></i>
        Estas configuraciones afectarán a todos los métodos de envío de esta regla.
      </div>
      
      {/* Envío siempre gratuito */}
      <Controller
        name="freeShipping"
        control={control}
        defaultValue={false}
        render={({ field: { value, onChange } }) => (
          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="freeShipping"
              checked={value}
              onChange={(e) => {
                onChange(e.target.checked);
                
                // Si se marca, también deshabilitar el umbral de envío gratis
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
      
      {/* Envío gratis a partir de cierto monto */}
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
          <div className={freeShippingThreshold && !freeShipping ? 'ms-4 mb-4' : 'd-none'}>
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
    </section>
  );
};

RulesSection.propTypes = {
  /** Control de react-hook-form */
  control: PropTypes.object.isRequired,
  /** Errores de validación */
  errors: PropTypes.object,
  /** Función para observar valores */
  watch: PropTypes.func.isRequired,
  /** Función para establecer valores */
  setValue: PropTypes.func.isRequired
};

export default RulesSection; 