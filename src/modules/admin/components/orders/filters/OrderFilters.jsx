import { useState } from 'react'

/**
 * Componente para filtrar pedidos por estado, fecha y búsqueda
 * Con diseño optimizado para sidebar
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

  // Definir filtros disponibles con configuración mejorada
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
    <div className="order-filters-container">
      {/* Barra de búsqueda mejorada */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="input-group shadow-sm rounded-pill overflow-hidden">
          <span className="input-group-text bg-white border-0">
            <i className="bi bi-search text-secondary"></i>
          </span>
          <input
            type="text"
            className="form-control border-0"
            placeholder="Buscar pedidos..."
            value={localSearchTerm}
            onChange={handleSearchChange}
          />
          {localSearchTerm && (
            <button
              className="btn border-0 bg-white"
              type="button"
              onClick={clearSearch}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
          <button className="btn btn-primary" type="submit">
            Buscar
          </button>
        </div>
      </form>

      {/* Filtros de estado en forma de lista vertical para sidebar */}
      <div className="list-group shadow-sm rounded-4 overflow-hidden">
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`list-group-item list-group-item-action border-0 d-flex justify-content-between align-items-center py-3
              ${activeFilter === filter.id ? `active bg-${filter.color} text-white` : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            <span className="d-flex align-items-center">
              <i className={`bi bi-${filter.icon} me-3`}></i>
              {filter.label}
            </span>
            {counts[filter.id] !== undefined && (
              <span className={`badge ${activeFilter === filter.id ? 'bg-white text-' + filter.color : 'bg-light text-dark'} rounded-pill`}>
                {counts[filter.id]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};