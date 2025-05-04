import React from 'react';
import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '../orders/status/OrderStatusBadge.jsx'; // Reutilizar badge de estado
import { formatDate, formatCurrency } from '../../../../utils/formatting/formatters.js'; // Utilidades de formato

/**
 * Muestra una tabla con el historial de pedidos de un usuario.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.orders - Array de objetos de pedido
 * @returns {JSX.Element}
 */
export const UserOrdersTable = ({ orders }) => {

  if (!orders || orders.length === 0) {
    // Esto no debería ocurrir si se usa EmptyOrdersSection, pero por seguridad
    return <p className="text-muted small">No hay pedidos para mostrar.</p>;
  }

  return (
    <div className="table-responsive">
      {/* Tabla simplificada: sin hover, sin striping */}
      <table className="table table-sm border-top">
        <thead className="table-light">
          <tr>
            {/* Encabezados con peso normal */}
            <th scope="col" className="fw-normal">ID Pedido</th>
            <th scope="col" className="fw-normal">Fecha</th>
            <th scope="col" className="fw-normal">Estado</th>
            <th scope="col" className="text-end fw-normal">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              {/* ID como enlace al detalle del pedido, sin negrita extra */}
              <td>
                <Link 
                  to={`/admin/orders/view/${order.id}`}
                  className="text-decoration-none"
                  title="Ver detalles del pedido"
                >
                  #{order.id.substring(0, 8)}...
                </Link>
              </td>
              {/* Fecha formateada */}
              <td>{formatDate(order.createdAt)}</td>
              {/* Estado con badge */}
              <td>
                <OrderStatusBadge status={order.status} />
              </td>
              {/* Total formateado y alineado a la derecha */}
              <td className="text-end">{formatCurrency(order.totals?.finalTotal || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 