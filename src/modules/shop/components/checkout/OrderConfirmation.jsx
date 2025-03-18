import React from 'react';
import { Link } from 'react-router-dom';

/**
 * OrderConfirmation - Pantalla de confirmación después de un pedido exitoso
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.orderId - ID del pedido completado
 */
export const OrderConfirmation = ({ orderId }) => {
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