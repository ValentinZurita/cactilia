import React from 'react';
import PropTypes from 'prop-types';

/**
 * Barra de búsqueda para filtrar reglas de envío
 * @param {string} value - Valor actual de búsqueda
 * @param {function} onChange - Función para manejar cambios
 * @param {string} placeholder - Texto de placeholder
 */
const SearchBar = ({ 
  value = '',
  onChange,
  placeholder = 'Buscar por zona...'
}) => {
  // Manejar cambios en el input
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };
  
  // Limpiar búsqueda
  const handleClear = () => {
    onChange?.('');
  };
  
  return (
    <div className="shipping-search-bar mb-4">
      <div className="input-group">
        <span className="input-group-text bg-white border-end-0">
          <i className="bi bi-search text-muted"></i>
        </span>
        <input
          type="text"
          className="form-control border-start-0"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          aria-label="Buscar reglas de envío"
        />
        {value && (
          <button
            className="btn btn-outline-secondary border-start-0"
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
          >
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>
    </div>
  );
};

SearchBar.propTypes = {
  /** Valor actual de búsqueda */
  value: PropTypes.string,
  /** Función para manejar cambios */
  onChange: PropTypes.func.isRequired,
  /** Texto de placeholder */
  placeholder: PropTypes.string
};

export default SearchBar; 