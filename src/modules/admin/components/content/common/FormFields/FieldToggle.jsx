/**
 * Campo de tipo toggle/switch
 * @param {Object} props - Propiedades del componente
 * @param {string} props.name - Nombre del campo
 * @param {string} props.label - Etiqueta del campo
 * @param {boolean} props.checked - Estado del toggle
 * @param {Function} props.onChange - Función a llamar cuando cambia el valor
 * @param {string} [props.help] - Texto de ayuda
 * @returns {JSX.Element}
 */
export const FieldToggle = ({
                              name,
                              label,
                              checked = false,
                              onChange,
                              help = '',
                              disabled = false
                            }) => {
  return (
    // Campo de tipo toggle/switch
    <div className="mb-3">

      {/* Etiqueta del campo */}
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />

        {/* Etiqueta del campo */}
        <label className="form-check-label" htmlFor={name}>
          {label}
        </label>

      </div>

      {/* Texto de ayuda */}
      {help && <div className="form-text text-muted small">{help}</div>}

    </div>
  );
};