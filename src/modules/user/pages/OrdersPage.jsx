import { useState } from 'react';
import { EmptyState, SectionTitle } from '../components/shared/index.js'
import '../../../../src/styles/pages/userProfile.css';
/**
 * OrdersPage - Página rediseñada de historial de pedidos
 * Con estilo minimalista y elegante similar a la sección de direcciones
 */
export const OrdersPage = () => {
  // Estado del filtro
  const [filter, setFilter] = useState('all');

  // Datos de ejemplo - vendrían de Firebase en implementación real
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
   * Filtrar pedidos según el filtro seleccionado
   * @returns {Array} - Pedidos filtrados
   */
  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  };

  /**
   * Obtener etiqueta e icono para cada estado
   * @param {string} status - Estado del pedido
   * @returns {Object} - Texto e icono para el estado
   */
  const getStatusInfo = (status) => {
    switch(status) {
      case 'delivered':
        return { text: 'Entregado', icon: 'bi-check-circle-fill' };
      case 'processing':
        return { text: 'En proceso', icon: 'bi-clock-fill' };
      case 'cancelled':
        return { text: 'Cancelado', icon: 'bi-x-circle-fill' };
      default:
        return { text: status, icon: 'bi-circle-fill' };
    }
  };

  // Obtener pedidos filtrados
  const filteredOrders = getFilteredOrders();

  return (
    <div>
      {/* Título de sección */}
      <SectionTitle title="Mis Pedidos" />

      {/* Filtros tipo chip */}
      <div className="order-filter-bar">
        <button
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <i className="bi bi-grid-fill"></i>
          Todos
        </button>
        <button
          className={`filter-chip ${filter === 'processing' ? 'active' : ''}`}
          onClick={() => setFilter('processing')}
        >
          <i className="bi bi-clock-fill"></i>
          En proceso
        </button>
        <button
          className={`filter-chip ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          <i className="bi bi-check-circle-fill"></i>
          Entregados
        </button>
        <button
          className={`filter-chip ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          <i className="bi bi-x-circle-fill"></i>
          Cancelados
        </button>
      </div>

      {/* Lista de pedidos */}
      {filteredOrders.length > 0 ? (
        <ul className="order-list">
          {filteredOrders.map(order => {
            const { text: statusText, icon: statusIcon } = getStatusInfo(order.status);

            return (
              <li key={order.id} className="order-item">
                <div className="order-header">
                  <div>
                    <div className="order-id">{order.id}</div>
                    <div className="order-date">{order.date}</div>
                  </div>
                  <span className={`order-status ${order.status}`}>
                    <i className={`bi ${statusIcon}`}></i>
                    {statusText}
                  </span>
                </div>

                <div className="order-details">
                  <div className="order-meta">
                    {order.items} {order.items === 1 ? 'producto' : 'productos'}
                  </div>
                  <div className="order-price">
                    ${order.total.toFixed(2)}
                  </div>
                </div>

                <div className="order-actions">
                  <button className="view-order-btn">
                    <i className="bi bi-eye"></i>
                    Ver detalles
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
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