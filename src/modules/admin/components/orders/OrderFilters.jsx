import { useState } from 'react'

/**
 * Componente para filtrar pedidos por estado, fecha y búsqueda
 *
 * @param {Object} props
 * @param {string} props.activeFilter - Filtro activo actualmente
 * @param {Function} props.onFilterChange - Función para cambiar el filtro
 * @param {Function} props.onSearch - Función para buscar
 * @param {string} props.searchTerm - Término de búsqueda actual
 * @param {Object} props.counts - Conteo de pedidos por estado
 */
export const OrderFilters = ({
                               activeFilter = 'all',
                               onFilterChange,
                               onSearch,
                               searchTerm = '',
                               counts = {}
                             }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Definir filtros disponibles
  const filters = [
    { id: 'all', label: 'Todos', icon: 'grid-fill', color: 'secondary' },
    { id: 'pending', label: 'Pendientes', icon: 'hourglass-split', color: 'warning' },
    { id: 'processing', label: 'Procesando', icon: 'gear', color: 'primary' },
    { id: 'shipped', label: 'Enviados', icon: 'truck', color: 'info' },
    { id: 'delivered', label: 'Entregados', icon: 'check-circle-fill', color: 'success' },
    { id: 'cancelled', label: 'Cancelados', icon: 'x-circle-fill', color: 'danger' }
  ];

  // Manejar cambio de búsqueda
  const handleSearchChange = (e) => {
    setLocalSearchTerm(e.target.value);
  };

  // Manejar envío de búsqueda
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearchTerm);
  };

  // Manejar limpieza de búsqueda
  const clearSearch = () => {
    setLocalSearchTerm('');
    onSearch('');
  };

  return (
    <div className="order-filters-container mb-4">
      {/* Filtros de estado */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`btn ${activeFilter === filter.id
              ? `btn-${filter.color}`
              : `btn-outline-${filter.color}`}`}
            onClick={() => onFilterChange(filter.id)}
          >
            <i className={`bi bi-${filter.icon} me-2`}></i>
            {filter.label}
            {counts[filter.id] !== undefined && (
              <span className="ms-2 badge bg-light text-dark">
                {counts[filter.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Barra de búsqueda */}
      <form onSubmit={handleSearchSubmit} className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por ID, nombre de cliente, dirección..."
          value={localSearchTerm}
          onChange={handleSearchChange}
        />
        {localSearchTerm && (
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={clearSearch}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
        <button className="btn btn-primary" type="submit">
          <i className="bi bi-search me-1"></i>
          Buscar
        </button>
      </form>
    </div>
  );
};