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
 * Maneja la lista de pedidos, filtros, y vista detallada
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
    console.log('OrderManagementPage: Cambiando estado del pedido', orderId, 'a', status);

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
          <div className="spinner-border text-primary" role="status">
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

  // Renderizar lista de pedidos
  const renderListView = () => {
    return (
      <>
        {/* Estadísticas */}
        <OrderStats
          stats={statistics}
          loading={statsLoading}
        />

        {/* Filtros */}
        <OrderFilters
          activeFilter={filters.status}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          searchTerm={filters.searchTerm}
          counts={countByStatus}
        />

        {/* Lista de pedidos */}
        <OrderList
          orders={orders}
          loading={loading}
          onViewDetail={handleViewDetail}
          formatPrice={formatPrice}
          formatDate={formatOrderDate}
          hasMore={hasMore}
          onLoadMore={loadMoreOrders}
        />
      </>
    );
  };

  return (
    <div className="order-management-page">
      <h2 className="page-title mb-4">Gestión de Pedidos</h2>

      {mode === 'view' && id ? renderDetailView() : renderListView()}
    </div>
  );
};