import React from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';

// Componente para política de envío gratuito
const FreeShippingPolicy = ({ control, errors, watch, setValue }) => {
  const freeShipping = watch('freeShipping');
  const freeShippingThreshold = watch('freeShippingThreshold');
  const shippingTypes = watch('opciones_mensajeria') || [];

  const safeSetValue = (field, value) => {
    if (setValue && typeof setValue === 'function') {
      setValue(field, value);
    }
  };

  return (
    <>
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
    </>
  );
};

// Componente para límites de peso y volumen
const WeightVolumeConfig = ({ control, errors, watch, setValue }) => {
  const enableWeightLimit = watch('enableWeightLimit') || false;
  const enableVolumeLimit = watch('enableVolumeLimit') || false;

  const safeSetValue = (field, value) => {
    if (setValue && typeof setValue === 'function') {
      setValue(field, value);
    }
  };

  return (
    <>
      <h6 className="text-dark mb-4 pt-4 border-top mt-5">Límites de peso y volumen</h6>
      
      <div className="alert alert-warning border small py-2 mb-4">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>¡NUEVA FUNCIONALIDAD!</strong> Define límites de peso o volumen y costos adicionales para envíos que excedan estos límites.
      </div>

      {/* Límite de peso */}
      <Controller
        name="enableWeightLimit"
        control={control}
        defaultValue={false}
        render={({ field: { value, onChange } }) => (
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="enableWeightLimit"
              checked={value}
              onChange={(e) => {
                onChange(e.target.checked);
                if (!e.target.checked) {
                  safeSetValue('weightLimit', 0);
                  safeSetValue('weightExcessCost', 0);
                }
              }}
            />
            <label className="form-check-label fw-medium" htmlFor="enableWeightLimit">
              Establecer límite de peso
            </label>
          </div>
        )}
      />

      {/* Configuración de límite de peso */}
      {enableWeightLimit && (
        <div className="ms-4 mb-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="weightLimit" className="form-label">
                Límite de peso máximo
              </label>
              <div className="input-group mb-2">
                <Controller
                  name="weightLimit"
                  control={control}
                  defaultValue={5}
                  rules={{
                    required: "El límite de peso es requerido",
                    min: {
                      value: 0.1,
                      message: 'El límite debe ser mayor a 0'
                    }
                  }}
                  render={({ field }) => (
                    <input
                      type="number"
                      step="0.1"
                      className={`form-control ${errors?.weightLimit ? 'is-invalid' : ''}`}
                      placeholder="Ej: 5"
                      id="weightLimit"
                      {...field}
                    />
                  )}
                />
                <span className="input-group-text">kg</span>
              </div>
              {errors?.weightLimit && (
                <div className="invalid-feedback d-block">
                  {errors.weightLimit.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label htmlFor="weightExcessCost" className="form-label">
                Costo por kg adicional
              </label>
              <div className="input-group mb-2">
                <span className="input-group-text">$</span>
                <Controller
                  name="weightExcessCost"
                  control={control}
                  defaultValue={50}
                  rules={{
                    required: "El costo adicional es requerido",
                    min: {
                      value: 0,
                      message: 'El costo debe ser mayor o igual a 0'
                    }
                  }}
                  render={({ field }) => (
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${errors?.weightExcessCost ? 'is-invalid' : ''}`}
                      placeholder="Ej: 50.00"
                      id="weightExcessCost"
                      {...field}
                    />
                  )}
                />
                <span className="input-group-text">MXN</span>
              </div>
              {errors?.weightExcessCost && (
                <div className="invalid-feedback d-block">
                  {errors.weightExcessCost.message}
                </div>
              )}
            </div>
          </div>
          <div className="form-text">
            Si el peso total supera este límite, se cobrará el costo adicional por cada kg excedente.
          </div>
        </div>
      )}

      {/* Límite de volumen */}
      <Controller
        name="enableVolumeLimit"
        control={control}
        defaultValue={false}
        render={({ field: { value, onChange } }) => (
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="enableVolumeLimit"
              checked={value}
              onChange={(e) => {
                onChange(e.target.checked);
                if (!e.target.checked) {
                  safeSetValue('volumeLimit', 0);
                  safeSetValue('volumeExcessCost', 0);
                }
              }}
            />
            <label className="form-check-label fw-medium" htmlFor="enableVolumeLimit">
              Establecer límite de volumen
            </label>
          </div>
        )}
      />

      {/* Configuración de límite de volumen */}
      {enableVolumeLimit && (
        <div className="ms-4 mb-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="volumeLimit" className="form-label">
                Límite de volumen máximo
              </label>
              <div className="input-group mb-2">
                <Controller
                  name="volumeLimit"
                  control={control}
                  defaultValue={0.025}
                  rules={{
                    required: "El límite de volumen es requerido",
                    min: {
                      value: 0.001,
                      message: 'El límite debe ser mayor a 0'
                    }
                  }}
                  render={({ field }) => (
                    <input
                      type="number"
                      step="0.001"
                      className={`form-control ${errors?.volumeLimit ? 'is-invalid' : ''}`}
                      placeholder="Ej: 0.025"
                      id="volumeLimit"
                      {...field}
                    />
                  )}
                />
                <span className="input-group-text">m³</span>
              </div>
              {errors?.volumeLimit && (
                <div className="invalid-feedback d-block">
                  {errors.volumeLimit.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label htmlFor="volumeExcessCost" className="form-label">
                Costo por m³ adicional
              </label>
              <div className="input-group mb-2">
                <span className="input-group-text">$</span>
                <Controller
                  name="volumeExcessCost"
                  control={control}
                  defaultValue={100}
                  rules={{
                    required: "El costo adicional es requerido",
                    min: {
                      value: 0,
                      message: 'El costo debe ser mayor o igual a 0'
                    }
                  }}
                  render={({ field }) => (
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${errors?.volumeExcessCost ? 'is-invalid' : ''}`}
                      placeholder="Ej: 100.00"
                      id="volumeExcessCost"
                      {...field}
                    />
                  )}
                />
                <span className="input-group-text">MXN</span>
              </div>
              {errors?.volumeExcessCost && (
                <div className="invalid-feedback d-block">
                  {errors.volumeExcessCost.message}
                </div>
              )}
            </div>
          </div>
          <div className="form-text">
            Si el volumen total supera este límite, se cobrará el costo adicional por cada m³ excedente.
          </div>
        </div>
      )}
    </>
  );
};

// Componente para reglas de productos múltiples
const MultiProductConfig = ({ control, errors, watch, setValue }) => {
  const enableMultiProductRules = watch('enableMultiProductRules') || false;

  const safeSetValue = (field, value) => {
    if (setValue && typeof setValue === 'function') {
      setValue(field, value);
    }
  };

  return (
    <>
      <h6 className="text-dark mb-4 pt-4 border-top mt-5">Reglas para múltiples productos</h6>
      
      <div className="alert alert-warning border small py-2 mb-4">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>¡NUEVA FUNCIONALIDAD!</strong> Define cómo se calculará el costo cuando se envían varios productos en un mismo pedido.
      </div>

      {/* Reglas para múltiples productos */}
      <Controller
        name="enableMultiProductRules"
        control={control}
        defaultValue={false}
        render={({ field: { value, onChange } }) => (
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="enableMultiProductRules"
              checked={value}
              onChange={(e) => {
                onChange(e.target.checked);
                if (!e.target.checked) {
                  safeSetValue('additionalProductCost', 0);
                  safeSetValue('additionalProductRule', 'fixed');
                }
              }}
            />
            <label className="form-check-label fw-medium" htmlFor="enableMultiProductRules">
              Configurar tarifa especial para productos adicionales
            </label>
          </div>
        )}
      />

      {/* Configuración de tarifa para productos adicionales */}
      {enableMultiProductRules && (
        <div className="ms-4 mb-4">
          <div className="mb-3">
            <label htmlFor="additionalProductRule" className="form-label">
              Regla para productos adicionales
            </label>
            <Controller
              name="additionalProductRule"
              control={control}
              defaultValue="fixed"
              render={({ field }) => (
                <select
                  className="form-select"
                  id="additionalProductRule"
                  {...field}
                >
                  <option value="fixed">Costo fijo por producto adicional</option>
                  <option value="percentage">Porcentaje del costo base por producto adicional</option>
                  <option value="weight_based">Costo basado en peso por producto adicional</option>
                </select>
              )}
            />
            <div className="form-text">
              Define cómo se calculará el costo de envío para productos adicionales.
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="additionalProductCost" className="form-label">
              Costo por producto adicional
            </label>
            <div className="input-group mb-2 w-75">
              <span className="input-group-text">
                {watch('additionalProductRule') === 'percentage' ? '%' : '$'}
              </span>
              <Controller
                name="additionalProductCost"
                control={control}
                defaultValue={50}
                rules={{
                  required: "El costo adicional es requerido",
                  min: {
                    value: 0,
                    message: 'El costo debe ser mayor o igual a 0'
                  }
                }}
                render={({ field }) => (
                  <input
                    type="number"
                    step="0.01"
                    className={`form-control ${errors?.additionalProductCost ? 'is-invalid' : ''}`}
                    placeholder={watch('additionalProductRule') === 'percentage' ? "Ej: 50" : "Ej: 50.00"}
                    id="additionalProductCost"
                    {...field}
                  />
                )}
              />
              {watch('additionalProductRule') !== 'percentage' && (
                <span className="input-group-text">MXN</span>
              )}
            </div>
            {errors?.additionalProductCost && (
              <div className="invalid-feedback d-block">
                {errors.additionalProductCost.message}
              </div>
            )}
            <div className="form-text">
              {watch('additionalProductRule') === 'fixed' && 
                "Se cobrará esta cantidad fija por cada producto adicional en el envío."}
              {watch('additionalProductRule') === 'percentage' && 
                "Se cobrará este porcentaje del costo base por cada producto adicional."}
              {watch('additionalProductRule') === 'weight_based' && 
                "Se cobrará este monto por kg para cada producto adicional."}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Componente para la sección de reglas de envío
 */
export const RulesSection = ({ control, errors, watch, setValue }) => {
  return (
    <section className="rules-section py-3">
      {/* Sección de política de envío gratuito */}
      <FreeShippingPolicy 
        control={control} 
        errors={errors} 
        watch={watch} 
        setValue={setValue} 
      />
      
      {/* Sección de límites de peso y volumen */}
      <WeightVolumeConfig 
        control={control} 
        errors={errors} 
        watch={watch} 
        setValue={setValue} 
      />
      
      {/* Sección de reglas para múltiples productos */}
      <MultiProductConfig 
        control={control} 
        errors={errors} 
        watch={watch} 
        setValue={setValue} 
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