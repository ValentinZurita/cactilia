import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig.js';
import '../styles/orderSuccess.css';

// Importar componentes refactorizados
import {
  OrderSummaryHeader,
  OrderOverview,
  OrderProductsList,
  OrderTotals,
  OrderAddressCard,
  OrderPaymentInfo,
  OrderActions,
  OrderNotes,
  OrderNextSteps
} from '../components/order-details';
import { formatDate } from '../utils/dateUtils.js'

// Nombre de la colección de órdenes en Firestore
const ORDERS_COLLECTION = 'orders';

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
  <div className="os-wrapper order-success-loading">
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
  <div className="os-wrapper order-success-error">
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
  <div className="os-wrapper order-success-container">
    <OrderSummaryHeader />
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
 * Muestra la confirmación final con los detalles del pedido.
 */
const OrderSuccessContent = ({ orderId, orderDetails }) => {
  const isFromCheckout = !window.location.pathname.includes('/profile/');

  return (
    <div className="os-wrapper order-success-container">
      {/* Cabecera con animación de éxito */}
      <OrderSummaryHeader
        title={isFromCheckout ? '¡Pedido Confirmado!' : 'Detalles del Pedido'}
        message={isFromCheckout ? 'Gracias por tu compra. Tu pedido ha sido procesado correctamente.' : null}
      />

      {/* Resumen principal del pedido */}
      <OrderOverview
        orderId={orderId}
        orderDate={formatDate(orderDetails.createdAt)}
        status={orderDetails.status}
        createdAt={orderDetails.createdAt}
      />

      {/* Detalles de productos */}
      <div className="order-details-section">
        <h3>Productos</h3>
        <OrderProductsList items={orderDetails.items} />

        {/* Totales */}
        <OrderTotals totals={orderDetails.totals} />
      </div>

      {/* Información de envío */}
      <div className="order-info-columns">
        <div className="order-address-section">
          <h3>Dirección de Envío</h3>
          <OrderAddressCard
            address={orderDetails.shipping?.address}
            estimatedDelivery={orderDetails.shipping?.estimatedDelivery}
          />
        </div>

        <div className="order-payment-section">
          <h3>Información de Pago</h3>
          <OrderPaymentInfo
            payment={orderDetails.payment}
            billing={orderDetails.billing}
          />
        </div>
      </div>

      {/* Notas del pedido */}
      <OrderNotes notes={orderDetails.notes} />

      {/* Siguientes pasos y soporte */}
      {isFromCheckout && <OrderNextSteps />}

      {/* Acciones */}
      <OrderActions
        isFromCheckout={isFromCheckout}
        orderId={orderId}
        showSupport={true}
      />
    </div>
  );
};

/**
 * Componente principal de la página de éxito de pedido.
 * - Lee el orderId de la URL (parámetro:orderId).
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

  // Renderizado condicional con el wrapper principal
  return (
    <div className="order-success-page-wrapper">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : !orderDetails ? (
        <NoOrderDetailsState />
      ) : (
        <OrderSuccessContent orderId={orderId} orderDetails={orderDetails} />
      )}
    </div>
  );
};