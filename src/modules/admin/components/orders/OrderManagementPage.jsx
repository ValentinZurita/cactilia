import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  OrderList,
  OrderDetail,
  OrderFilters,
  OrderStats
} from './index.js';
import { useAdminOrders } from './useAdminOrders.js'

/**
 * Página principal para la gestión de pedidos en el panel de administración
 * Con diseño elegante y minimalista
 */
export const OrderManagementPage = () => {
  const { mode, id } = useParams();
  const navigate = useNavigate();
  const [countByStatus, setCountByStatus] = useState({});

  // Usar el hook personalizado para gestionar pedidos
  const {
    orders,
    loading,
    filters,
    hasMore,
    selectedOrder,
    selectedOrderLoading,
    isProcessing,
    statistics,
    statsLoading,
    updateFilters,
    loadMoreOrders,
    fetchOrderById,
    changeOrderStatus,
    addNote,
    loadStatistics,
    formatOrderDate,
    formatPrice
  } = useAdminOrders();

  // Cargar estadísticas cuando se monta el componente
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Obtener detalles del pedido si estamos en modo detalle
  useEffect(() => {
    if (mode === 'view' && id) {
      fetchOrderById(id);
    }
  }, [mode, id, fetchOrderById]);

  // Actualizar conteo por estado para los filtros
  useEffect(() => {
    if (statistics) {
      setCountByStatus({
        all: statistics.totalOrders,
        pending: statistics.pendingOrders,
        processing: statistics.processingOrders,
        shipped: statistics.shippedOrders,
        delivered: statistics.deliveredOrders,
        cancelled: statistics.cancelledOrders
      });
    }
  }, [statistics]);

  // Manejador para cambiar el filtro de estado
  const handleFilterChange = (status) => {
    updateFilters({ status });
  };

  // Manejador para la búsqueda
  const handleSearch = (term) => {
    updateFilters({ searchTerm: term });
  };

  // Manejador para ver detalles de un pedido
  const handleViewDetail = (orderId) => {
    navigate(`/admin/orders/view/${orderId}`);
  };

  // Manejador para volver a la lista
  const handleBackToList = () => {
    navigate('/admin/orders/view');
  };

  // Manejador para cambiar el estado de un pedido
  const handleChangeStatus = async (orderId, status, notes) => {
    await changeOrderStatus(orderId, status, notes);
  };

  // Manejador para añadir una nota a un pedido
  const handleAddNote = async (orderId, note) => {
    await addNote(orderId, note);
  };

  // Renderizar vista detallada de un pedido
  const renderDetailView = () => {
    if (selectedOrderLoading) {
      return (
        <div className="text-center p-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando detalles del pedido...</p>
        </div>
      );
    }

    return (
      <OrderDetail
        order={selectedOrder}
        onBack={handleBackToList}
        onChangeStatus={(status, notes) => handleChangeStatus(id, status, notes)}
        onAddNote={(note) => handleAddNote(id, note)}
        formatPrice={formatPrice}
        formatDate={formatOrderDate}
        isProcessing={isProcessing}
      />
    );
  };

  // Renderizar el sidebar elegante
  const renderSidebar = () => {
    // Definir filtros disponibles con diseño minimalista
    const filters = [
      { id: 'all', label: 'Todos los pedidos', icon: 'grid' },
      { id: 'pending', label: 'Pendientes', icon: 'hourglass-split' },
      { id: 'processing', label: 'Procesando', icon: 'gear' },
      { id: 'shipped', label: 'Enviados', icon: 'truck' },
      { id: 'delivered', label: 'Entregados', icon: 'check-circle' },
      { id: 'cancelled', label: 'Cancelados', icon: 'x-circle' }
    ];

    return (
      <div className="card border-0 shadow-sm rounded-4">
        {/* Buscador elegante */}
        <div className="card-body border-bottom pb-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSearch(e.target.elements.searchTerm.value);
          }}>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Buscar pedidos"
                name="searchTerm"
                defaultValue={filters.searchTerm}
              />
            </div>
          </form>
        </div>

        {/* Filtros minimalistas */}
        <div className="list-group list-group-flush">
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`list-group-item list-group-item-action border-0 d-flex justify-content-between align-items-center px-4 py-3
                ${activeFilter === filter.id ? 'bg-light fw-medium' : ''}`}
              onClick={() => handleFilterChange(filter.id)}
            >
              <span className="d-flex align-items-center">
                <i className={`bi bi-${filter.icon} me-3 text-secondary`}></i>
                {filter.label}
              </span>
              {countByStatus[filter.id] !== undefined && (
                <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill">
                  {countByStatus[filter.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Resumen minimalista */}
        {!statsLoading && statistics && (
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

  // Variables para controlar el estado activo de los filtros
  const activeFilter = filters.status;

  // Renderizar lista de pedidos con estructura elegante
  const renderListView = () => {
    return (
      <div className="order-management-container">
        {/* Layout de dos columnas para pantallas grandes */}
        <div className="row g-4">
          {/* Columna lateral con sidebar elegante */}
          <div className="col-lg-3">
            <div className="sticky-lg-top" style={{ top: '1rem', zIndex: 100 }}>
              {renderSidebar()}
            </div>
          </div>

          {/* Columna principal con la lista de pedidos - Sin título */}
          <div className="col-lg-9">
            <OrderList
              orders={orders}
              loading={loading}
              onViewDetail={handleViewDetail}
              formatPrice={formatPrice}
              formatDate={formatOrderDate}
              hasMore={hasMore}
              onLoadMore={loadMoreOrders}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="order-management-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="page-title fw-medium mb-0">
          {mode === 'view' && id ? 'Detalle de Pedido' : 'Gestión de Pedidos'}
        </h3>

        {mode === 'view' && id && (
          <button
            className="btn btn-outline-secondary rounded-3"
            onClick={handleBackToList}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Volver a la lista
          </button>
        )}
      </div>

      {mode === 'view' && id ? renderDetailView() : renderListView()}
    </div>
  );
};