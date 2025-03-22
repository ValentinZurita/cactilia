/**
 * OrderSuccessPage.jsx - Versión mejorada
 *
 * Página independiente para mostrar la confirmación de pedido,
 * con un diseño más elaborado, mejor organización visual y elementos
 * gráficos que mejoran la experiencia del usuario.
 *
 * Ruta esperada: "/order-success/:orderId"
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig.js';
import { formatPrice } from '../utils/cartUtilis.js';
import '../styles/orderSuccess.css'
// Nombre de la colección en Firestore
const ORDERS_COLLECTION = 'orders';

/**
 * Convierte timestamp a fecha legible
 */
const formatDate = (timestamp) => {
  if (!timestamp) return 'Fecha no disponible';

  try {
    const date = timestamp.toDate
      ? timestamp.toDate()
      : timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
};

/**
 * Obtiene los detalles de un pedido
 */
const fetchOrderDetails = async (orderId) => {
  console.log('OrderSuccessPage: Cargando detalles del pedido con ID:', orderId);
  const orderRef = doc(FirebaseDB, ORDERS_COLLECTION, orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    console.error('OrderSuccessPage: No se encontró el pedido:', orderId);
    return null;
  }

  console.log('OrderSuccessPage: Datos del pedido cargados:', orderSnap.data());
  return {
    id: orderSnap.id,
    ...orderSnap.data(),
  };
};

/**
 * Componente para el estado de carga
 */
const LoadingState = () => (
  <div className="success-loading-container">
    <div className="success-loading-content">
      <div className="spinner-container">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
      <h3 className="mt-4 mb-2">Cargando detalles del pedido</h3>
      <p className="text-muted">Estamos recuperando la información de tu compra...</p>
    </div>
  </div>
);

/**
 * Componente para mensajes de error
 */
const ErrorState = ({ error }) => (
  <div className="success-error-container">
    <div className="success-error-content">
      <div className="error-icon-container">
        <i className="bi bi-exclamation-triangle-fill text-danger"></i>
      </div>
      <h3 className="mt-3 mb-3">Ha ocurrido un problema</h3>
      <p className="text-danger mb-4">{error}</p>
      <div className="d-flex gap-3 justify-content-center">
        <Link to="/profile/orders" className="btn btn-outline-primary">
          <i className="bi bi-bag me-2"></i>
          Ver mis pedidos
        </Link>
        <Link to="/shop" className="btn btn-green-3">
          <i className="bi bi-shop me-2"></i>
          Ir a la tienda
        </Link>
      </div>
    </div>
  </div>
);

/**
 * Componente para éxito genérico cuando no hay detalles
 */
const NoOrderDetailsState = () => (
  <div className="success-generic-container">
    <div className="success-header">
      <div className="success-check-animation">
        <i className="bi bi-check-circle-fill"></i>
      </div>
      <h1>¡Pedido Confirmado!</h1>
      <p className="lead">
        Tu compra ha sido procesada correctamente y pronto estará en camino
      </p>
    </div>

    <div className="success-generic-box">
      <p className="text-center mb-4">
        Te hemos enviado un correo electrónico con los detalles de tu pedido.
        Puedes revisar el estado de tu compra en cualquier momento desde la sección "Mis Pedidos".
      </p>

      <div className="success-actions">
        <Link to="/profile/orders" className="btn btn-primary">
          <i className="bi bi-bag me-2"></i>
          Ver Mis Pedidos
        </Link>
        <Link to="/shop" className="btn btn-outline-secondary">
          <i className="bi bi-shop me-2"></i>
          Seguir Comprando
        </Link>
      </div>
    </div>
  </div>
);

/**
 * Componente para mostrar un item del pedido
 */
const OrderItem = ({ item }) => (
  <div className="order-success-item">
    <div className="order-success-item-image">
      {item.image ? (
        <img src={item.image} alt={item.name} className="img-fluid rounded" />
      ) : (
        <div className="placeholder-image">
          <i className="bi bi-box"></i>
        </div>
      )}
    </div>
    <div className="order-success-item-details">
      <h6 className="item-name">{item.name}</h6>
      <div className="item-meta">
        <span className="item-quantity">Cantidad: {item.quantity}</span>
        <span className="item-price">{formatPrice(item.price)}</span>
      </div>
    </div>
    <div className="order-success-item-total">
      {formatPrice(item.price * item.quantity)}
    </div>
  </div>
);

/**
 * Componente principal de la página de éxito
 */
const OrderSuccessContent = ({ orderId, orderDetails }) => {
  const [showAllItems, setShowAllItems] = useState(false);
  const totalItems = orderDetails.items.length;
  const displayItems = showAllItems ? orderDetails.items : orderDetails.items.slice(0, 3);
  const hasMoreItems = totalItems > 3 && !showAllItems;

  return (
    <div className="order-success-container">
      {/* Cabecera con animación y mensaje principal */}
      <div className="success-header">
        <div className="success-check-animation">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h1>¡Pedido Confirmado!</h1>
        <p className="lead">
          ¡Gracias por tu compra! Tu pedido ha sido procesado correctamente.
        </p>
      </div>

      {/* Número de pedido destacado */}
      <div className="order-number-section">
        <div className="order-number-container">
          <div className="order-number-label">Número de Pedido</div>
          <div className="order-number-value">{orderId}</div>
        </div>
        <p className="order-email-notice">
          <i className="bi bi-envelope me-2"></i>
          Te hemos enviado un correo electrónico con los detalles de tu pedido.
        </p>
      </div>

      {/* Información principal del pedido en 2 columnas */}
      <div className="order-success-main">
        <div className="row">
          {/* Columna izquierda: Detalles del pedido y productos */}
          <div className="col-lg-8">
            {/* Sección de resumen */}
            <div className="order-success-section">
              <h3 className="section-title">
                <i className="bi bi-info-circle me-2"></i>
                Detalles del Pedido
              </h3>
              <div className="order-details-grid">
                <div className="order-detail-item">
                  <div className="detail-label">Fecha</div>
                  <div className="detail-value">{formatDate(orderDetails.createdAt)}</div>
                </div>
                <div className="order-detail-item">
                  <div className="detail-label">Estado</div>
                  <div className="detail-value">
                    <span className="status-badge status-processing">
                      <i className="bi bi-clock-fill me-1"></i>
                      Procesando
                    </span>
                  </div>
                </div>
                <div className="order-detail-item">
                  <div className="detail-label">Método de Pago</div>
                  <div className="detail-value">
                    {orderDetails.payment?.method?.brand
                      ? `${orderDetails.payment.method.brand.toUpperCase()} terminada en ${orderDetails.payment.method.last4}`
                      : 'Método de pago estándar'}
                  </div>
                </div>
                <div className="order-detail-item">
                  <div className="detail-label">Método de Envío</div>
                  <div className="detail-value">
                    {orderDetails.shipping?.method
                      ? orderDetails.shipping.method
                      : 'Estándar'}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de productos */}
            <div className="order-success-section">
              <h3 className="section-title">
                <i className="bi bi-box me-2"></i>
                Productos
                <span className="items-count">({totalItems})</span>
              </h3>

              <div className="order-items-container">
                {displayItems.map((item, index) => (
                  <OrderItem key={`${item.id}-${index}`} item={item} />
                ))}

                {hasMoreItems && (
                  <button
                    className="btn btn-outline-secondary btn-sm btn-show-more"
                    onClick={() => setShowAllItems(true)}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Ver {totalItems - 3} productos más
                  </button>
                )}
              </div>
            </div>

            {/* Sección de dirección de envío */}
            <div className="order-success-section">
              <h3 className="section-title">
                <i className="bi bi-geo-alt me-2"></i>
                Dirección de Envío
              </h3>

              {orderDetails.shipping?.address ? (
                <div className="shipping-address-card">
                  <h5 className="address-name">{orderDetails.shipping.address.name}</h5>
                  <p className="address-line">
                    {orderDetails.shipping.address.street}
                    {orderDetails.shipping.address.numExt && ` #${orderDetails.shipping.address.numExt}`}
                    {orderDetails.shipping.address.numInt && `, Int. ${orderDetails.shipping.address.numInt}`}
                  </p>
                  {orderDetails.shipping.address.colonia && (
                    <p className="address-line">{orderDetails.shipping.address.colonia}</p>
                  )}
                  <p className="address-line">
                    {orderDetails.shipping.address.city}, {orderDetails.shipping.address.state} {orderDetails.shipping.address.zip}
                  </p>
                  {orderDetails.shipping.address.references && (
                    <p className="address-references">
                      <i className="bi bi-signpost me-1"></i>
                      {orderDetails.shipping.address.references}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted">No hay información de dirección disponible</p>
              )}
            </div>
          </div>

          {/* Columna derecha: Resumen de costos y próximos pasos */}
          <div className="col-lg-4">
            {/* Resumen económico */}
            <div className="order-success-section order-summary-card">
              <h3 className="section-title">
                <i className="bi bi-receipt me-2"></i>
                Resumen de Pago
              </h3>

              <div className="summary-items">
                <div className="summary-item">
                  <span>Subtotal:</span>
                  <span>{formatPrice(orderDetails.totals.subtotal)}</span>
                </div>
                <div className="summary-item">
                  <span>IVA (16%):</span>
                  <span>{formatPrice(orderDetails.totals.tax)}</span>
                </div>
                <div className="summary-item">
                  <span>Envío:</span>
                  <span>
                    {orderDetails.totals.shipping > 0
                      ? formatPrice(orderDetails.totals.shipping)
                      : <span className="text-success">Gratis</span>
                    }
                  </span>
                </div>

                {orderDetails.totals.discount > 0 && (
                  <div className="summary-item discount-item">
                    <span>Descuento:</span>
                    <span className="text-success">-{formatPrice(orderDetails.totals.discount)}</span>
                  </div>
                )}

                <div className="summary-total">
                  <span>Total:</span>
                  <span>{formatPrice(orderDetails.totals.total)}</span>
                </div>
              </div>

              {/* Información de facturación si existe */}
              {orderDetails.billing?.requiresInvoice && (
                <div className="billing-info">
                  <div className="section-subtitle">
                    <i className="bi bi-receipt me-2"></i>
                    Información de Facturación
                  </div>

                  {orderDetails.billing.invoiceId ? (
                    <div className="invoice-details">
                      <p className="invoice-id">Factura: {orderDetails.billing.invoiceId}</p>
                      <p>RFC: {orderDetails.billing.fiscalData.rfc}</p>
                      <p>Razón social: {orderDetails.billing.fiscalData.businessName}</p>
                    </div>
                  ) : (
                    <p className="invoice-pending">
                      <i className="bi bi-info-circle me-1"></i>
                      Tu factura está en proceso de generación.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ¿Qué sigue? */}
            <div className="order-success-section next-steps-card">
              <h3 className="section-title">
                <i className="bi bi-arrow-right-circle me-2"></i>
                ¿Qué sigue?
              </h3>

              <ol className="next-steps-list">
                <li className="step-item">
                  <span className="step-icon"><i className="bi bi-envelope-check"></i></span>
                  <div className="step-content">
                    <h6>Confirmación por Email</h6>
                    <p>Recibirás un correo con los detalles de tu compra.</p>
                  </div>
                </li>
                <li className="step-item">
                  <span className="step-icon"><i className="bi bi-box-seam"></i></span>
                  <div className="step-content">
                    <h6>Preparación del Pedido</h6>
                    <p>Tu pedido será procesado en las próximas 24-48 horas.</p>
                  </div>
                </li>
                <li className="step-item">
                  <span className="step-icon"><i className="bi bi-truck"></i></span>
                  <div className="step-content">
                    <h6>Envío</h6>
                    <p>Recibirás una notificación con la información de seguimiento.</p>
                  </div>
                </li>
                <li className="step-item">
                  <span className="step-icon"><i className="bi bi-house-door"></i></span>
                  <div className="step-content">
                    <h6>Entrega</h6>
                    <p>¡Disfruta tus productos! No olvides dejarnos tu opinión.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones y soporte */}
      <div className="order-success-footer">
        <div className="row">
          <div className="col-md-6">
            {/* Acciones principales */}
            <div className="success-actions">
              <Link to="/profile/orders" className="btn btn-primary">
                <i className="bi bi-bag me-2"></i>
                Ver Mis Pedidos
              </Link>
              <Link to="/shop" className="btn btn-outline-secondary">
                <i className="bi bi-shop me-2"></i>
                Seguir Comprando
              </Link>
            </div>
          </div>
          <div className="col-md-6">
            {/* Información de soporte */}
            <div className="support-info">
              <h5>¿Necesitas ayuda?</h5>
              <p>
                Si tienes alguna pregunta sobre tu pedido, contacta a nuestro equipo de soporte:
              </p>
              <div className="support-contact">
                <a href="mailto:soporte@cactilia.com" className="support-contact-item">
                  <i className="bi bi-envelope"></i>
                  soporte@cactilia.com
                </a>
                <a href="tel:+525512345678" className="support-contact-item">
                  <i className="bi bi-telephone"></i>
                  +52 55 1234 5678
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente principal de la página de éxito de pedido
 */
export const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Estado interno
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOrderData = async () => {
      if (!orderId) {
        console.error('OrderSuccessPage: No se proporcionó un ID de pedido');
        setError('No se proporcionó un ID de pedido válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchOrderDetails(orderId);
        if (!data) {
          setError('No se encontró la información del pedido');
        } else {
          setOrderDetails(data);
        }
      } catch (err) {
        console.error('OrderSuccessPage: Error al obtener detalles del pedido:', err);
        setError('Ocurrió un error al cargar los detalles del pedido');
      } finally {
        setLoading(false);
      }
    };

    getOrderData();
  }, [orderId]);

  // Renderizado condicional
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!orderDetails) {
    return <NoOrderDetailsState />;
  }

  return <OrderSuccessContent orderId={orderId} orderDetails={orderDetails} />;
};