import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente reutilizable para campos de entrada de datos con validación, tooltips y mensajes de error
 */
const FormInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  prefix, 
  suffix,
  min,
  max,
  step,
  error,
  helpText,
  tooltip,
  required = false
}) => {
  return (
    <div className="mb-3">
      <label className="form-label fw-medium mb-2">
        {label}
        {required && <span className="text-secondary ms-1 small">*</span>}
        {tooltip && (
          <span 
            className="ms-1 text-muted" 
            data-bs-toggle="tooltip" 
            data-bs-placement="top" 
            title={tooltip}
          >
            <i className="bi bi-info-circle-fill fs-7"></i>
          </span>
        )}
      </label>
      <div className={`input-group ${error ? 'has-validation' : ''}`}>
        {prefix && <span className="input-group-text">{prefix}</span>}
        <input
          type={type}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className="input-group-text">{suffix}</span>}
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
      {helpText && <div className="form-text">{helpText}</div>}
    </div>
  );
};

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  error: PropTypes.string,
  helpText: PropTypes.string,
  tooltip: PropTypes.string,
  required: PropTypes.bool
};

export default FormInput; 