import { useState } from 'react';
import { EmptyState, ProfileCard, SectionTitle } from '../components/shared/index.js'

/**
 * OrdersPage
 *
 * Displays user's order history with filtering options
 */
export const OrdersPage = () => {
  // Filter state
  const [filter, setFilter] = useState('all');

  // Mock data - would come from Firebase in real implementation
  const orders = [
    {
      id: 'ORD-1234',
      date: '25 Feb 2025',
      status: 'delivered',
      items: 3,
      total: 129.99
    },
    {
      id: 'ORD-1233',
      date: '18 Feb 2025',
      status: 'processing',
      items: 1,
      total: 59.99
    },
    {
      id: 'ORD-1232',
      date: '10 Feb 2025',
      status: 'cancelled',
      items: 2,
      total: 149.99
    }
  ];

  /**
   * Filter orders based on selected filter
   * @returns {Array} - Filtered orders
   */
  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  };

  /**
   * Get CSS class for status badge
   * @param {string} status - Order status
   * @returns {string} - CSS class
   */
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'delivered': return 'badge-delivered';
      case 'processing': return 'badge-processing';
      case 'cancelled': return 'badge-cancelled';
      default: return 'bg-secondary';
    }
  };

  /**
   * Get display text for status
   * @param {string} status - Order status
   * @returns {string} - Formatted text
   */
  const getStatusText = (status) => {
    switch(status) {
      case 'delivered': return 'Entregado';
      case 'processing': return 'En proceso';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Get filtered orders
  const filteredOrders = getFilteredOrders();

  return (
    <div>
      {/* Section title */}
      <SectionTitle title="Mis Pedidos" />

      {/* Filter buttons */}
      <div className="mb-4">
        <button
          className={`btn me-2 ${filter === 'all' ? 'btn-green-3 text-white' : 'btn-outline-secondary'}`}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
        <button
          className={`btn me-2 ${filter === 'processing' ? 'btn-warning' : 'btn-outline-secondary'}`}
          onClick={() => setFilter('processing')}
        >
          En proceso
        </button>
        <button
          className={`btn me-2 ${filter === 'delivered' ? 'btn-success' : 'btn-outline-secondary'}`}
          onClick={() => setFilter('delivered')}
        >
          Entregados
        </button>
        <button
          className={`btn ${filter === 'cancelled' ? 'btn-danger' : 'btn-outline-secondary'}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelados
        </button>
      </div>

      {/* Orders list */}
      {filteredOrders.length > 0 ? (
        filteredOrders.map(order => (
          <ProfileCard key={order.id} className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">{order.id}</h5>
                <p className="text-muted mb-0 small">{order.date}</p>
              </div>
              <div className="text-end">
                <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <p className="fw-bold mt-1">${order.total.toFixed(2)}</p>
              </div>
            </div>
            <hr />
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-0">{order.items} {order.items === 1 ? 'producto' : 'productos'}</p>
              </div>
              <button className="btn btn-sm btn-outline-green">
                Ver detalles
              </button>
            </div>
          </ProfileCard>
        ))
      ) : (
        <EmptyState
          icon="bag-x"
          title="No hay pedidos"
          message="No tienes pedidos que coincidan con el filtro seleccionado"
          actionLink="/shop"
          actionText="Ir a la tienda"
        />
      )}
    </div>
  );
};