import PropTypes from 'prop-types';

/**
 * Campo de formulario reutilizable con manejo de errores y ayuda
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.id - ID único del campo
 * @param {string} props.name - Nombre del campo (para formularios)
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.type - Tipo de input (text, email, select, etc.)
 * @param {string} props.value - Valor actual del campo
 * @param {Function} props.onChange - Función al cambiar el valor
 * @param {Function} props.onBlur - Función al perder el foco (opcional)
 * @param {string} props.placeholder - Texto de placeholder
 * @param {string} props.error - Mensaje de error (opcional)
 * @param {string} props.helpText - Texto de ayuda (opcional)
 * @param {boolean} props.required - Si el campo es requerido
 * @param {React.ReactNode} props.children - Para tipo select (opciones)
 * @param {Object} props.rest - Propiedades adicionales para el input
 * @param {string} props.infoText - Texto para el tooltip de información (opcional)
 * @returns {JSX.Element}
 */
export const FormField = ({
                            id,
                            name,
                            label,
                            type = 'text',
                            value,
                            onChange,
                            onBlur,
                            placeholder,
                            error,
                            helpText,
                            infoText,
                            required = false,
                            children,
                            ...rest
                          }) => {
  const isInvalid = !!error;
  const inputClasses = `form-control ${isInvalid ? 'is-invalid' : ''}`;
  const selectClasses = `form-select ${isInvalid ? 'is-invalid' : ''}`;

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={id} className="form-label d-flex align-items-center">
          <span>{label}{required && <span className="text-danger ms-1">*</span>}</span>
          {infoText && (
            <span 
              className="ms-2 text-secondary" 
              style={{ cursor: 'help' }} 
              data-bs-toggle="tooltip" 
              data-bs-placement="top" 
              data-bs-title={infoText}
            >
              <i className="bi bi-info-circle"></i>
            </span>
          )}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={id}
          name={name}
          className={selectClasses}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          {...rest}
        >
          {children}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          className={inputClasses}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          {...rest}
        ></textarea>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          className={inputClasses}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          {...rest}
        />
      )}

      {error && <div className="invalid-feedback">{error}</div>}
      {helpText && !infoText && <small className="form-text text-muted">{helpText}</small>}
    </div>
  );
};

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helpText: PropTypes.string,
  infoText: PropTypes.string,
  required: PropTypes.bool,
  children: PropTypes.node
};