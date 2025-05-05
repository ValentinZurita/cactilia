import { Link } from 'react-router-dom';

export const OrderActions = ({
                               isFromCheckout = true,
                               orderId,
                               showSupport = true,
                               companyContact,
                               loadingContact
                             }) => {
  
  const email = companyContact?.email || 'soporte@ejemplo.com';
  const phone = companyContact?.phone || '5512345678';
  const formattedPhone = `+52${phone}`;

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

      {/* Mostrar siempre si showSupport es true */}
      {showSupport && (
        <div className="customer-support">
          <h5>¿Necesitas ayuda?</h5>
          {/* Usar ternario para mostrar loading, datos o mensaje genérico */}
          {loadingContact ? (
            <p>Cargando información de contacto...</p>
          ) : companyContact ? (
            <p>
              Si tienes alguna pregunta sobre tu pedido, contacta a nuestro equipo
              de soporte en{' '}
              <a href={`mailto:${email}`}>{email}</a> o
              llamando al <a href={`tel:${formattedPhone}`}>{phone}</a>.
            </p>
          ) : (
            /* Mensaje genérico si no hay datos de contacto */
            <p>
              Si tienes alguna pregunta sobre tu pedido, por favor, ponte en contacto 
              con nuestro equipo de soporte.
            </p>
          )}
        </div>
      )}
    </>
  );
};