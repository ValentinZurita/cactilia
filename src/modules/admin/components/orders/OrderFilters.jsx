import { useState } from 'react'

/**
 * Componente para filtrar pedidos por estado, fecha y búsqueda
 * Con barra de búsqueda mejorada
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
    <div className="order-filters-container mb-4">
      {/* Filtros de estado con diseño en forma de tabs */}
      <div className="card border-0 shadow-sm mb-3 overflow-hidden">
        <div className="card-body p-0">
          <nav className="nav nav-tabs border-bottom">
            {filters.map(filter => (
              <button
                key={filter.id}
                className={`nav-link border-0 rounded-0 py-3 px-4 
                  ${activeFilter === filter.id ? `text-${filter.color} active` : 'text-secondary'}`}
                onClick={() => onFilterChange(filter.id)}
                style={{
                  borderBottom: activeFilter === filter.id ? `3px solid var(--bs-${filter.color})` : '3px solid transparent'
                }}
              >
                <i className={`bi bi-${filter.icon} me-2`}></i>
                <span>{filter.label}</span>
                {counts[filter.id] !== undefined && (
                  <span className={`ms-2 badge ${activeFilter === filter.id ? `bg-${filter.color}` : 'bg-light text-dark'}`}>
                    {counts[filter.id]}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Barra de búsqueda mejorada */}
      <form onSubmit={handleSearchSubmit} className="input-group shadow-sm rounded-pill overflow-hidden">
        <span className="input-group-text bg-white border-0">
          <i className="bi bi-search text-secondary"></i>
        </span>
        <input
          type="text"
          className="form-control border-0"
          placeholder="Buscar por ID, nombre de cliente, dirección..."
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
        <button className="btn btn-primary px-4" type="submit">
          <i className="bi bi-search me-2"></i>
          Buscar
        </button>
      </form>
    </div>
  );
};