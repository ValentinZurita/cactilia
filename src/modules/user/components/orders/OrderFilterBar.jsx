/**
 * OrderFilterBar.jsx
 *
 * Barra de filtros para los pedidos. Permite filtrar los pedidos por estado
 * (todos, en proceso, entregados y cancelados).
 */

import React from 'react';

/**
 * Filtros disponibles y su ícono asociado.
 * Estos identificadores deben coincidir con los estados mapeados en useOrders.
 */
const FILTERS = [
  { id: 'all', label: 'Todos', icon: 'bi-grid-fill' },
  { id: 'processing', label: 'En proceso', icon: 'bi-clock-fill' },
  { id: 'delivered', label: 'Entregados', icon: 'bi-check-circle-fill' },
  { id: 'cancelled', label: 'Cancelados', icon: 'bi-x-circle-fill' }
];

/**
 * Barra de filtros para los pedidos.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.activeFilter - Filtro actualmente seleccionado.
 * @param {Function} props.onFilterChange - Función para cambiar el filtro.
 * @returns {JSX.Element}
 */
export const OrderFilterBar = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="order-filter-bar mb-4">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          className={`filter-chip ${activeFilter === filter.id ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.id)}
          aria-pressed={activeFilter === filter.id}
        >
          <i className={`bi ${filter.icon}`}></i>
          {filter.label}
        </button>
      ))}
    </div>
  );
};
