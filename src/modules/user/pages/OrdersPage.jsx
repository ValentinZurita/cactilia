/**
 * OrdersPage.jsx
 *
 * Página principal para mostrar los pedidos del usuario.
 * Utiliza el hook personalizado useOrders para obtener y filtrar las órdenes.
 * Muestra una barra de filtros y la lista de pedidos, además de manejar
 * los estados de carga y de error.
 */

import React from 'react';
import { SectionTitle } from '../components/shared/index.js';
import '../styles/profileOrders.css';
import { OrderFilterBar, OrdersList } from '../components/orders/index.js';
import { useOrders } from '../hooks/userOrders.js'

export const OrdersPage = () => {
  // Obtener métodos y estado del hook personalizado
  const {
    filter,
    changeFilter,
    filteredOrders,
    loading,
    error
  } = useOrders();

  // Manejo de error
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  // Indicador de carga
  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando pedidos...</span>
        </div>
        <p className="mt-2">Cargando tus pedidos...</p>
      </div>
    );
  }

  // Vista principal
  return (
    <div>
      <SectionTitle title="Mis Pedidos" />

      <OrderFilterBar
        activeFilter={filter}
        onFilterChange={changeFilter}
      />

      <OrdersList
        orders={filteredOrders}
        filter={filter}
      />
    </div>
  );
};
