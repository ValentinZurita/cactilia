import React, { useState, useCallback } from 'react';

/**
 * Componente SearchBar para envío explícito de búsqueda
 * @param {string} initialSearchTerm - Valor inicial para la barra de búsqueda (normalmente vacío)
 * @param {Function} onSearchSubmit - Función llamada cuando se envía la búsqueda (Enter o clic en botón)
 * @returns {JSX.Element}
 * @constructor
 */
export const SearchBar = ({ initialSearchTerm = "", onSearchSubmit }) => {
  // Estado para mantener el valor del input localmente
  const [inputValue, setInputValue] = useState(initialSearchTerm);

  const handleInputChange = useCallback((e) => {
    // Actualizar solo el estado local
    setInputValue(e.target.value);
  }, []);

  // Función para manejar el envío de la búsqueda
  const submitSearch = useCallback(() => {
    if (onSearchSubmit) {
      onSearchSubmit(inputValue);
      // Limpiar el input después del envío
      setInputValue(""); 
    }
     // Mantener lógica de foco para clic en botón
     const searchInput = document.querySelector('.search-bar-bg input');
     if (searchInput) {
       searchInput.focus();
     }
  }, [inputValue, onSearchSubmit]);
  
  const handleButtonClick = useCallback(() => {
    submitSearch();
  }, [submitSearch]);
  
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      submitSearch();
      e.target.blur(); // Mantener desenfoque al presionar Enter
    }
  }, [submitSearch]);

  return (
    <div className="search-bar-bg py-3 w-100 d-flex justify-content-center">
      <div className="input-group" style={{ maxWidth: "800px", width: "90%" }}>
        <input
          type="text"
          className="form-control border-0"
          placeholder="Buscar por nombre o categoría..."
          value={inputValue} // Controlado por estado local
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          aria-label="Buscar productos"
        />
        <button 
          className="btn btn-green" 
          onClick={handleButtonClick}
          aria-label="Iniciar búsqueda"
          // El estilo del cursor ya no es necesario
        >
          Buscar
        </button>
      </div>
    </div>
  );
};