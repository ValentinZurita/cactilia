import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SectionTitle } from '../components/shared';
import '../styles/orderDetail.css';
import { useOrders } from '../hooks/userOrders.js';

// Importar componentes compartidos
import {
  OrderOverview,
  OrderProductsList,
  OrderTotals,
  OrderAddressCard,
  OrderPaymentInfo,
  OrderNotes,
} from '../../shop/components/order-details';

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
    formatOrderDate
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
    <div className="order-detail-page">
      {/* Encabezado con botón de regreso */}
      <div className="d-flex align-items-center mb-4">
        <Link to="/profile/orders" className="btn-back me-3">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <SectionTitle title={`Pedido #${order.id}`} />
      </div>

      {/* Información general de la orden - Usando componente compartido */}
      <div className="order-info-card mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <OrderOverview
              orderId={order.id}
              orderDate={formatOrderDate(order.createdAt)}
              status={order.status}
              createdAt={order.createdAt}
              showTimeline={false} // No mostramos timeline aquí
            />
          </div>

          <div className="col-md-6 text-md-end mt-3 mt-md-0">
            <div className="order-status">
              <h5 className="mb-2">Estado del pedido</h5>
              <span className={`badge bg-${getStatusBadgeClass(order.status)}-subtle text-${getStatusBadgeClass(order.status)} order-status-badge`}>
                {getStatusIcon(order.status)}
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Productos - Usando componente compartido */}
      <div className="products-card mb-4">
        <h4 className="card-title mb-3">Productos</h4>
        <OrderProductsList items={order.items} />
      </div>

      {/* Dirección y desglose de costos */}
      <div className="row">
        {/* Dirección de envío - Usando componente compartido */}
        <div className="col-md-6 mb-4">
          <div className="address-card">
            <h4 className="card-title mb-3">Dirección de envío</h4>
            <OrderAddressCard
              address={order.shipping?.address}
              estimatedDelivery={order.shipping?.estimatedDelivery}
            />
          </div>
        </div>

        {/* Resumen de costos - Usando componente compartido */}
        <div className="col-md-6 mb-4">
          <div className="totals-card">
            <h4 className="card-title mb-3">Resumen</h4>
            <OrderTotals totals={order.totals} />

            {/* Información de facturación si aplica */}
            {order.billing?.requiresInvoice && (
              <div className="invoice-info mt-3">
                <OrderPaymentInfo
                  payment={order.payment}
                  billing={order.billing}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notas del pedido - Usando componente compartido */}
      <OrderNotes notes={order.notes} />

      {/* Acciones */}
      <div className="order-actions mt-4 mb-4">
        <Link to="/profile/orders" className="btn btn-outline-secondary me-2">
          <i className="bi bi-arrow-left me-1"></i>
          Volver a mis pedidos
        </Link>

        <Link to="/shop" className="btn btn-green-3">
          <i className="bi bi-shop me-1"></i>
          Continuar comprando
        </Link>
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