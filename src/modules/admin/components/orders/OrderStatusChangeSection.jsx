import React from 'react';
import { OrderStatusHistory } from './OrderStatusHistory';
import { OrderStatusBadge } from './OrderStatusBadge';

/**
 * Sección rediseñada con estilo minimalista para mostrar
 * solo el historial de estados sin decoraciones excesivas
 */
export const OrderStatusChangeSection = ({ order, formatDate }) => {
  return (
    <div className="status-history-section">
      {/* Mensaje informativo sobre cambios de estado - Estilo más simple */}
      <div className="mb-4 border-start border-4 border-secondary ps-3 py-2">
        <p className="mb-1">Estado actual: <OrderStatusBadge status={order.status} /></p>
        <p className="mb-0 small text-secondary">
          Los cambios de estado se realizan a través de la pestaña "Flujo de Trabajo".
        </p>
      </div>

      {/* Historial de estados - Sin card, estilo minimalista */}
      <div>
        <h6 className="mb-3 text-secondary fw-normal d-flex align-items-center">
          <i className="bi bi-clock-history me-2"></i>
          Historial de cambios de estado
        </h6>

        <OrderStatusHistory
          history={order.statusHistory || []}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};