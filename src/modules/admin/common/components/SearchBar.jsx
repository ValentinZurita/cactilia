import React from 'react';

/**
 * Componente reutilizable para una barra de búsqueda con icono y botón de limpiar.
 * @param {{ 
 *   searchTerm: string, 
 *   onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void, 
 *   onClearSearch: () => void,
 *   placeholder?: string,
 *   className?: string // Para permitir estilos adicionales como flex-grow-1
 * }} props
 */
export const SearchBar = ({ 
  searchTerm,
  onSearchChange,
  onClearSearch,
  placeholder = "Buscar...",
  className = "" // Valor por defecto para className
}) => {
  return (
    // Aplicar clases pasadas externamente (e.g., flex-grow-1)
    <div className={`input-group ${className}`}> 
      <span className="input-group-text bg-white border-end-0">
        <i className="bi bi-search text-muted"></i>
      </span>
      <input
        type="text"
        className="form-control border-start-0"
        placeholder={placeholder}
        value={searchTerm}
        onChange={onSearchChange}
        aria-label={placeholder}
      />
      {/* Mostrar botón de limpiar solo si hay término de búsqueda */} 
      {searchTerm && (
        <button
          className="btn btn-outline-secondary border-start-0"
          type="button"
          onClick={onClearSearch}
          aria-label="Limpiar búsqueda"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      )}
    </div>
  );
}; 