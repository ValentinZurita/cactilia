import { OrderStatusBadge } from './OrderStatusBadge';

export const OrderDetailHeader = ({ order, formatDate, formatPrice }) => (

  <header className="d-flex flex-wrap justify-content-between pb-3 mb-4">

    {/* Información del pedido */}
    <div className="mb-3 mb-md-0 me-auto">
      <h4 className="mb-2 fw-normal text-secondary">{order.id}</h4>
      <div className="text-secondary small mb-2">
        Creado el {formatDate(order.createdAt)}
      </div>
      <OrderStatusBadge status={order.status} />
    </div>

    {/* Total */}
    <div className="align-self-start text-end">
      <span className="text-secondary small d-block mb-1">Total</span>
      <span className="fs-4 fw-normal text-secondary">{formatPrice(order.totals.total)}</span>
    </div>
  </header>
);