// ===============================
// src/modules/admin/components/orders/OrderFiltersSidebar.jsx
// ===============================
import React, { useState } from 'react';
import { ORDER_STATUS_CONFIG } from '../../constants/orderConstants';

/**
 * Componente para filtros de pedidos en sidebar
 * Con el diseño original que te gustaba
 */
export const OrderFiltersSidebar = ({
                                      activeFilter = 'all',
                                      onFilterChange,
                                      onSearch,
                                      searchTerm = '',
                                      counts = {},
                                      statistics = null,
                                      loading = false,
                                      formatPrice
                                    }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Definir filtros disponibles con diseño minimalista
  const filters = [
    { id: 'all', label: 'Todos los pedidos', icon: 'grid' },
    { id: 'pending', label: 'Pendientes', icon: 'hourglass-split' },
    { id: 'processing', label: 'Procesando', icon: 'gear' },
    { id: 'shipped', label: 'Enviados', icon: 'truck' },
    { id: 'delivered', label: 'Entregados', icon: 'check-circle' },
    { id: 'cancelled', label: 'Cancelados', icon: 'x-circle' }
  ];

  // Manejador para envío de búsqueda
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearchTerm);
  };

  return (
    <div className="card border-0 shadow-sm rounded-4">
      {/* Buscador elegante - Manteniendo tu diseño original */}
      <div className="card-body border-bottom pb-4">
        <form onSubmit={(e) => {
          e.preventDefault();
          onSearch(localSearchTerm);
        }}>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Buscar pedidos"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Filtros minimalistas - Tu diseño original */}
      <div className="list-group list-group-flush">
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`list-group-item list-group-item-action border-0 d-flex justify-content-between align-items-center px-4 py-3
              ${activeFilter === filter.id ? 'bg-light fw-medium' : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            <span className="d-flex align-items-center">
              <i className={`bi bi-${filter.icon} me-3 text-secondary`}></i>
              {filter.label}
            </span>
            {counts[filter.id] !== undefined && (
              <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill">
                {counts[filter.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Resumen minimalista - Manteniendo tu diseño original */}
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