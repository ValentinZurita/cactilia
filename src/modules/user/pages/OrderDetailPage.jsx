import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SectionTitle } from '../components/shared';
import { formatPrice } from '../../shop/utils/cartUtilis';
import '../styles/orderDetail.css';
import { useOrders } from '../hooks/userOrders.js'

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
    mapOrderStatusToDisplay,
    formatOrderDate
  } = useOrders();

  // Cargar detalles de la orden cuando cambia el ID
  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  // Formatear el estado de la orden para mostrar en un badge
  const getStatusBadge = (status) => {
    const displayStatus = mapOrderStatusToDisplay(status);
    const statusClasses = {
      'delivered': 'success',
      'processing': 'warning',
      'cancelled': 'danger'
    };

    const statusClass = statusClasses[displayStatus] || 'info';

    return (
      <span className={`badge bg-${statusClass}-subtle text-${statusClass} order-status-badge`}>
        {displayStatus === 'delivered' && <i className="bi bi-check-circle-fill me-1"></i>}
        {displayStatus === 'processing' && <i className="bi bi-clock-fill me-1"></i>}
        {displayStatus === 'cancelled' && <i className="bi bi-x-circle-fill me-1"></i>}

        {displayStatus === 'delivered' && 'Entregado'}
        {displayStatus === 'processing' && 'En proceso'}
        {displayStatus === 'cancelled' && 'Cancelado'}
      </span>
    );
  };

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

      {/* Información general de la orden */}
      <div className="order-info-card mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="order-meta">
              <div className="info-item">
                <i className="bi bi-calendar3 me-2"></i>
                <span className="label">Fecha del pedido:</span>
                <span className="value">{formatOrderDate(order.createdAt)}</span>
              </div>

              <div className="info-item">
                <i className="bi bi-truck me-2"></i>
                <span className="label">Envío:</span>
                <span className="value">
                  {order.shipping?.estimatedDelivery
                    ? `Entrega estimada: ${order.shipping.estimatedDelivery}`
                    : 'Estándar'
                  }
                </span>
              </div>

              <div className="info-item">
                <i className="bi bi-credit-card me-2"></i>
                <span className="label">Pago:</span>
                <span className="value">
                  {order.payment?.method?.brand
                    ? `${order.payment.method.brand.toUpperCase()} terminada en ${order.payment.method.last4}`
                    : 'Método de pago'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="col-md-6 text-md-end mt-3 mt-md-0">
            <div className="order-status">
              <h5 className="mb-2">Estado del pedido</h5>
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="products-card mb-4">
        <h4 className="card-title mb-3">Productos</h4>

        <div className="table-responsive">
          <table className="table order-items-table">
            <thead>
            <tr>
              <th>Producto</th>
              <th className="text-center">Precio</th>
              <th className="text-center">Cantidad</th>
              <th className="text-end">Total</th>
            </tr>
            </thead>
            <tbody>
            {order.items.map((item, index) => (
              <tr key={`${item.productId}-${index}`}>
                <td>
                  <div className="product-cell">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="product-thumbnail me-2"
                      />
                    )}
                    <div className="product-info">
                      <div className="product-name">{item.name}</div>
                    </div>
                  </div>
                </td>
                <td className="text-center">{formatPrice(item.price)}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dirección y desglose de costos */}
      <div className="row">
        {/* Dirección de envío */}
        <div className="col-md-6 mb-4">
          <div className="address-card">
            <h4 className="card-title mb-3">Dirección de envío</h4>

            {order.shipping?.address ? (
              <div className="address-info">
                <p className="fw-medium mb-1">{order.shipping.address.name}</p>
                <p className="mb-1">
                  {order.shipping.address.street}
                  {order.shipping.address.numExt && ` #${order.shipping.address.numExt}`}
                  {order.shipping.address.numInt && `, Int. ${order.shipping.address.numInt}`}
                </p>
                {order.shipping.address.colonia && (
                  <p className="mb-1">{order.shipping.address.colonia}</p>
                )}
                <p className="mb-1">
                  {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.zip}
                </p>
                {order.shipping.address.references && (
                  <p className="text-muted fst-italic small mb-0">
                    <i className="bi bi-info-circle me-1"></i>
                    {order.shipping.address.references}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted">No hay información de dirección disponible</p>
            )}
          </div>
        </div>

        {/* Resumen de costos */}
        <div className="col-md-6 mb-4">
          <div className="totals-card">
            <h4 className="card-title mb-3">Resumen</h4>

            <div className="totals-table">
              <div className="totals-row">
                <div className="label">Subtotal:</div>
                <div className="value">{formatPrice(order.totals.subtotal)}</div>
              </div>

              <div className="totals-row">
                <div className="label">IVA (16%):</div>
                <div className="value">{formatPrice(order.totals.tax)}</div>
              </div>

              <div className="totals-row">
                <div className="label">Envío:</div>
                <div className="value">
                  {order.totals.shipping > 0
                    ? formatPrice(order.totals.shipping)
                    : <span className="text-success">Gratis</span>
                  }
                </div>
              </div>

              {order.totals.discount > 0 && (
                <div className="totals-row">
                  <div className="label">Descuento:</div>
                  <div className="value text-success">-{formatPrice(order.totals.discount)}</div>
                </div>
              )}

              <div className="totals-row total">
                <div className="label">Total:</div>
                <div className="value">{formatPrice(order.totals.total)}</div>
              </div>
            </div>
          </div>

          {/* Información de facturación */}
          {order.billing?.requiresInvoice && (
            <div className="invoice-info mt-3">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-receipt me-2 text-primary"></i>
                <h6 className="mb-0">Información de facturación</h6>
              </div>

              {order.billing.invoiceId ? (
                <div className="text-muted small">
                  <p className="mb-1">Factura: {order.billing.invoiceId}</p>
                  <p className="mb-1">RFC: {order.billing.fiscalData.rfc}</p>
                  <p className="mb-0">Razón social: {order.billing.fiscalData.businessName}</p>
                </div>
              ) : (
                <div className="text-muted small">
                  <p className="mb-0">
                    <i className="bi bi-info-circle me-1"></i>
                    La factura está en proceso de generación
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notas del pedido */}
      {order.notes && (
        <div className="notes-card mb-4">
          <h4 className="card-title mb-2">Notas del pedido</h4>
          <p className="text-muted">{order.notes}</p>
        </div>
      )}

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