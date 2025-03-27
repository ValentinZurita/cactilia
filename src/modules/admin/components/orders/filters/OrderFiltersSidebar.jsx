import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SearchFilters } from './SearchFilters.jsx';
import { updateFilters } from '../slices/ordersSlice.js';
import {
  selectOrderFilters,
  selectStatisticsWithCounts,
  selectStatisticsLoading,
} from '../thunks/orderSelectors.js';

/**
 * Componente de sidebar con búsqueda y filtros avanzados
 * Versión adaptada para usar Redux
 */
export const OrderFiltersSidebar = ({ formatPrice }) => {
  const dispatch = useDispatch();

  // Obtener el estado de Redux
  const filters = useSelector(selectOrderFilters);
  const statistics = useSelector(selectStatisticsWithCounts);
  const loading = useSelector(selectStatisticsLoading);

  // Estado local para manejar la entrada del usuario
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Verificar si hay filtros avanzados activos
  const hasActiveFilters = Object.values(filters.advancedFilters || {}).some(val =>
    val !== null && val !== undefined && val !== ''
  );

  // Definir filtros disponibles con diseño minimalista
  const filterOptions = [
    { id: 'all', label: 'Todos los pedidos', icon: 'grid', color: 'secondary' },
    { id: 'pending', label: 'Pendientes', icon: 'hourglass-split', color: 'warning' },
    { id: 'processing', label: 'Procesando', icon: 'gear', color: 'primary' },
    { id: 'shipped', label: 'Enviados', icon: 'truck', color: 'info' },
    { id: 'delivered', label: 'Entregados', icon: 'check-circle', color: 'success' },
    { id: 'cancelled', label: 'Cancelados', icon: 'x-circle', color: 'danger' }
  ];

  // Manejador para cambio de filtro de estado
  const handleFilterChange = (status) => {
    dispatch(updateFilters({ status }));
  };

  // Manejador para envío de búsqueda básica
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(updateFilters({ searchTerm: localSearchTerm }));
  };

  // Manejador para aplicar filtros avanzados
  const handleApplyAdvancedFilters = (advancedFilters) => {
    dispatch(updateFilters({ advancedFilters }));
  };

  // Manejador para limpiar filtros avanzados
  const handleClearAdvancedFilters = () => {
    dispatch(updateFilters({ advancedFilters: {} }));
  };

  return (
    <div className="card border-0 shadow-sm rounded-4">
      {/* Buscador con toggle para búsqueda avanzada */}
      <div className="card-body border-bottom pb-3">
        <form onSubmit={handleSearchSubmit}>
          <div className="input-group mb-2">
            {/* Icono de búsqueda */}
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>

            {/* Input de búsqueda */}
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Buscar pedidos"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>

          {/* Botón para filtros avanzados */}
          <button
            type="button"
            className={`btn btn-sm p-0 ${hasActiveFilters ? 'text-primary' : 'text-secondary'}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {/* Icono de embudo con indicador de filtros activos */}
            <i className={`bi bi-funnel${hasActiveFilters ? '-fill' : ''} me-2`}></i>

            {/* Texto de botón */}
            Filtros avanzados

            {/* Flecha de colapso */}
            <i className={`bi bi-chevron-${showAdvanced ? 'up' : 'down'} ms-2`}></i>
          </button>
        </form>
      </div>

      {/* Filtros avanzados colapsables */}
      {showAdvanced && (
        <SearchFilters
          onApplyFilters={handleApplyAdvancedFilters}
          onClear={handleClearAdvancedFilters}
          initialFilters={filters.advancedFilters || {}}
        />
      )}

      {/* Filtros por estado */}
      <div className="list-group list-group-flush">
        {filterOptions.map(filter => (
          <button
            key={filter.id}
            className={`list-group-item list-group-item-action border-0 d-flex justify-content-between align-items-center px-4 py-3
              ${filters.status === filter.id ? 'bg-light fw-medium' : ''}`}
            onClick={() => handleFilterChange(filter.id)}
          >
            {/* Icono y etiqueta del filtro */}
            <span className="d-flex align-items-center">
              <i className={`bi bi-${filter.icon} me-3 text-secondary`}></i>
              {filter.label}
            </span>

            {/* Conteo de pedidos */}
            {statistics?.counts && statistics.counts[filter.id] !== undefined && (
              <span className={`badge ${
                filters.status === filter.id ?
                  `bg-${filter.color} text-white` :
                  'bg-secondary bg-opacity-10 text-secondary'
              } rounded-pill`}>
                {statistics.counts[filter.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Resumen de estadísticas */}
      {!loading && statistics && (
        <div className="card-body border-top pt-4">
          <h6 className="text-uppercase text-secondary small fw-bold mb-3">Resumen</h6>
          <div className="row g-3">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="text-muted small">Pedidos hoy</div>
                <div className="fw-medium">{statistics.todaysOrders || 0}</div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted small">Ventas hoy</div>
                <div className="fw-medium">{formatPrice(statistics.todaysRevenue || 0)}</div>
              </div>
            </div>
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted small">Total ventas</div>
                <div className="fw-medium">{formatPrice(statistics.totalRevenue || 0)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};