/**
 * Componente de barra de búsqueda reutilizable
 * Versión final mejorada y compatible con la implementación existente
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.value - Valor actual del campo de búsqueda
 * @param {Function} props.onChange - Función a llamar cuando cambia el valor
 * @param {string} [props.placeholder="Buscar..."] - Texto de placeholder
 * @param {string} [props.className=""] - Clases adicionales para el contenedor
 * @param {string} [props.size="md"] - Tamaño: "sm", "md", "lg"
 * @param {boolean} [props.showSearchIcon=true] - Mostrar el ícono de búsqueda
 * @param {boolean} [props.showClearButton=true] - Mostrar el botón para limpiar
 * @param {Function} [props.onClear] - Función a llamar al limpiar (si no se proporciona, se usa onChange(""))
 * @returns {JSX.Element}
 */
export const SearchBar = ({
                            value,
                            onChange,
                            placeholder = "Buscar...",
                            className = "",
                            size = "md",
                            showSearchIcon = true,
                            showClearButton = true,
                            onClear
                          }) => {
  // Determinar tamaño de los elementos
  const getSizeClass = () => {
    switch (size) {
      case "sm": return "form-control-sm";
      case "lg": return "form-control-lg";
      default: return "";
    }
  };

  // Función para manejar el evento de limpiar
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange({ target: { value: "" } });
    }
  };

  // Manejar tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && showClearButton && value) {
      handleClear();
    }
  };

  return (
    <div className={`search-bar-container ${className}`}>


      <div className="input-group shadow-sm rounded-pill overflow-hidden">

        {/* Icono de búsqueda */}
        {showSearchIcon && (
          <span className="input-group-text bg-white border-0 me-3 ms-2">

            {/* texto e icono juntos*/}
            <i className="bi bi-search text-secondary"></i>
          </span>
        )}

        {/* Campo de entrada */}
        <input
          type="text"
          className={`form-control border-0 ${getSizeClass()}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
        />

        {/* Botón para limpiar */}
        {showClearButton && value && (
          <button
            className="btn btn-outline-secondary border-0 bg-white"
            onClick={handleClear}
            type="button"
            aria-label="Limpiar búsqueda"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>
    </div>
  );
};