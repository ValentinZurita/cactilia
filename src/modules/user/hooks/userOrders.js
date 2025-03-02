import { useState, useMemo } from 'react';

/**
 * Hook personalizado para manejar la lógica de pedidos
 *
 * @returns {Object} - Métodos y estado para manejar pedidos
 */
export const useOrders = () => {
  // Estado para el filtro seleccionado
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
   * Cambia el filtro activo
   * @param {string} newFilter - Nuevo filtro a aplicar
   */
  const changeFilter = (newFilter) => {
    setFilter(newFilter);
  };

  /**
   * Pedidos filtrados según el filtro seleccionado
   */
  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  }, [filter, orders]);

  return {
    filter,
    changeFilter,
    filteredOrders
  };
};