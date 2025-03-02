import { OrderItem } from './OrderItem';
import { EmptyState } from '../shared/index.js'

/**
 * Componente que muestra la lista de pedidos
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.orders - Lista de pedidos filtrados
 * @returns {JSX.Element}
 */
export const OrdersList = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon="bag-x"
        title="No hay pedidos"
        message="No tienes pedidos que coincidan con el filtro seleccionado"
        actionLink="/shop"
        actionText="Ir a la tienda"
      />
    );
  }

  return (
    <ul className="order-list">
      {orders.map(order => (
        <OrderItem key={order.id} order={order} />
      ))}
    </ul>
  );
};