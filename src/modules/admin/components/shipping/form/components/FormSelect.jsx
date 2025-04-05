import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente reutilizable para campos de selección con validación, tooltips y mensajes de error
 */
const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
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
      <select
        className={`form-select ${error ? 'is-invalid' : ''}`}
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value="">Seleccionar...</option>
        {options.map(option => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {error && <div className="invalid-feedback">{error}</div>}
      {helpText && <div className="form-text">{helpText}</div>}
    </div>
  );
};

FormSelect.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
      })
    ])
  ).isRequired,
  error: PropTypes.string,
  helpText: PropTypes.string,
  tooltip: PropTypes.string,
  required: PropTypes.bool
};

export default FormSelect; 