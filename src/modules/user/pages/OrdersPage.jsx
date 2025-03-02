import { SectionTitle } from '../components/shared/index.js';
import '../styles/profileOrders.css';
import { OrderFilterBar, OrdersList } from '../components/orders/index.js'
import { useOrders } from '../hooks/userOrders.js'

/**
 * OrdersPage - Página rediseñada de historial de pedidos
 * Versión modular y fácil de leer
 */
export const OrdersPage = () => {
  // Obtener métodos y estado del hook personalizado
  const { filter, changeFilter, filteredOrders } = useOrders();

  return (
    <div>
      {/* Título de sección */}
      <SectionTitle title="Mis Pedidos" />

      {/* Filtros tipo chip */}
      <OrderFilterBar
        activeFilter={filter}
        onFilterChange={changeFilter}
      />

      {/* Lista de pedidos */}
      <OrdersList orders={filteredOrders} />
    </div>
  );
};