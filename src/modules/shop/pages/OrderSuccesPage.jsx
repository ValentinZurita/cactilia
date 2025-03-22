/**
 * OrderSuccessPage.jsx
 *
 * Página independiente para mostrar la confirmación de pedido,
 * incluyendo detalles básicos de la orden.
 *
 * Ruta esperada: "/order-success/:orderId"
 *    - :orderId = ID del pedido en Firestore
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig.js';
import { formatPrice } from '../utils/cartUtilis.js';

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
  <div className="container text-center my-5 py-5">
    <div className="spinner-border text-success" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
    <p className="mt-3">Cargando detalles del pedido...</p>
  </div>
);

/**
 * Componente para mostrar mensajes de error
 */
const ErrorState = ({ error }) => (
  <div className="container my-5">
    <div className="alert alert-danger">
      <i className="bi bi-exclamation-triangle-fill me-2"></i>
      {error}
    </div>
    <div className="text-center mt-4">
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
  <div className="container order-confirmation-page my-5 text-center">
    <div className="confirmation-content p-4">
      <div className="success-icon mb-4">
        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
      </div>

      <h1 className="confirmation-title mb-3">¡Pedido Confirmado!</h1>

      <p className="confirmation-message mb-4">
        Gracias por tu compra. Tu pedido ha sido procesado correctamente.
      </p>

      <p className="text-muted mt-2">
        Te hemos enviado un correo electrónico con los detalles de tu pedido.
      </p>

      <div className="confirmation-actions mt-4">
        <Link to="/profile/orders" className="btn btn-green-3 me-3">
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
const OrderSuccessContent = ({ orderId, orderDetails }) => (
  <div className="container order-confirmation-page my-5 text-center">
    <div className="confirmation-content p-4">
      {/* Ícono y títulos */}
      <div className="success-icon mb-4">
        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
      </div>
      <h1 className="confirmation-title mb-3">¡Pedido Confirmado!</h1>
      <p className="confirmation-message mb-4">
        Gracias por tu compra. Tu pedido ha sido procesado correctamente.
      </p>

      {/* Número de pedido */}
      <div className="order-number-container mb-4">
        <h4>Número de Pedido</h4>
        <div className="order-number-badge">{orderId}</div>
        <p className="text-muted mt-2">
          Te hemos enviado un correo electrónico con los detalles de tu pedido.
        </p>
      </div>

      {/* Resumen de la orden */}
      {orderDetails && (
        <div className="order-summary mb-4">
          <h5>Resumen del Pedido</h5>
          <div className="card mt-3">
            <div className="card-body">
              <p>
                <strong>Fecha:</strong> {formatDate(orderDetails.createdAt)}
              </p>
              <p>
                <strong>Total:</strong> {formatPrice(orderDetails.totals.total)}
              </p>
              <p>
                <strong>Productos:</strong> {orderDetails.items.length}
              </p>
              <p>
                <strong>Estado:</strong>{' '}
                <span className="badge bg-success-subtle text-success">
                  Procesando
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pasos siguientes */}
      <div className="order-info mb-4">
        <h5>¿Qué sigue?</h5>
        <ol className="text-start next-steps-list">
          <li>
            Recibirás un correo de confirmación con los detalles de tu pedido.
          </li>
          <li>
            Tu pedido será procesado y preparado para envío en las próximas
            24-48 horas.
          </li>
          <li>
            Cuando tu pedido sea enviado, recibirás un correo con la información
            de seguimiento.
          </li>
          <li>
            Podrás revisar el estado de tu pedido en cualquier momento desde la
            sección "Mis Pedidos".
          </li>
        </ol>
      </div>

      {/* Botones de acción */}
      <div className="confirmation-actions">
        <Link to="/profile/orders" className="btn btn-green-3 me-3">
          <i className="bi bi-bag me-2"></i>
          Ver Mis Pedidos
        </Link>
        <Link to="/shop" className="btn btn-outline-secondary">
          <i className="bi bi-shop me-2"></i>
          Seguir Comprando
        </Link>
      </div>

      {/* Soporte */}
      <div className="customer-support mt-5">
        <h6>¿Necesitas ayuda?</h6>
        <p className="text-muted">
          Si tienes alguna pregunta sobre tu pedido, contacta a nuestro equipo
          de soporte en{' '}
          <a href="mailto:soporte@cactilia.com">soporte@cactilia.com</a> o
          llamando al <a href="tel:+525512345678">+52 55 1234 5678</a>.
        </p>
      </div>
    </div>
  </div>
);

/**
 * Componente principal de la página de éxito de pedido.
 * - Lee el orderId de la URL (parámetro :orderId).
 * - Obtiene los detalles de la orden desde Firestore.
 * - Muestra la confirmación con los detalles o error si no se encuentra.
 */
export const OrderSuccessPage = () => {
  const { orderId } = useParams();       // orderId desde la URL "/order-success/:orderId"
  const location = useLocation();
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
