import { OrderStatusBadge } from './OrderStatusBadge';

/**
 * Componente para mostrar el historial de cambios de estado de un pedido
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

      <div className="timeline">
        {history.map((change, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <div className="d-flex justify-content-between mb-1">
                <span className="timestamp text-muted">
                  {formatDate(change.changedAt)}
                </span>
              </div>

              <div className="d-flex align-items-center">
                <div className="me-2">
                  <OrderStatusBadge status={change.from} className="me-2" />
                  <i className="bi bi-arrow-right"></i>
                  <OrderStatusBadge status={change.to} className="ms-2" />
                </div>
              </div>

              {change.notes && (
                <blockquote className="blockquote-sm bg-light p-2 rounded mt-2">
                  <i className="bi bi-quote me-1 text-muted"></i>
                  {change.notes}
                </blockquote>
              )}

              <small className="text-muted">
                Actualizado por: Admin {change.changedBy.substring(0, 8)}...
              </small>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .timeline {
          position: relative;
          padding-left: 30px;
          margin-left: 10px;
          border-left: 2px solid #e9ecef;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 25px;
        }
        
        .timeline-marker {
          position: absolute;
          left: -36px;
          top: 0;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: #0d6efd;
          border: 2px solid white;
        }
        
        .timeline-content {
          padding-bottom: 10px;
        }
        
        .timestamp {
          font-size: 0.8rem;
        }
        
        .blockquote-sm {
          font-size: 0.9rem;
          border-left: 3px solid #dee2e6;
          padding-left: 10px;
        }
      `}</style>
    </div>
  );
};