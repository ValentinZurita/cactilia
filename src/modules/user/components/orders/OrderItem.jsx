import { OrderStatusBadge } from './OrderStatusBadge';
import { Link } from 'react-router-dom';

/**
 * Representa la información de un pedido.
 * @typedef {Object} Order
 * @property {number | string} id    - Identificador único del pedido.
 * @property {string}         status - Estado actual del pedido.
 * @property {string}         date   - Fecha en la que se creó el pedido.
 * @property {number}         items  - Cantidad de productos en el pedido.
 * @property {number}         total  - Monto total monetario del pedido.
 */

/**
 * Componente para mostrar un pedido individual en un listado.
 *
 * @param {Object} props
 * @param {Order}  props.order - Datos del pedido
 * @returns {JSX.Element}
 */
export const OrderItem = ({ order }) => {

  /**
   * Devuelve la etiqueta descriptiva del número de productos.
   * Ejemplo: "3 productos" o "1 producto".
   */
  const productLabel = order.items === 1 ? 'producto' : 'productos';

  /**
   * Formatea el total del pedido a dos decimales con un prefijo de moneda.
   * Ejemplo: 123.456 -> "$123.46"
   */
  const formattedTotal = `$${order.total.toFixed(2)}`;

  // --------------------------------------------------
  // 2. Renderizado (manteniendo misma estructura y clases)
  // --------------------------------------------------
  return (
    <li className="order-item">

      <article className="order-header">

        {/* Sección izquierda (ID, estado, fecha, etc.) */}
        <section>

          {/* ID y badge de estado en la misma fila */}
          <div className="d-flex align-items-center">
            <div className="order-id">{order.id}</div>
            <OrderStatusBadge status={order.status} className="ms-2" />
          </div>

          {/* Fecha del pedido */}
          <div className="order-date">{order.date}</div>

          {/* Indicador de productos */}
          <div className="mt-1">
            <span className="badge bg-light text-dark">
              <i className="bi bi-box me-1" />
              {order.items} {productLabel}
            </span>
          </div>

        </section>

        {/* Sección derecha (total y link de detalles) */}
        <section className="d-flex flex-column align-items-end">
          <div className="order-price">
            {formattedTotal}
          </div>
          <Link to={`/profile/orders/${order.id}`} className="btn-details mt-2">
            <i className="bi bi-eye" />
          </Link>
        </section>

      </article>
    </li>
  );
};