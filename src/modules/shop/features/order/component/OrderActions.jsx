import { Link } from 'react-router-dom';

export const OrderActions = ({
                               isFromCheckout = true,
                               orderId,
                               showSupport = true
                             }) => {
  return (
    <>
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

      {showSupport && (
        <div className="customer-support">
          <h5>¿Necesitas ayuda?</h5>
          <p>
            Si tienes alguna pregunta sobre tu pedido, contacta a nuestro equipo
            de soporte en{' '}
            <a href="mailto:soporte@cactilia.com">soporte@cactilia.com</a> o
            llamando al <a href="tel:+525512345678">+52 55 1234 5678</a>.
          </p>
        </div>
      )}
    </>
  );
};