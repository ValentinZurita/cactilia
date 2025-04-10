import { useCallback } from 'react';

/**
 * SearchBar component
 * @param {string} searchTerm - Current search term
 * @param {Function} setSearchTerm - Function to update the search term
 * @returns {JSX.Element}
 * @constructor
 * @example
 * <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
 */

export const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const handleInputChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);
  
  const handleButtonClick = useCallback(() => {
    // Si el campo está vacío, poner el foco en él
    const searchInput = document.querySelector('.search-bar-bg input');
    if (searchInput) {
      searchInput.focus();
    }
  }, []);
  
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      // Quitar el foco del input al presionar Enter
      e.target.blur();
    }
  }, []);

  return (
    <div className="search-bar-bg py-3 w-100 d-flex justify-content-center">
      <div className="input-group" style={{ maxWidth: "800px", width: "90%" }}>
        <input
          type="text"
          className="form-control border-0"
          placeholder="Buscar por nombre o categoría..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          aria-label="Buscar productos"
        />
        <button 
          className="btn btn-green" 
          onClick={handleButtonClick}
          aria-label="Iniciar búsqueda"
          style={{ cursor: 'default' }}
        >
          Buscar
        </button>
      </div>
    </div>
  );
};