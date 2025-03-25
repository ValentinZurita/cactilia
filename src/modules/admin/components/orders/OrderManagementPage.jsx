import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { OrderList } from './OrderList';
import { OrderDetail } from './OrderDetail';
import { OrderFiltersSidebar } from './OrderFiltersSidebar';
import { OrderDetailSkeleton } from './OrderDetailSkeleton';
import { useAdminOrders } from './useAdminOrders.js';
import { addMessage } from '../../../../store/messages/messageSlice.js';

/**
 * Página principal para la gestión de pedidos en el panel de administración
 * Con la sidebar que te gustaba
 */
export const OrderManagementPage = () => {
  const { mode, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [advancedFilters, setAdvancedFilters] = useState({});

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
  const handleChangeStatus = async (status, notes) => {
    if (id) {
      await changeOrderStatus(id, status, notes);
    }
  };

  // Manejador para añadir una nota a un pedido
  const handleAddNote = async (note) => {
    if (id) {
      await addNote(id, note);
    }
  };

  // Manejador para actualizar los datos del pedido después de subir una factura
  const handleOrderUpdate = async () => {
    if (id) {
      await fetchOrderById(id);

      // Mostrar un mensaje de éxito
      dispatch(addMessage({
        type: 'success',
        text: 'Factura actualizada correctamente',
        autoHide: true,
        duration: 3000
      }));
    }
  };

  // Manejador para la búsqueda avanzada
  const handleAdvancedSearch = (filters) => {
    setAdvancedFilters(filters);
    updateFilters({ advancedFilters: filters });
  };

  // Renderizar vista detallada de un pedido
  const renderDetailView = () => {
    if (selectedOrderLoading) {
      return <OrderDetailSkeleton />;
    }

    return (
      <OrderDetail
        order={selectedOrder}
        onBack={handleBackToList}
        onChangeStatus={handleChangeStatus}
        onAddNote={handleAddNote}
        onOrderUpdate={handleOrderUpdate} // Añadimos la función de actualización
        formatPrice={formatPrice}
        formatDate={formatOrderDate}
        isProcessing={isProcessing}
      />
    );
  };

  // Renderizar lista de pedidos con estructura elegante y MANTENIENDO TU SIDEBAR ORIGINAL
  const renderListView = () => {
    return (
      <div className="order-management-container">
        {/* Layout de dos columnas para pantallas grandes */}
        <div className="row g-4">
          {/* Columna lateral con sidebar elegante - DISEÑO ORIGINAL */}
          <div className="col-lg-3">
            <div className="sticky-lg-top" style={{ top: '1rem', zIndex: 100 }}>
              <OrderFiltersSidebar
                activeFilter={filters.status}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                searchTerm={filters.searchTerm}
                counts={statistics ? {
                  all: statistics.totalOrders,
                  pending: statistics.pendingOrders,
                  processing: statistics.processingOrders,
                  shipped: statistics.shippedOrders,
                  delivered: statistics.deliveredOrders,
                  cancelled: statistics.cancelledOrders
                } : {}}
                statistics={statistics}
                loading={statsLoading}
                formatPrice={formatPrice}
                onAdvancedSearch={handleAdvancedSearch}
                advancedFilters={advancedFilters}
              />
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