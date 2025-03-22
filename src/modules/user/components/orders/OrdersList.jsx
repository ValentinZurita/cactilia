/**
 * OrdersList.jsx
 *
 * Muestra la lista de pedidos formateados.
 * En caso de no haber pedidos, se muestra un componente de estado vacío.
 */

import React from 'react';
import { OrderItem } from './OrderItem';
import { EmptyState } from '../shared/index.js';

/**
 * Retorna un mensaje apropiado según el filtro de pedidos activo.
 *
 * @param {string} filter - Filtro actualmente seleccionado (all, processing, delivered, cancelled).
 * @returns {string} - Mensaje de ausencia de resultados para ese filtro.
 */
const getEmptyMessage = (filter) => {
  switch (filter) {
    case 'all':
      return 'No tienes pedidos realizados todavía';
    case 'processing':
      return 'No tienes pedidos en proceso';
    case 'delivered':
      return 'No tienes pedidos entregados';
    case 'cancelled':
      return 'No tienes pedidos cancelados';
    default:
      return 'No hay pedidos que coincidan con el filtro seleccionado';
  }
};

/**
 * Componente que muestra la lista de pedidos, o un estado vacío si no hay resultados.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Array} props.orders - Lista de pedidos filtrados y formateados.
 * @param {string} props.filter - Filtro actualmente seleccionado.
 * @returns {JSX.Element}
 */
export const OrdersList = ({ orders, filter = 'all' }) => {
  // Si no hay pedidos en la lista, mostrar estado vacío
  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        icon="bag-x"
        title="No hay pedidos"
        message={getEmptyMessage(filter)}
        actionLink="/shop"
        actionText="Ir a la tienda"
      />
    );
  }

  // Si hay pedidos, mostrarlos en una lista
  return (
    <ul className="order-list">
      {orders.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
    </ul>
  );
};
