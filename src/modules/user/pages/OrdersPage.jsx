/**
 * OrdersPage.jsx
 *
 * Página principal para mostrar los pedidos del usuario.
 * Utiliza el hook personalizado useOrders para obtener y filtrar las órdenes.
 * Muestra una barra de filtros y la lista de pedidos, además de manejar
 * los estados de carga y de error, y la paginación.
 */

import React from 'react';
import { SectionTitle } from '../components/shared/index.js';
import '../styles/profileOrders.css';
import { OrderFilterBar, OrdersList } from '../components/orders/index.js';
import { useOrders } from '../hooks/userOrders.js';
// Asumiendo que tienes un componente Spinner o similar
// import { Spinner } from '../../shared/components/ui/Spinner'; 

export const OrdersPage = () => {
  // Obtener métodos y estado del hook personalizado, incluyendo los de paginación
  const {
    filter,
    changeFilter,
    loading, // Carga inicial
    loadingMore, // Carga de páginas siguientes
    error,
    getFormattedOrders, // <--- Usar esta función
    fetchNextPage,
    hasMore,
    orders // <-- Necesitamos las órdenes crudas para verificar longitud antes de formatear
  } = useOrders();

  // Obtener las órdenes FORMATEADAS para mostrar
  const formattedOrders = getFormattedOrders();

  // Manejo de error
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  // Indicador de carga INICIAL
  // Verificar usando las órdenes crudas del hook
  if (loading && orders.length === 0) {
    return (
      <div className="text-center my-4">
        {/* Reemplazar con tu componente Spinner si lo tienes */}
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

      {/* Mostrar mensaje si no hay órdenes después de la carga inicial y no hay error */}
      {/* Verificar usando las órdenes crudas del hook */}
      {!loading && orders.length === 0 && !error && (
        <div className="alert alert-info mt-3" role="alert">
          <i className="bi bi-info-circle-fill me-2"></i>
          Aún no tienes pedidos registrados.
        </div>
      )}

      {/* Mostrar la lista solo si hay órdenes formateadas */}
      {formattedOrders.length > 0 && (
        <OrdersList
          orders={formattedOrders} // <--- Pasar las órdenes formateadas
          filter={filter} // Pasar el filtro a OrdersList para el mensaje de estado vacío
        />
      )}

      {/* Sección de paginación */}
      <div className="text-center my-4">
        {/* Indicador de carga para páginas siguientes */}
        {loadingMore && (
          <div className="spinner-border spinner-border-sm text-secondary" role="status">
            <span className="visually-hidden">Cargando más pedidos...</span>
          </div>
        )}

        {/* Botón para cargar más */}
        {hasMore && !loadingMore && (
          <button 
            className="profile-action-button mt-3"
            onClick={fetchNextPage} 
            disabled={loadingMore}
          >
            Cargar más pedidos
          </button>
        )}

        {/* Mensaje cuando no hay más páginas */}
        {/* Verificar usando las órdenes crudas del hook */}
        {!hasMore && orders.length > 0 && (
           <p className="text-muted mt-2">Has llegado al final de tus pedidos.</p>
        )}
      </div>
    </div>
  );
};
