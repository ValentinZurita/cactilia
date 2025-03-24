import React from 'react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { ORDER_STATUS_CONFIG } from './orderConstants.js';

// Componente reutilizable para mantener consistencia
const IconCircle = ({ icon, className = '', color = 'secondary', ...props }) => (
  <div
    className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${className}`}
    style={{
      width: '36px',
      height: '36px',
      minWidth: '36px',
      backgroundColor: `var(--bs-${color}-bg-subtle, #f8f9fa)`,
    }}
    {...props}
  >
    <i className={`bi bi-${icon} text-${color}`}></i>
  </div>
);

export const OrderStatusHistory = ({ history = [], formatDate }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-clock-history text-secondary opacity-50 d-block mb-2 fs-4"></i>
        <p className="mb-0 text-muted">No hay historial de cambios de estado disponible</p>
      </div>
    );
  }

  // Función para obtener el color según el estado
  const getStatusColor = (status) => {
    return ORDER_STATUS_CONFIG[status]?.color || 'secondary';
  };

  return (
    <div className="history-list">
      {history.map((change, index) => {
        const statusColor = getStatusColor(change.to);

        return (
          <div key={index} className={`mb-4 ${index !== history.length - 1 ? 'border-bottom pb-4' : ''}`}>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary small">{formatDate(change.changedAt)}</span>
              <span className="text-secondary small">Admin {change.changedBy.substring(0, 8)}...</span>
            </div>

            <div className="d-flex align-items-start">
              <IconCircle icon={ORDER_STATUS_CONFIG[change.to]?.icon || 'arrow-right'} color={statusColor} />

              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-2">
                  <OrderStatusBadge status={change.from} />
                  <i className="bi bi-arrow-right mx-2 text-secondary"></i>
                  <OrderStatusBadge status={change.to} />
                </div>

                {change.notes && (
                  <div className="bg-light p-3 rounded-2 mt-2 small">
                    {change.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};