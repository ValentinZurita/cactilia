import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para renderizar un campo de formulario con etiqueta y mensaje de error
 * @param {string} id - ID único del campo
 * @param {string} label - Etiqueta del campo
 * @param {node} children - Contenido del campo (input, select, etc.)
 * @param {string} error - Mensaje de error (opcional)
 * @param {string} helpText - Texto de ayuda (opcional)
 * @param {boolean} required - Si el campo es obligatorio
 */
const FormField = ({
  id,
  label,
  children,
  error,
  helpText,
  required = false,
  className = ''
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      
      {children}
      
      {helpText && (
        <div className="form-text small text-muted">{helpText}</div>
      )}
      
      {error && (
        <div className="invalid-feedback d-block">
          <i className="bi bi-exclamation-triangle-fill me-1"></i>
          {error}
        </div>
      )}
    </div>
  );
};

FormField.propTypes = {
  /** ID único del campo */
  id: PropTypes.string.isRequired,
  /** Etiqueta del campo */
  label: PropTypes.string,
  /** Contenido del campo (input, select, etc.) */
  children: PropTypes.node.isRequired,
  /** Mensaje de error */
  error: PropTypes.string,
  /** Texto de ayuda */
  helpText: PropTypes.string,
  /** Si el campo es obligatorio */
  required: PropTypes.bool,
  /** Clases adicionales */
  className: PropTypes.string
};

export default FormField; 