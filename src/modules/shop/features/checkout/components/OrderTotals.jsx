import { formatPrice } from '../../../utils/cartUtilis.js';

export const OrderTotals = ({ totals }) => {
  return (
    <div className="order-summary-totals">
      <div className="totals-row">
        <span>Subtotal:</span>
        <span>{formatPrice(totals.subtotal)}</span>
      </div>
      <div className="totals-row">
        <span>IVA (16%):</span>
        <span>{formatPrice(totals.tax)}</span>
      </div>
      <div className="totals-row">
        <span>Envío:</span>
        <span>
          {totals.shipping > 0
            ? formatPrice(totals.shipping)
            : <span className="free-shipping">Gratis</span>}
        </span>
      </div>
      {totals.discount > 0 && (
        <div className="totals-row">
          <span>Descuento:</span>
          <span className="text-success">-{formatPrice(totals.discount)}</span>
        </div>
      )}
      <div className="totals-row total">
        <span>Total:</span>
        <span className="total-amount">{formatPrice(totals.total)}</span>
      </div>
    </div>
  );
};