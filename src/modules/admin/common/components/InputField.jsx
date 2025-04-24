import React from 'react';
import PropTypes from 'prop-types';

/**
 * @component InputField
 * @description Componente compartido para renderizar un campo de formulario Bootstrap estándar dentro del admin.
 * Encapsula la estructura label, input/textarea y small (texto de ayuda).
 */
export const InputField = ({ id, name, label, value, onChange, type = 'text', placeholder = '', helpText = '', required = false, colWidth = 'col-md-6', isTextArea = false, rows = 3 }) => (
  <div className={colWidth}>
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {isTextArea ? (
        <textarea
          className="form-control"
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
        />
      ) : (
        <input
          type={type}
          className="form-control"
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
      {helpText && <small className="form-text text-muted">{helpText}</small>}
    </div>
  </div>
);

// Prop types para InputField
InputField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  helpText: PropTypes.string,
  required: PropTypes.bool,
  colWidth: PropTypes.string,
  isTextArea: PropTypes.bool,
  rows: PropTypes.number
}; 