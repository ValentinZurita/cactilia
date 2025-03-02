import { OrderStatusBadge } from './OrderStatusBadge';
import { Link } from 'react-router-dom';

/**
 * Componente para mostrar un pedido individual
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.order - Datos del pedido
 * @returns {JSX.Element}
 */
export const OrderItem = ({ order }) => {
  return (
    <li className="order-item">
      <div className="order-header">
        <div>
          {/* Primera fila: ID del pedido + badge de estado */}
          <div className="d-flex align-items-center">
            <div className="order-id">{order.id}</div>
            <OrderStatusBadge status={order.status} className="ms-2" />
          </div>

          {/* Segunda fila: Fecha */}
          <div className="order-date">{order.date}</div>

          {/* Tercera fila: Badge de productos */}
          <div className="mt-1">
            <span className="badge bg-light text-dark">
              <i className="bi bi-box me-1"></i>
              {order.items} {order.items === 1 ? 'producto' : 'productos'}
            </span>
          </div>
        </div>

        {/* Precio a la derecha */}
        <div className="d-flex flex-column align-items-end">
          <div className="order-price">
            ${order.total.toFixed(2)}
          </div>

          {/* Botón de detalles (solo icono) */}
          <Link to={`/profile/orders/${order.id}`} className="btn-details mt-2">
            <i className="bi bi-eye"></i>
          </Link>
        </div>
      </div>
    </li>
  );
};