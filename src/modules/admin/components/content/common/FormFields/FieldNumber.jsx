
/**
 * Campo para valores numéricos con controles min/max
 * @param {Object} props - Propiedades del componente
 * @param {string} props.name - Nombre del campo
 * @param {string} props.label - Etiqueta del campo
 * @param {number} props.value - Valor numérico actual
 * @param {Function} props.onChange - Función a llamar cuando cambia el valor
 * @param {number} [props.min] - Valor mínimo permitido
 * @param {number} [props.max] - Valor máximo permitido
 * @param {number} [props.step=1] - Incremento del paso
 * @param {string} [props.help] - Texto de ayuda
 * @param {boolean} [props.required] - Si el campo es obligatorio
 * @returns {JSX.Element}
 */
export const FieldNumber = ({
                              name,
                              label,
                              value = 0,
                              onChange,
                              min,
                              max,
                              step = 1,
                              help = '',
                              required = false,
                              disabled = false
                            }) => {
  // Función auxiliar para asegurar que el valor esté dentro de los límites
  const validateValue = (newValue) => {
    // Convertir a número
    let numValue = Number(newValue);

    // Validar que sea un número
    if (isNaN(numValue)) {
      return value;
    }

    // Aplicar restricciones min/max
    if (min !== undefined && numValue < min) {
      numValue = min;
    }
    if (max !== undefined && numValue > max) {
      numValue = max;
    }

    return numValue;
  };

  // Manejar cambio en el campo
  const handleChange = (e) => {
    const newValue = validateValue(e.target.value);
    onChange(newValue);
  };

  // Manejar incremento/decremento con botones
  const handleIncrement = () => {
    const newValue = validateValue(Number(value) + Number(step));
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = validateValue(Number(value) - Number(step));
    onChange(newValue);
  };

  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>

      <div className="input-group">
        {/* Botón para decrementar */}
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && value <= min)}
        >
          <i className="bi bi-dash"></i>
        </button>

        {/* Campo de entrada numérica */}
        <input
          type="number"
          className="form-control text-center"
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
        />

        {/* Botón para incrementar */}
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
        >
          <i className="bi bi-plus"></i>
        </button>
      </div>

      {/* Mensaje de ayuda */}
      {help && <div className="form-text text-muted small">{help}</div>}

      {/* Indicador de rango */}
      {(min !== undefined || max !== undefined) && (
        <div className="form-text small text-muted">
          Rango: {min !== undefined ? min : 'sin mínimo'} - {max !== undefined ? max : 'sin máximo'}
        </div>
      )}
    </div>
  );
};