import { OrderStatusBadge } from './OrderStatusBadge';

/**
 * Componente para mostrar el historial de cambios de estado de un pedido
 * Utilizando clases de Bootstrap para el estilo
 *
 * @param {Object} props
 * @param {Array} props.history - Historial de cambios de estado
 * @param {Function} props.formatDate - Función para formatear fechas
 */
export const OrderStatusHistory = ({ history = [], formatDate }) => {
  if (!history || history.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        No hay historial de cambios de estado disponible.
      </div>
    );
  }

  return (
    <div className="order-status-history">
      <h5 className="mb-3">
        <i className="bi bi-clock-history me-2"></i>
        Historial de Estados
      </h5>

      <div className="position-relative ms-4 pb-2 border-start border-2 border-light">
        {history.map((change, index) => (
          <div key={index} className="position-relative mb-4">
            {/* Círculo marcador */}
            <div className="position-absolute top-0 start-0 translate-middle rounded-circle bg-primary"
                 style={{ width: '14px', height: '14px', left: '-10px', border: '2px solid white' }}>
            </div>

            {/* Contenido */}
            <div className="ms-4 ps-2">
              {/* Timestamp */}
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted small">
                  {formatDate(change.changedAt)}
                </span>
              </div>

              {/* Cambio de estado */}
              <div className="d-flex align-items-center">
                <div className="me-2">
                  <OrderStatusBadge status={change.from} className="me-2" />
                  <i className="bi bi-arrow-right"></i>
                  <OrderStatusBadge status={change.to} className="ms-2" />
                </div>
              </div>

              {/* Notas (si existen) */}
              {change.notes && (
                <div className="bg-light p-2 rounded mt-2 border-start border-secondary border-2">
                  <i className="bi bi-quote me-1 text-muted"></i>
                  <small>{change.notes}</small>
                </div>
              )}

              {/* Usuario que realizó el cambio */}
              <small className="text-muted d-block mt-1">
                Actualizado por: Admin {change.changedBy.substring(0, 8)}...
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};