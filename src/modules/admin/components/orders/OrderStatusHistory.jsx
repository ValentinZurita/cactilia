// ===============================
// src/modules/admin/components/orders/OrderStatusHistory.jsx - Rediseñado
// ===============================
import React from 'react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { ORDER_STATUS_CONFIG } from '../../constants/orderConstants';

export const OrderStatusHistory = ({ history = [], formatDate }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-clock-history text-secondary opacity-50 d-block mb-2 fs-4"></i>
        <p className="text-muted mb-0">No hay historial de cambios de estado disponible</p>
      </div>
    );
  }

  // Función para obtener el color según el estado - versión más sutil
  const getStatusColor = (status) => {
    return ORDER_STATUS_CONFIG[status]?.color
      ? `var(--bs-${ORDER_STATUS_CONFIG[status].color})`
      : 'var(--bs-secondary)';
  };

  return (
    <div className="history-timeline">
      {history.map((change, index) => (
        <div key={index} className="mb-3 pb-3 border-bottom">
          <div className="d-flex justify-content-between mb-2">
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle me-2"
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: getStatusColor(change.to),
                }}
              ></div>
              <span className="text-secondary small">
                {formatDate(change.changedAt)}
              </span>
            </div>
            <span className="text-secondary small">
              Admin {change.changedBy.substring(0, 8)}...
            </span>
          </div>

          <div className="d-flex align-items-center mb-1">
            <OrderStatusBadge status={change.from} />
            <i className="bi bi-arrow-right mx-2 text-secondary"></i>
            <OrderStatusBadge status={change.to} />
          </div>

          {change.notes && (
            <div className="ps-3 mt-2 border-start" style={{ borderColor: getStatusColor(change.to) }}>
              <p className="text-secondary small mb-0">{change.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};