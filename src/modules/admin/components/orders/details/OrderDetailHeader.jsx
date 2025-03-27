import { OrderStatusBadge } from '../status/OrderStatusBadge.jsx';
import { PrintOrderButton } from './PrintOrderButton.jsx';

export const OrderDetailHeader = ({ order, formatDate, formatPrice, onBack, userData }) => (
  <header className="d-flex flex-wrap justify-content-between align-items-start pb-3 mb-4">
    {/* Información del pedido */}
    <div className="mb-3 mb-md-0 me-auto">
      <div className="d-flex align-items-center mb-2">
        <h4 className="mb-0 fw-normal me-3">{order.id}</h4>
        {/* Botón de imprimir con datos del usuario */}
        <PrintOrderButton
          order={order}
          formatDate={formatDate}
          formatPrice={formatPrice}
          userData={userData}
        />
      </div>
      <div className="text-secondary small mb-2">
        Creado el {formatDate(order.createdAt)}
      </div>
      <OrderStatusBadge status={order.status} />
    </div>

    {/* Total */}
    <div className="align-self-start text-end">
      <span className="text-secondary small d-block mb-1">Total</span>
      <span className="fs-4 fw-normal">{formatPrice(order.totals.total)}</span>
    </div>
  </header>
);