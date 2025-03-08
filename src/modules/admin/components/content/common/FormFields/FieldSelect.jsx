/**
 * Campo de selección desplegable
 * @param {Object} props - Propiedades del componente
 * @param {string} props.name - Nombre del campo
 * @param {string} props.label - Etiqueta del campo
 * @param {string|number} props.value - Valor seleccionado
 * @param {Function} props.onChange - Función a llamar cuando cambia el valor
 * @param {Array} props.options - Opciones para el select
 * @param {boolean} [props.required] - Si el campo es obligatorio
 * @param {string} [props.help] - Texto de ayuda
 * @returns {JSX.Element}
 */
export const FieldSelect = ({
                              name,
                              label,
                              value = '',
                              onChange,
                              options = [],
                              required = false,
                              help = '',
                              disabled = false
                            }) => {

  // Normalizar las opciones al formato [value, label]
  const normalizedOptions = options.map(option => {
    if (Array.isArray(option)) {
      return option;
    } else if (typeof option === 'object' && option.value !== undefined) {
      return [option.value, option.label || option.value];
    } else {
      return [option, option];
    }
  });

  return (
    <div className="mb-3">

      {/* Etiqueta del campo */}
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>

      {/* Campo de selección */}
      <select
        className="form-select"
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {/* Opción por defecto */}
        {normalizedOptions.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>

      {/* Texto de ayuda */}
      {help && <div className="form-text text-muted small">{help}</div>}

    </div>
  );
};