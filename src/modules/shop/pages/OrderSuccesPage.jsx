import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig.js';
import { OxxoVoucher } from '../features/checkout/components/payment/oxxoVoucher.jsx';
import { clearCartWithSync } from '../../../store/cart/cartThunk.js';
import { addMessage } from '../../../store/messages/messageSlice.js';

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
} from './features/order-details/index.js';

import { formatDate } from '../utils/dateUtils.js';

// Estilos
import '../features/checkout/styles/oxxoVoucher.css';
import '../features/checkout/styles/orderSuccess.css';

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
        <i className="bi bi-arrow-left me-1"></i>
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
  // Definir correctamente isOxxoPayment basado en el tipo de pago de la orden
  const isOxxoPayment = orderDetails.payment?.type === 'oxxo';

  return (
    <div className="os-wrapper order-success-container">
      {/* Cabecera con animación de éxito */}
      <OrderSummaryHeader
        title={isOxxoPayment ? "¡Pedido Registrado!" : "¡Pedido Confirmado!"}
        message={isOxxoPayment
          ? "Tu pedido ha sido registrado. Por favor completa el pago en tu tienda OXXO más cercana."
          : "Gracias por tu compra. Tu pedido ha sido procesado correctamente."
        }
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

      {/* Dirección de Envío */}
      <div className="order-details-section">
        <h3>Dirección de Envío</h3>
        <OrderAddressCard
          address={orderDetails.shipping?.address}
          estimatedDelivery={orderDetails.shipping?.estimatedDelivery}
        />
      </div>

      {/* Información de Pago */}
      <div className="order-details-section">
        <h3>Información de Pago</h3>
        <OrderPaymentInfo
          payment={orderDetails.payment}
          billing={orderDetails.billing}
        />
      </div>

      {/* Información de Pago en OXXO */}
      {orderDetails.payment?.type === 'oxxo' && (
        <div className="order-details-section">
          <h3>Información de Pago en OXXO</h3>
          <OxxoVoucher
            orderData={orderDetails}
            voucherUrl={orderDetails.payment?.voucherUrl}
            expiresAt={orderDetails.payment?.expiresAt}
          />

          {/* Simuladores solo para desarrollo */}
          {process.env.NODE_ENV !== 'production' && (
            <>
              {/* Nota: los componentes de simulación se muestran solo en desarrollo */}
              {orderDetails?.payment?.paymentIntentId && (
                <div className="alert alert-warning mt-3">
                  <p className="mb-0"><strong>Modo Desarrollo:</strong> Herramientas de simulación disponibles.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Notas del pedido */}
      <OrderNotes notes={orderDetails.notes} />

      {/* Mensaje de OXXO */}
      {orderDetails.payment?.type === 'oxxo' && (
        <div className="order-details-section">
          <div className="oxxo-disclaimer alert alert-warning">
            <h5 className="alert-heading">
              <i className="bi bi-info-circle-fill me-2"></i>
              Información importante
            </h5>
            <p>Tu pedido ha sido registrado, pero será procesado únicamente después de confirmar tu pago en OXXO.</p>
            <p className="mb-0">Ten en cuenta que:</p>
            <ul>
              <li>El voucher tiene una validez de 24 horas.</li>
              <li>Una vez realizado el pago, puede tomar hasta 24 horas para que se refleje en nuestro sistema.</li>
              <li>Recibirás un correo electrónico cuando confirmemos tu pago.</li>
            </ul>
          </div>
        </div>
      )}

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
  const dispatch = useDispatch();

  // Estado interno
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCleared, setCartCleared] = useState(false);

  // Extraer parámetros de URL
  const searchParams = new URLSearchParams(window.location.search);
  const paymentType = searchParams.get('payment');
  const isOxxoPayment = paymentType === 'oxxo';

  // Cargar detalles del pedido
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

          // Si no es pago OXXO y no hemos limpiado el carrito, hacerlo ahora
          if (data.payment?.type !== 'oxxo' && !cartCleared) {
            // Limpiar el carrito solo si venimos directamente del checkout
            if (!window.location.pathname.includes('/profile/')) {
              dispatch(clearCartWithSync());
              setCartCleared(true);

              // Mostrar mensaje de éxito
              dispatch(addMessage({
                type: 'success',
                text: '¡Pedido completado correctamente!',
                autoHide: true,
                duration: 5000
              }));
            }
          }
        }
      } catch (err) {
        console.error('OrderSuccessPage: Error al obtener detalles del pedido:', err);
        setError('Ocurrió un error al cargar los detalles del pedido');
      } finally {
        setLoading(false);
      }
    };

    getOrderData();
  }, [orderId, dispatch, cartCleared]);

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