import { OrderStatusBadge } from './OrderStatusBadge';

/**
 * Componente para mostrar el historial de cambios de estado de un pedido
 * Con diseño visual mejorado
 *
 * @param {Object} props
 * @param {Array} props.history - Historial de cambios de estado
 * @param {Function} props.formatDate - Función para formatear fechas
 */
export const OrderStatusHistory = ({ history = [], formatDate }) => {
  if (!history || history.length === 0) {
    return (
      <div className="alert alert-info rounded-4 d-flex align-items-center">
        <i className="bi bi-info-circle-fill me-3 fs-4"></i>
        <div>No hay historial de cambios de estado disponible.</div>
      </div>
    );
  }

  // Función para obtener el color según el estado
  const getStatusColor = (status) => {
    const statusColors = {
      pending: '#ffc107',
      processing: '#0d6efd',
      shipped: '#0dcaf0',
      delivered: '#198754',
      cancelled: '#dc3545'
    };

    return statusColors[status] || '#6c757d';
  };

  return (
    <div className="order-status-history">
      <h5 className="mb-3 d-flex align-items-center">
        <i className="bi bi-clock-history me-2 text-primary"></i>
        Historial de Estados
      </h5>

      <div className="position-relative ms-4 pb-2">
        {/* Línea vertical principal */}
        <div className="position-absolute top-0 bottom-0 start-0"
             style={{ width: '2px', backgroundColor: '#e9ecef', left: '-8px' }}></div>

        {history.map((change, index) => (
          <div key={index} className="position-relative mb-4">
            {/* Círculo marcador personalizado con el color del estado destino */}
            <div className="position-absolute top-0 start-0 rounded-circle border border-white shadow-sm"
                 style={{
                   width: '16px',
                   height: '16px',
                   left: '-15px',
                   backgroundColor: getStatusColor(change.to),
                   zIndex: 2
                 }}>
            </div>

            {/* Tarjeta de evento */}
            <div className="ms-3 card border-0 rounded-4 shadow-sm">
              <div className="card-body p-3">
                {/* Encabezado: fecha y usuario */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small d-flex align-items-center">
                    <i className="bi bi-calendar2 me-1"></i>
                    {formatDate(change.changedAt)}
                  </span>
                  <span className="badge bg-light text-dark rounded-pill small d-flex align-items-center">
                    <i className="bi bi-person me-1"></i>
                    Admin {change.changedBy.substring(0, 8)}...
                  </span>
                </div>

                {/* Cambio de estado con badges y flecha */}
                <div className="d-flex align-items-center my-2">
                  <OrderStatusBadge status={change.from} className="me-2" />
                  <div className="mx-2 text-muted">
                    <i className="bi bi-arrow-right"></i>
                  </div>
                  <OrderStatusBadge status={change.to} />
                </div>

                {/* Notas (si existen) */}
                {change.notes && (
                  <div className="bg-light rounded-3 p-2 mt-2 border-start border-4"
                       style={{ borderColor: getStatusColor(change.to) }}>
                    <i className="bi bi-quote me-2 text-muted"></i>
                    <small>{change.notes}</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};