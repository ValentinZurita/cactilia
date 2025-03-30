import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/orderDetail.css';
import '../../shop/features/checkout/styles/orderSuccess.css';
import { useOrders } from '../hooks/userOrders.js';
import { OrderOverview } from '../../shop/features/order/component/OrderOverview.jsx'
import { OrderProductsList } from '../../shop/features/order/component/OrderProductsList.jsx'
import { OrderTotals } from '../../shop/features/order/component/OrderTotals.jsx'
import { OrderAddressCard } from '../../shop/features/order/component/OrderAddressCard.jsx'
import { OrderPaymentInfo } from '../../shop/features/order/component/OrderPaymentInfo.jsx'
import { OrderNotes } from '../../admin/components/orders/notes/OrderNotes.jsx'

// Import components from shop module


/**
 * OrderDetailPage - Página que muestra los detalles de una orden específica
 */
export const OrderDetailPage = () => {
  const { orderId } = useParams();
  const {
    order,
    orderLoading,
    orderError,
    fetchOrderById,
    formatOrderDate,
    mapOrderStatusToDisplay
  } = useOrders();

  // Cargar detalles de la orden cuando cambia el ID
  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  // Renderizar la página de carga
  if (orderLoading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando detalles del pedido...</span>
        </div>
        <p className="mt-3">Cargando detalles del pedido...</p>
      </div>
    );
  }

  // Renderizar error si existe
  if (orderError) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {orderError}
      </div>
    );
  }

  // Si no hay orden, mostrar mensaje
  if (!order) {
    return (
      <div className="alert alert-warning m-4" role="alert">
        <i className="bi bi-info-circle-fill me-2"></i>
        No se encontró el pedido solicitado.
      </div>
    );
  }

  return (
    <div className="order-success-page-wrapper">
      <div className="os-wrapper order-success-container">
        {/* Botón de regreso */}
        <div className="d-flex align-items-center mb-4">
          <Link to="/profile/orders" className="btn-back me-3">
            <i className="bi bi-arrow-left"></i>
          </Link>
        </div>

        {/* Información general de la orden */}
        <OrderOverview
          orderId={order.id}
          orderDate={formatOrderDate(order.createdAt)}
          status={order.status}
          createdAt={order.createdAt}
        />

        {/* Detalles de productos */}
        <div className="order-details-section">
          <h3>Productos</h3>
          <OrderProductsList items={order.items} />

          {/* Totales */}
          <OrderTotals totals={order.totals} />
        </div>

        {/* Dirección de Envío - Ahora en su propia fila */}
        <div className="order-details-section">
          <h3>Dirección de Envío</h3>
          <OrderAddressCard
            address={order.shipping?.address}
            estimatedDelivery={order.shipping?.estimatedDelivery}
          />
        </div>

        {/* Información de Pago - Ahora en su propia fila */}
        <div className="order-details-section">
          <h3>Información de Pago</h3>
          <OrderPaymentInfo
            payment={order.payment}
            billing={order.billing}
          />
        </div>

        {/* Notas del pedido */}
        <OrderNotes notes={order.notes} />

        {/* No action buttons needed */}
      </div>
    </div>
  );
};

/**
 * Obtener clase CSS para la badge de estado
 * @param {string} status Estado del pedido
 * @returns {string} Clase CSS
 */
const getStatusBadgeClass = (status) => {
  const displayStatus = mapOrderStatusToDisplay(status);
  const statusClasses = {
    'delivered': 'success',
    'processing': 'warning',
    'cancelled': 'danger'
  };

  return statusClasses[displayStatus] || 'info';
};

/**
 * Obtener icono para el estado del pedido
 * @param {string} status Estado del pedido
 * @returns {JSX.Element} Elemento de icono
 */
const getStatusIcon = (status) => {
  const displayStatus = mapOrderStatusToDisplay(status);

  if (displayStatus === 'delivered') {
    return <i className="bi bi-check-circle-fill me-1"></i>;
  } else if (displayStatus === 'processing') {
    return <i className="bi bi-clock-fill me-1"></i>;
  } else if (displayStatus === 'cancelled') {
    return <i className="bi bi-x-circle-fill me-1"></i>;
  }

  return null;
};

/**
 * Obtener etiqueta para el estado del pedido
 * @param {string} status Estado del pedido
 * @returns {string} Etiqueta traducida
 */
const getStatusLabel = (status) => {
  const displayStatus = mapOrderStatusToDisplay(status);

  if (displayStatus === 'delivered') {
    return 'Entregado';
  } else if (displayStatus === 'processing') {
    return 'En proceso';
  } else if (displayStatus === 'cancelled') {
    return 'Cancelado';
  }

  return status;
};

/**
 * Mapea el estado del pedido a un estado para mostrar
 * @param {string} status Estado del pedido
 * @returns {string} Estado para mostrar
 */
const mapOrderStatusToDisplay = (status) => {
  const statusMap = {
    'pending': 'processing',
    'payment_failed': 'cancelled',
    'processing': 'processing',
    'shipped': 'delivered',
    'delivered': 'delivered',
    'cancelled': 'cancelled',
    'completed': 'delivered'
  };

  return statusMap[status] || status;
};