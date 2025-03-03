/**
 * MediaFilters - Componente para filtrar elementos multimedia por categoría y término de búsqueda
 *
 * Proporciona una interfaz limpia y minimalista para aplicar filtros
 * a la biblioteca de medios, facilitando la búsqueda de archivos.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.filters - Estado actual de los filtros
 * @param {Function} props.onFilterChange - Manejador para cambios en los filtros
 * @param {Array} props.categories - Categorías disponibles para filtrar
 * @returns {JSX.Element}
 */
export const MediaFilters = ({ filters, onFilterChange, categories = [] }) => {
  // Manejador para cambio de categoría
  const handleCategoryChange = (e) => {
    onFilterChange({ category: e.target.value || null });
  };

  // Manejador para cambio en campo de búsqueda
  const handleSearchChange = (e) => {
    onFilterChange({ searchTerm: e.target.value });
  };

  return (
    <div className="media-filters mb-4">
      <div className="row g-3 align-items-end">
        {/* Campo de búsqueda */}
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small">Buscar archivos</label>
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Buscar por nombre, etiqueta..."
              value={filters.searchTerm || ''}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Filtro por categoría */}
        <div className="col-12 col-md-4">
          <label className="form-label text-muted small">Categoría</label>
          <select
            className="form-select form-select-sm"
            value={filters.category || ''}
            onChange={handleCategoryChange}
          >
            <option value="">Todas las categorías</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Botón para restablecer filtros */}
        <div className="col-12 col-md-2">
          <button
            className="btn btn-outline-secondary btn-sm w-100"
            onClick={() => onFilterChange({
              category: null,
              searchTerm: '',
              tags: []
            })}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
};