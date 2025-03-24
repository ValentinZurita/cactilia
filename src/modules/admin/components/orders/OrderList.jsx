import React from 'react';
import { OrderStatusBadge } from './OrderStatusBadge';

/**
 * Componente para mostrar una lista de pedidos con diseño minimalista
 * Ajustado para mejor visualización en dispositivos móviles y desktop
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

  // Renderizar mensaje si no hay órdenes
  if (orders.length === 0 && !loading) {
    return (
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-5 text-center">
          <i className="bi bi-inbox fs-1 text-secondary opacity-50 d-block mb-3"></i>
          <h5 className="text-secondary fw-normal">No se encontraron pedidos</h5>
          <p className="text-muted">Intenta con diferentes filtros o criterios de búsqueda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-list">
      {/* Lista de tarjetas */}
      <div className="row g-3">
        {orders.map((order) => (
          <div key={order.id} className="col-12">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-0">
                <div className="row g-0 align-items-center">
                  {/* ID y Estado - Columna 1 */}
                  <div className="col-md-2 px-4 py-3 d-flex flex-column justify-content-center">
                    <div className="mb-2">
                      <span className="fw-medium d-block">#{order.id.slice(0, 8)}...</span>
                      <small className="text-muted">{formatDate(order.createdAt)}</small>
                    </div>
                    {/* Badge de estado reducido para móvil */}
                    <div className="badge-container">
                      <OrderStatusBadge
                        status={order.status}
                        className="small-status-badge"
                      />
                    </div>
                  </div>

                  {/* Cliente - Columna 2 */}
                  <div className="col-md-3 px-3 py-3 border-start-md border-end-md border-light">
                    <div className="d-flex align-items-center">
                      <div className="bg-light rounded-circle p-1 d-flex align-items-center justify-content-center"
                           style={{ width: '32px', height: '32px', minWidth: '32px' }}>
                        <i className="bi bi-person text-secondary"></i>
                      </div>
                      <div className="ms-2 text-truncate">
                        <span className="d-block text-truncate">{order.userId.slice(0, 8)}...</span>
                        {order.shipping?.address?.name && (
                          <small className="text-muted text-truncate d-block">{order.shipping.address.name}</small>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalles del pedido - Columna 3 */}
                  <div className="col-md-3 px-3 py-3">
                    <div className="d-flex align-items-center mb-1">
                      <i className="bi bi-box me-2 text-secondary"></i>
                      <span className="text-secondary small">
                        {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-currency-dollar me-2 text-secondary"></i>
                      <span className="fw-medium">{formatPrice(order.totals.total)}</span>
                    </div>
                  </div>

                  {/* Acción - Columna 4 - Eliminado el fondo gris */}
                  <div className="col-md-4 px-4 py-3 text-md-end d-flex d-md-block justify-content-end align-items-center">
                    <button
                      className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                      onClick={() => onViewDetail(order.id)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      Ver detalle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón cargar más */}
      {hasMore && (
        <div className="text-center py-4">
          <button
            className="btn btn-outline-secondary rounded-pill px-4 btn-sm"
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
                <i className="bi bi-plus-circle me-2"></i>
                Cargar más pedidos
              </>
            )}
          </button>
        </div>
      )}

      {/* Indicador de carga */}
      {loading && orders.length === 0 && (
        <div className="text-center py-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando pedidos...</p>
        </div>
      )}

      {/* Estilos específicos para el componente */}
      <style jsx>{`
        /* Estilos para los bordes solo en modo desktop */
        @media (min-width: 768px) {
          .border-start-md {
            border-left: 1px solid var(--bs-border-color) !important;
          }
          .border-end-md {
            border-right: 1px solid var(--bs-border-color) !important;
          }
        }
        
        /* Ajustes para el badge en móvil */
        .small-status-badge {
          font-size: 0.75rem;
          padding: 0.15rem 0.5rem;
        }
        
        @media (max-width: 767px) {
          .small-status-badge {
            display: inline-block;
            max-width: fit-content;
          }
        }
      `}</style>
    </div>
  );
};