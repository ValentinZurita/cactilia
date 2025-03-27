import React from 'react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { ORDER_STATUS_CONFIG } from './orderConstants.js';

/**
 * Historial de estados con diseño minimalista
 */
export const OrderStatusHistory = ({ history = [], formatDate }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted mb-0">No hay historial de cambios de estado disponible</p>
      </div>
    );
  }

  // Función para obtener el icono según el estado
  const getStatusIcon = (status) => {
    return ORDER_STATUS_CONFIG[status]?.icon || 'arrow-right';
  };

  return (
    <div className="history-list">
      {/* Mostrar el número total de cambios de forma sutil */}
      <p className="text-muted small mb-3">
        {history.length} {history.length === 1 ? 'cambio' : 'cambios'} registrados
      </p>

      {/* Lista minimalista de cambios */}
      <div className="timeline">
        {history.map((change, index) => (
          <div key={index} className="timeline-item mb-4">
            {/* Encabezado con fecha y administrador */}
            <div className="d-flex justify-content-between text-secondary small mb-2">
              <span>{formatDate(change.changedAt)}</span>
              <span>Admin {change.changedBy.substring(0, 8)}...</span>
            </div>

            {/* Transición de estado */}
            <div className="d-flex align-items-center">
              <i className={`bi bi-${getStatusIcon(change.from)} text-secondary me-2`}></i>
              <OrderStatusBadge status={change.from} />
              <i className="bi bi-arrow-right mx-2 text-secondary"></i>
              <i className={`bi bi-${getStatusIcon(change.to)} text-secondary me-2`}></i>
              <OrderStatusBadge status={change.to} />
            </div>

            {/* Notas (si existen) con estilo minimalista */}
            {change.notes && (
              <div className="mt-2 ms-4 ps-2 border-start border-2 border-light">
                <p className="mb-0 small text-secondary">{change.notes}</p>
              </div>
            )}

            {/* Separador sutil entre elementos (excepto el último) */}
            {index < history.length - 1 && (
              <div className="border-bottom border-light my-3"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};