import React from 'react';
import PropTypes from 'prop-types';
import FormInput from './FormInput';

/**
 * Componente para la configuración de precios y tiempos de entrega
 */
const DeliveryDetails = ({ 
  shippingType, 
  onShippingTypeChange, 
  errors 
}) => {
  return (
    <div className="row g-4 mb-4">
      <div className="col-md-5">
        <FormInput
          label="3. Precio"
          name="price"
          type="number"
          value={shippingType.price}
          onChange={onShippingTypeChange}
          placeholder="Ej: 99.90"
          prefix="$"
          suffix="MXN"
          step="0.01"
          min="0"
          error={errors.price}
          required={true}
          tooltip="Costo base del servicio que se cobrará al cliente"
        />
      </div>
      <div className="col-md-7">
        <label className="form-label fw-medium mb-2">
          4. Tiempo de entrega
          <span 
            className="ms-1 text-muted" 
            data-bs-toggle="tooltip" 
            data-bs-placement="top" 
            title="Tiempo estimado que tardará el envío en llegar a su destino"
          >
            <i className="bi bi-info-circle-fill fs-7"></i>
          </span>
        </label>
        <div className="row g-2">
          <div className="col-sm-5">
            <div className={`input-group ${errors.minDays ? 'has-validation' : ''}`}>
              <span className="input-group-text">De</span>
              <input
                type="number"
                min="0"
                className={`form-control ${errors.minDays ? 'is-invalid' : ''}`}
                placeholder="1"
                name="minDays"
                value={shippingType.minDays}
                onChange={onShippingTypeChange}
              />
              {errors.minDays && <div className="invalid-feedback">{errors.minDays}</div>}
            </div>
          </div>
          <div className="col-sm-7">
            <div className={`input-group ${errors.maxDays ? 'has-validation' : ''}`}>
              <span className="input-group-text">a</span>
              <input
                type="number"
                min="0"
                className={`form-control ${errors.maxDays ? 'is-invalid' : ''}`}
                placeholder="3"
                name="maxDays"
                value={shippingType.maxDays}
                onChange={onShippingTypeChange}
              />
              <span className="input-group-text">días</span>
              {errors.maxDays && <div className="invalid-feedback">{errors.maxDays}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DeliveryDetails.propTypes = {
  shippingType: PropTypes.object.isRequired,
  onShippingTypeChange: PropTypes.func.isRequired,
  errors: PropTypes.object
};

export default DeliveryDetails; 