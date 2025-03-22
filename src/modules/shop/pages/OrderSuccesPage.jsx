import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig.js';
import { formatPrice } from '../utils/cartUtilis.js';
import '../styles/orderSuccess.css';

// Nombre de la colección de ordenes en Firestore
const ORDERS_COLLECTION = 'orders';

/**
 * Convierte el timestamp (Firestore o número) a fecha legible
 * @param {Object|number} timestamp
 * @returns {string} Fecha formateada
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
 * Obtiene los detalles de un pedido desde Firestore.
 * @param {string} orderId - ID del pedido.
 * @returns {Promise<Object|null>} - Datos del pedido o null si no existe.
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
  <div className="order-success-loading">
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
    <h3 className="mt-4">Cargando detalles del pedido...</h3>
    <p className="text-muted">Solo tomará unos segundos</p>
  </div>
);

/**
 * Componente para mostrar mensajes de error
 */
const ErrorState = ({ error }) => (
  <div className="order-success-error">
    <div className="order-error-icon">
      <i className="bi bi-exclamation-circle"></i>
    </div>
    <h3>No pudimos encontrar tu pedido</h3>
    <p className="text-muted">{error}</p>
    <div className="mt-4">
      <Link to="/profile/orders" className="btn btn-outline-secondary">
        <i className="bi bi-arrow-left me-2"></i>
        Ver mis pedidos
      </Link>
    </div>
  </div>
);

/**
 * Componente para mostrar éxito sin detalles de pedido (backup)
 */
