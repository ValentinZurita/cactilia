// ===============================
// src/modules/admin/components/orders/OrderStatusChangeSection.jsx - Rediseñado
// ===============================
import React from 'react';
import { OrderStatusChanger } from './OrderStatusChanger';
import { OrderStatusHistory } from './OrderStatusHistory';
import { AdminCard } from './AdminCard.jsx'


export const OrderStatusChangeSection = ({
                                           order,
                                           onChangeStatus,
                                           formatDate,
                                           isProcessing
                                         }) => (
  <div className="row g-4">
    {/* Cambiador de estado - Más minimalista */}
    <div className="col-md-5">
      <AdminCard
        icon="arrow-repeat"
        title="Cambiar estado"
        className="h-100"
      >
        <OrderStatusChanger
          currentStatus={order.status}
          onChangeStatus={(status, notes) => {
            onChangeStatus(status, notes);
          }}
          isProcessing={isProcessing}
        />
      </AdminCard>
    </div>

    {/* Historial de estados - Rediseñado */}
    <div className="col-md-7">
      <AdminCard
        icon="clock-history"
        title="Historial de estados"
        className="h-100"
      >
        <OrderStatusHistory
          history={order.statusHistory || []}
          formatDate={formatDate}
        />
      </AdminCard>
    </div>
  </div>
);