import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { OrderFiltersSidebar } from './filters/OrderFiltersSidebar.jsx';
import { OrderDetailSkeleton } from './details/OrderDetailSkeleton.jsx';
import { Spinner } from '../../../../shared/components/spinner/Spinner.jsx';
import { addMessage } from '../../../../store/messages/messageSlice.js';

// Importar acciones y selectores de Redux
import { updateFilters, clearSelectedOrder, setActiveTab } from './slices/ordersSlice.js';
import {
  fetchOrders,
  fetchOrderById,
  updateOrderStatusThunk,
  addOrderNoteThunk,
  fetchOrderStatistics
} from './thunks/orderThunks.js';
import {
  selectOrders,
  selectOrdersLoading,
  selectHasMoreOrders,
  selectSelectedOrder,
  selectOrderDetailsLoading,
  selectActionProcessing,
  selectOrderStatistics,
  selectStatisticsLoading,
  selectOrderFilters, selectActiveTab,
} from './thunks/orderSelectors.js'

// Utilidades para formateo
import { formatOrderDate, formatPrice } from './utils/formatUtils.js';

// Lazy load OrderList and OrderDetail
const OrderList = lazy(() => 
  import('./list/OrderList.jsx')
    .then(module => ({ default: module.OrderList }))
);
const OrderDetail = lazy(() =>
  import('./details/OrderDetail.jsx')
    .then(module => ({ default: module.OrderDetail }))
);

/**
 * Página principal para la gestión de pedidos en el panel de administración
 * Versión refactorizada para usar Redux
 */
export const OrderManagementPage = () => {
  const { mode, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [advancedFilters, setAdvancedFilters] = useState({});
  const location = useLocation();

  // Obtener estado desde Redux
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrdersLoading);
  const hasMore = useSelector(selectHasMoreOrders);
  const selectedOrder = useSelector(selectSelectedOrder);
  const selectedOrderLoading = useSelector(selectOrderDetailsLoading);
  const isProcessing = useSelector(selectActionProcessing);
  const statistics = useSelector(selectOrderStatistics);
  const statsLoading = useSelector(selectStatisticsLoading);
  const filters = useSelector(selectOrderFilters);
  const activeTab = useSelector(selectActiveTab); // Añade esta línea aquí
  const { uid } = useSelector(state => state.auth);

  // Cargar estadísticas cuando se monta el componente
  useEffect(() => {
    dispatch(fetchOrderStatistics());
  }, [dispatch]);

  // Cargar pedidos cuando cambian los filtros
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch, filters]);

  // Obtener detalles del pedido si estamos en modo detalle
  useEffect(() => {
    if (mode === 'view' && id) {
      dispatch(fetchOrderById(id));
    } else if (mode !== 'view') {
      // Limpiar el pedido seleccionado si no estamos en vista detalle
      dispatch(clearSelectedOrder());
    }
  }, [mode, id, dispatch]);

  // Manejar la vista en detalle
  useEffect(() => {
    if (mode === 'view' && id) {
      dispatch(fetchOrderById(id));

      // Obtener la pestaña de la URL si existe
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');

      if (tab && ['products', 'customer', 'payment', 'workflow', 'status', 'notes'].includes(tab)) {
        dispatch(setActiveTab(tab));
      }
    } else if (mode !== 'view') {
      // Limpiar el pedido seleccionado si no estamos en vista detalle
      dispatch(clearSelectedOrder());
    }
  }, [mode, id, dispatch, location.search]);


  // Modificar la función handleViewDetail para incluir la pestaña actual
  const handleViewDetail = (orderId) => {
    navigate(`/admin/orders/view/${orderId}?tab=${activeTab}`);
  };

  // Manejador para cambiar el filtro de estado
  const handleFilterChange = (status) => {
    dispatch(updateFilters({ status }));
  };

  // Manejador para la búsqueda
  const handleSearch = (term) => {
    dispatch(updateFilters({ searchTerm: term }));
  };

  // Manejador para volver a la lista
  const handleBackToList = () => {
    navigate('/admin/orders/view');
  };

  // Manejador para cambiar el estado de un pedido
  const handleChangeStatus = async (status, notes) => {
    if (id && uid) {
      await dispatch(updateOrderStatusThunk({
        orderId: id,
        newStatus: status,
        adminId: uid,
        notes
      }));
    }
  };

  // Manejador para añadir una nota a un pedido
  const handleAddNote = async (note) => {
    if (id && uid) {
      await dispatch(addOrderNoteThunk({
        orderId: id,
        noteText: note,
        adminId: uid
      }));
    }
  };

  // Manejador para actualizar los datos del pedido después de subir una factura
  const handleOrderUpdate = async () => {
    if (id) {
      await dispatch(fetchOrderById(id));

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
    dispatch(updateFilters({ advancedFilters: filters }));
  };

  // Cargar más pedidos (paginación)
  const loadMoreOrders = () => {
    if (hasMore && !loading) {
      console.log('Cargando más pedidos...');
      // Pasar explícitamente append: true y asegurarnos de que no sea undefined
      dispatch(fetchOrders({ append: true }));
    }
  };

  // Renderizar vista detallada de un pedido
  const renderDetailView = () => {
    // Nota: La lógica de carga para selectedOrder ya existe, 
    // pero envolvemos en Suspense por si el componente OrderDetail tarda en cargarse
    return (
      <Suspense fallback={<OrderDetailSkeleton />}>
        <OrderDetail
          order={selectedOrder}
          onBack={handleBackToList}
          onChangeStatus={handleChangeStatus}
          onAddNote={handleAddNote}
          onOrderUpdate={handleOrderUpdate}
          formatPrice={formatPrice}
          formatDate={formatOrderDate}
          isProcessing={isProcessing}
        />
      </Suspense>
    );
  };

  // Renderizar lista de pedidos
  const renderListView = () => {
    return (
      <div className="order-management-container">
        {/* Layout de dos columnas para pantallas grandes */}
        <div className="row g-4">
          {/* Columna lateral con sidebar elegante */}
          <div className="col-lg-3">
            <div className="sticky-lg-top" style={{ top: '1rem', zIndex: 100 }}>
              <OrderFiltersSidebar
                stats={statistics}
                statsLoading={statsLoading}
                currentFilter={filters.status || 'all'}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onAdvancedSearch={handleAdvancedSearch}
                formatPrice={formatPrice}
                searchTerm={filters.searchTerm}
                counts={statistics ? {
                  all: statistics.totalOrders,
                  pending: statistics.pendingOrders,
                  processing: statistics.processingOrders,
                  shipped: statistics.shippedOrders,
                  delivered: statistics.deliveredOrders,
                  cancelled: statistics.cancelledOrders
                } : {}}
                loading={statsLoading}
                advancedFilters={advancedFilters}
              />
            </div>
          </div>

          {/* Contenido principal - Lista de pedidos */}
          <div className="col-lg-9">
            <Suspense fallback={<div className="text-center p-5"><Spinner /></div>}> 
              <OrderList
                orders={orders}
                loading={loading}
                hasMore={hasMore}
                loadMore={loadMoreOrders}
                onViewDetail={handleViewDetail}
                formatDate={formatOrderDate}
                formatPrice={formatPrice}
              />
            </Suspense>
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