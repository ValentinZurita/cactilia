/**
 * Campo de texto reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {string} props.name - Nombre del campo
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.value - Valor del campo
 * @param {Function} props.onChange - Función a llamar cuando cambia el valor
 * @param {string} [props.placeholder] - Texto de placeholder
 * @param {boolean} [props.required] - Si el campo es obligatorio
 * @param {string} [props.help] - Texto de ayuda
 * @returns {JSX.Element}
 */
export const FieldText = ({
                            name,
                            label,
                            value = '',
                            onChange,
                            placeholder = '',
                            required = false,
                            help = '',
                            disabled = false
                          }) => {
  return (
    <div className="mb-3">

      {/* Etiqueta del campo */}
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>

      {/* Campo de texto */}
      <input
        type="text"
        className="form-control"
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        disabled={disabled}
      />

      {/* Texto de ayuda */}
      {help && <div className="form-text text-muted small">{help}</div>}

    </div>
  );
};