const NoOrderDetailsState = () => (
  <div className="order-success-container">
    <div className="order-success-header">
      <div className="success-icon-container">
        <i className="bi bi-check-circle-fill"></i>
      </div>
      <h1>¡Pedido Confirmado!</h1>
      <p className="lead">Gracias por tu compra. Tu pedido ha sido procesado correctamente.</p>
    </div>

    <div className="order-success-generic">
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Te hemos enviado un correo electrónico con los detalles de tu pedido.
      </div>

      <div className="generic-actions mt-5">
        <Link to="/profile/orders" className="btn btn-success me-3">
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
 * Componente para mostrar un item de producto del pedido
 */
const OrderItem = ({ item }) => (
  <div className="order-product-item">
    <div className="order-product-image">
      {item.image ? (
        <img src={item.image} alt={item.name} />
      ) : (
        <div className="no-image">
          <i className="bi bi-box"></i>
        </div>
      )}
    </div>
    <div className="order-product-details">
      <h5>{item.name}</h5>
      <div className="order-product-meta">
        <span className="quantity">Cantidad: {item.quantity}</span>
        <span className="price">{formatPrice(item.price)}</span>
      </div>
    </div>
    <div className="order-product-total">
      {formatPrice(item.price * item.quantity)}
    </div>
  </div>
);

/**
 * Componente para la línea de tiempo del pedido
 */
const OrderTimeline = ({ status, createdAt }) => {
  // Determinar los pasos completados según estado
  const getStepStatus = (stepName) => {
    const statusMap = {
      'pending': ['confirmado'],
      'processing': ['confirmado', 'procesando'],
      'shipped': ['confirmado', 'procesando', 'enviado'],
      'delivered': ['confirmado', 'procesando', 'enviado', 'entregado'],
      'cancelled': ['confirmado', 'cancelado']
    };

    const steps = statusMap[status] || ['confirmado'];
    return steps.includes(stepName) ? 'completed' : 'pending';
  };

  return (
    <div className="order-timeline">
      <h4>Estado del Pedido</h4>

      <div className="timeline-steps">
        <div className={`timeline-step ${getStepStatus('confirmado')}`}>
          <div className="timeline-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="timeline-content">
            <h6>Confirmado</h6>
            <p className="small">{formatDate(createdAt)}</p>
          </div>
        </div>

        {status !== 'cancelled' ? (
          <>
            <div className={`timeline-step ${getStepStatus('procesando')}`}>
              <div className="timeline-icon">
                <i className="bi bi-gear-fill"></i>
              </div>
              <div className="timeline-content">
                <h6>Procesando</h6>
                <p className="small">Preparando tu pedido</p>
              </div>
            </div>

            <div className={`timeline-step ${getStepStatus('enviado')}`}>
              <div className="timeline-icon">
                <i className="bi bi-truck"></i>
              </div>
              <div className="timeline-content">
                <h6>Enviado</h6>
                <p className="small">En camino</p>
              </div>
            </div>

            <div className={`timeline-step ${getStepStatus('entregado')}`}>
              <div className="timeline-icon">
                <i className="bi bi-house-check"></i>
              </div>
              <div className="timeline-content">
                <h6>Entregado</h6>
                <p className="small">Pedido completado</p>
              </div>
            </div>
          </>
        ) : (
          <div className="timeline-step completed cancelled">
            <div className="timeline-icon">
              <i className="bi bi-x-circle-fill"></i>
            </div>
            <div className="timeline-content">
              <h6>Cancelado</h6>
              <p className="small">El pedido ha sido cancelado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Muestra la confirmación final con los detalles del pedido.
 */
const OrderSuccessContent = ({ orderId, orderDetails }) => {
  const isFromCheckout = !window.location.pathname.includes('/profile/');

  return (
    <div className="order-success-container">
      {/* Cabecera con animación de éxito */}
      <div className="order-success-header">
        <div className="success-icon-container">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h1>{isFromCheckout ? '¡Pedido Confirmado!' : 'Detalles del Pedido'}</h1>
        {isFromCheckout && (
          <p className="lead">Gracias por tu compra. Tu pedido ha sido procesado correctamente.</p>
        )}
      </div>

      {/* Resumen principal del pedido */}
      <div className="order-overview">
        <div className="order-id-container">
          <div className="order-label">Número de Pedido</div>
          <div className="order-id">{orderId}</div>
          <div className="order-date">
            Fecha: {formatDate(orderDetails.createdAt)}
          </div>
        </div>

        <div className="order-status-container">
          <OrderTimeline
            status={orderDetails.status}
            createdAt={orderDetails.createdAt}
          />
        </div>
      </div>

      {/* Detalles de productos */}
      <div className="order-details-section">
        <h3>Productos</h3>
        <div className="order-products-list">
          {orderDetails.items.map((item, index) => (
            <OrderItem key={`${item.id}-${index}`} item={item} />
          ))}
        </div>

        {/* Totales */}
        <div className="order-summary-totals">
          <div className="totals-row">
            <span>Subtotal:</span>
            <span>{formatPrice(orderDetails.totals.subtotal)}</span>
          </div>
          <div className="totals-row">
            <span>IVA (16%):</span>
            <span>{formatPrice(orderDetails.totals.tax)}</span>
          </div>
          <div className="totals-row">
            <span>Envío:</span>
            <span>
              {orderDetails.totals.shipping > 0
                ? formatPrice(orderDetails.totals.shipping)
                : <span className="free-shipping">Gratis</span>}
            </span>
          </div>
          <div className="totals-row total">
            <span>Total:</span>
            <span className="total-amount">{formatPrice(orderDetails.totals.total)}</span>
          </div>
        </div>
      </div>

      {/* Información de envío */}
      <div className="order-info-columns">
        <div className="order-address-section">
          <h3>Dirección de Envío</h3>
          <div className="order-address-card">
            {orderDetails.shipping?.address ? (
              <>
                <div className="address-name">{orderDetails.shipping.address.name}</div>
                <address>
                  {orderDetails.shipping.address.street}
                  {orderDetails.shipping.address.numExt && ` #${orderDetails.shipping.address.numExt}`}
                  {orderDetails.shipping.address.numInt && `, Int. ${orderDetails.shipping.address.numInt}`}
                  <br />
                  {orderDetails.shipping.address.colonia && (
                    <>
                      {orderDetails.shipping.address.colonia}
                      <br />
                    </>
                  )}
                  {orderDetails.shipping.address.city}, {orderDetails.shipping.address.state} {orderDetails.shipping.address.zip}
                  {orderDetails.shipping.address.references && (
                    <>
                      <br />
                      <span className="references">
                        <i className="bi bi-info-circle me-1"></i>
                        {orderDetails.shipping.address.references}
                      </span>
                    </>
                  )}
                </address>
                <div className="delivery-estimate">
                  <i className="bi bi-calendar-check me-2"></i>
                  Entrega estimada: {orderDetails.shipping.estimatedDelivery || 'En proceso de cálculo'}
                </div>
              </>
            ) : (
              <p className="text-muted">No hay información de dirección disponible</p>
            )}
          </div>
        </div>

        <div className="order-payment-section">
          <h3>Información de Pago</h3>
          <div className="order-payment-card">
            <div className="payment-method">
              <i className={`bi bi-credit-card-2-front me-2`}></i>
              {orderDetails.payment?.method?.brand
                ? `${orderDetails.payment.method.brand.toUpperCase()} terminada en ${orderDetails.payment.method.last4}`
                : 'Método de pago estándar'}
            </div>
            <div className="payment-status">
              Estado: <span className="status-badge">{orderDetails.payment?.status || 'Procesado'}</span>
            </div>

            {/* Información de facturación si aplica */}
            {orderDetails.billing?.requiresInvoice && (
              <div className="invoice-info mt-3">
                <h6>
                  <i className="bi bi-receipt me-2"></i>
                  Factura
                </h6>
                {orderDetails.billing.invoiceId ? (
                  <div className="invoice-details">
                    <div>Folio: {orderDetails.billing.invoiceId}</div>
                    <div>RFC: {orderDetails.billing.fiscalData.rfc}</div>
                    <div>Razón social: {orderDetails.billing.fiscalData.businessName}</div>
                  </div>
                ) : (
                  <div className="pending-invoice">
                    <i className="bi bi-clock-history me-1"></i>
                    Factura en proceso de generación
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notas del pedido */}
      {orderDetails.notes && (
        <div className="order-notes-section">
          <h3>Notas del Pedido</h3>
          <div className="order-notes-content">
            <i className="bi bi-chat-left-text me-2"></i>
            {orderDetails.notes}
          </div>
        </div>
      )}

      {/* Siguientes pasos y soporte */}
      {isFromCheckout && (
        <div className="order-next-steps">
          <h3>¿Qué sigue?</h3>
          <div className="next-steps-container">
            <div className="next-step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h5>Confirmación por correo</h5>
                <p>Recibirás un correo de confirmación con los detalles de tu pedido en breve.</p>
              </div>
            </div>
            <div className="next-step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h5>Procesamiento del pedido</h5>
                <p>Tu pedido será procesado y preparado para envío en las próximas 24-48 horas.</p>
              </div>
            </div>
            <div className="next-step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h5>Envío y seguimiento</h5>
                <p>Cuando tu pedido sea enviado, recibirás un correo con la información de seguimiento.</p>
              </div>
            </div>
            <div className="next-step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h5>Recibe tu pedido</h5>
                <p>¡Disfruta tu compra! No olvides que puedes revisar el estado de tu pedido en cualquier momento.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="order-actions-footer">
        <Link to="/profile/orders" className="btn btn-success me-3">
          <i className="bi bi-bag me-2"></i>
          {isFromCheckout ? 'Ver Mis Pedidos' : 'Volver a Mis Pedidos'}
        </Link>
        <Link to="/shop" className="btn btn-outline-secondary">
          <i className="bi bi-shop me-2"></i>
          Seguir Comprando
        </Link>
      </div>

      {/* Soporte */}
      <div className="customer-support">
        <h5>¿Necesitas ayuda?</h5>
        <p>
          Si tienes alguna pregunta sobre tu pedido, contacta a nuestro equipo
          de soporte en{' '}
          <a href="mailto:soporte@cactilia.com">soporte@cactilia.com</a> o
          llamando al <a href="tel:+525512345678">+52 55 1234 5678</a>.
        </p>
      </div>
    </div>
  );
};

/**
 * Componente principal de la página de éxito de pedido.
 * - Lee el orderId de la URL (parámetro :orderId).
 * - Obtiene los detalles de la orden desde Firestore.
 * - Muestra la confirmación con los detalles o error si no se encuentra.
 */
export const OrderSuccessPage = () => {
  const { orderId } = useParams();       // orderId desde la URL "/order-success/:orderId"
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
