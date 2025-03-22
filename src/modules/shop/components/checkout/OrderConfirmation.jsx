import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { formatPrice } from '../../utils/cartUtilis.js'
import { FirebaseDB } from '../../../../firebase/firebaseConfig.js'


/**
 * OrderConfirmation - Pantalla de confirmación después de un pedido exitoso
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.orderId - ID del pedido completado
 */
export const OrderConfirmation = ({ orderId }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar detalles de la orden
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        console.log("OrderConfirmation: No se recibió orderId");
        return;
      }

      console.log("OrderConfirmation: Cargando detalles del pedido con ID:", orderId);

      try {
        setLoading(true);
        const orderRef = doc(FirebaseDB, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          console.log("Datos del pedido cargados:", orderSnap.data());
          setOrderDetails(orderSnap.data());
        } else {
          console.error("No se encontró la información del pedido");
          setError('No se encontró la información del pedido');
        }
      } catch (err) {
        console.error('Error al obtener detalles del pedido:', err);
        setError('Ocurrió un error al cargar los detalles del pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Mostrar cargando mientras obtenemos los detalles
  if (loading) {
    return (
      <div className="container text-center my-5 py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando detalles del pedido...</p>
      </div>
    );
  }

  // Mostrar error si ocurrió alguno
  if (error) {
    return (
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
  }

  return (
    <div className="container order-confirmation-page my-5 text-center">
      <div className="confirmation-content p-4">
        <div className="success-icon mb-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
        </div>

        <h1 className="confirmation-title mb-3">¡Pedido Confirmado!</h1>

        <p className="confirmation-message mb-4">
          Gracias por tu compra. Tu pedido ha sido procesado correctamente.
        </p>

        <div className="order-number-container mb-4">
          <h4>Número de Pedido</h4>
          <div className="order-number-badge">
            {orderId}
          </div>
          <p className="text-muted mt-2">
            Te hemos enviado un correo electrónico con los detalles de tu pedido.
          </p>
        </div>

        {orderDetails && (
          <div className="order-summary mb-4">
            <h5>Resumen del Pedido</h5>
            <div className="card mt-3">
              <div className="card-body">
                <p><strong>Total:</strong> {formatPrice(orderDetails.totals.total)}</p>
                <p><strong>Productos:</strong> {orderDetails.items.length}</p>
                <p><strong>Estado:</strong> <span className="badge bg-success-subtle text-success">Procesando</span></p>
              </div>
            </div>
          </div>
        )}

        <div className="order-info mb-4">
          <h5>¿Qué sigue?</h5>
          <ol className="text-start next-steps-list">
            <li>
              Recibirás un correo de confirmación con los detalles de tu pedido.
            </li>
            <li>
              Tu pedido será procesado y preparado para envío en las próximas 24-48 horas.
            </li>
            <li>
              Cuando tu pedido sea enviado, recibirás un correo con la información de seguimiento.
            </li>
            <li>
              Podrás revisar el estado de tu pedido en cualquier momento desde la sección "Mis Pedidos".
            </li>
          </ol>
        </div>

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

        <div className="customer-support mt-5">
          <h6>¿Necesitas ayuda?</h6>
          <p className="text-muted">
            Si tienes alguna pregunta sobre tu pedido, contacta a nuestro equipo de soporte en{' '}
            <a href="mailto:soporte@cactilia.com">soporte@cactilia.com</a> o llamando al{' '}
            <a href="tel:+525512345678">+52 55 1234 5678</a>.
          </p>
        </div>
      </div>
    </div>
  );
};