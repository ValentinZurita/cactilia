import React from 'react';
import { OrderStatusChanger } from './OrderStatusChanger';
import { OrderStatusHistory } from './OrderStatusHistory';

// Componentes reutilizables (iguales a los de OrderPaymentInfo)
const InfoBlock = ({ title, children }) => (
  <div className="mb-4">
    <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">{title}</h6>
    {children}
  </div>
);

export const OrderStatusChangeSection = ({
                                           order,
                                           onChangeStatus,
                                           formatDate,
                                           isProcessing
                                         }) => (
  <div className="row g-4">
    {/* Cambiador de estado */}
    <div className="col-md-5">
      <InfoBlock title="Cambiar estado">
        <OrderStatusChanger
          currentStatus={order.status}
          onChangeStatus={onChangeStatus}
          isProcessing={isProcessing}
        />
      </InfoBlock>
    </div>

    {/* Historial de estados */}
    <div className="col-md-7">
      <InfoBlock title="Historial de estados">
        <OrderStatusHistory
          history={order.statusHistory || []}
          formatDate={formatDate}
        />
      </InfoBlock>
    </div>
  </div>
);