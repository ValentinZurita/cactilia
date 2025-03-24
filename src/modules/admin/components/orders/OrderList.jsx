import React from 'react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { TableView } from '../dashboard/TableView.jsx'

/**
 * Componente para mostrar una lista de pedidos en formato tabla
 * Con encabezado negro para mantener consistencia con otras tablas
 *
 * @param {Object} props
 * @param {Array} props.orders - Lista de pedidos
 * @param {boolean} props.loading - Indica si se están cargando los pedidos
 * @param {Function} props.onViewDetail - Función para ver detalle de un pedido
 * @param {Function} props.formatPrice - Función para formatear precios
 * @param {Function} props.formatDate - Función para formatear fechas
 * @param {boolean} props.hasMore - Indica si hay más pedidos para cargar
 * @param {Function} props.onLoadMore - Función para cargar más pedidos
 */
export const OrderList = ({
                            orders = [],
                            loading = false,
                            onViewDetail,
                            formatPrice,
                            formatDate,
                            hasMore = false,
                            onLoadMore
                          }) => {
  // Definir columnas para la tabla
  const columns = [
    {
      key: 'id',
      header: 'ID Pedido',
      renderCell: (order) => (
        <span className="order-id fw-medium text-primary">
          #{order.id.slice(0, 8)}...
        </span>
      )
    },
    {
      key: 'date',
      header: 'Fecha',
      renderCell: (order) => (
        <span className="order-date d-flex align-items-center">
          <i className="bi bi-calendar3 text-muted me-2 small"></i>
          {formatDate(order.createdAt)}
        </span>
      )
    },
    {
      key: 'customer',
      header: 'Cliente',
      renderCell: (order) => (
        <div className="customer-info">
          <div className="d-flex align-items-center">
            <div className="bg-light rounded-circle p-1 me-2 d-flex align-items-center justify-content-center"
                 style={{ width: '28px', height: '28px' }}>
              <i className="bi bi-person text-secondary"></i>
            </div>
            <div>
              <span className="customer-id fw-medium">{order.userId.slice(0, 8)}...</span>
              {order.shipping?.address?.name && (
                <div className="customer-name text-muted small">{order.shipping.address.name}</div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'items',
      header: 'Productos',
      renderCell: (order) => (
        <span className="order-items d-inline-flex align-items-center bg-light rounded-pill px-3 py-1">
          <i className="bi bi-box2 me-2 text-muted"></i>
          {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
        </span>
      )
    },
    {
      key: 'total',
      header: 'Total',
      renderCell: (order) => (
        <span className="order-total fw-bold">
          {formatPrice(order.totals.total)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      renderCell: (order) => (
        <OrderStatusBadge status={order.status} />
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      renderCell: (order) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => onViewDetail(order.id)}
            title="Ver detalles"
          >
            <i className="bi bi-eye me-1"></i>
            Detalles
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="order-list card border-0 shadow-sm overflow-hidden">
      <div className="card-body p-0">
        <TableView
          data={orders}
          columns={columns}
          loading={loading}
          tableClass="table-striped table-hover border shadow-sm"
          theadClass="table-dark" // Utilizar encabezado negro para ser consistente
          style={{ borderRadius: "8px", overflow: "hidden" }}
        />

        {/* Mensaje si no hay pedidos */}
        {orders.length === 0 && !loading && (
          <div className="alert alert-info m-3 mb-0 d-flex align-items-center">
            <i className="bi bi-info-circle-fill me-3 fs-4"></i>
            <span>No se encontraron pedidos con los filtros actuales.</span>
          </div>
        )}
      </div>

      {/* Paginación / Botón cargar más */}
      {orders.length > 0 && hasMore && (
        <div className="text-center p-3 border-top">
          <button
            className="btn btn-outline-primary"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Cargando...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-down-circle me-2"></i>
                Cargar más pedidos
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};