import { OrderTimeline } from './OrderTimeline';

export const OrderOverview = ({
                                orderId,
                                orderDate,
                                status,
                                createdAt,
                                showTimeline = true
                              }) => {
  return (
    <div className="order-overview">
      <div className="order-id-container">
        <div className="order-label">Número de Pedido</div>
        <div className="order-id">{orderId}</div>
        <div className="order-date">
          Fecha: {orderDate}
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