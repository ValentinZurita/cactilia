import { OrderTimeline } from './OrderTimeline.jsx';
import { getFriendlyOrderStatus } from '../../../../../shared/utils/statusMapping.js';

export const OrderOverview = ({
                                orderId,
                                orderDate,
                                status,
                                createdAt,
                                showTimeline = true
                              }) => {

  const statusInfo = getFriendlyOrderStatus(status, 'user');

  return (
    <div className="order-overview">
      <div className="order-id-container">
        <div className="order-label">Número de Pedido</div>
        <div className="order-id">{orderId}</div>
        <div className="order-date">
          Fecha: {orderDate}
        </div>
        <div className="order-status-label mt-2">
          <span className={`badge ${statusInfo.badgeClass}`}>{statusInfo.label}</span>
        </div>
      </div>

      {showTimeline && (
        <div className="order-status-container">
          <OrderTimeline status={status} createdAt={createdAt} />
        </div>
      )}
    </div>
  );
};