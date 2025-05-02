import { formatPrice } from '../../../utils/index.js'

/**
 * Muestra los totales de una orden
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.totals - Objeto con los totales
 * @returns {JSX.Element}
 */
export const OrderTotals = ({ totals }) => {
  // Asegurarse de tener un objeto totals válido
  const safeTotals = totals || { subtotal: 0, taxes: 0, shipping: 0, discount: 0, finalTotal: 0 };

  return (
    <div className="order-summary-totals">
      <div className="totals-row">
        <span>Subtotal:</span>
        <span>{formatPrice(safeTotals.subtotal)}</span>
      </div>
      <div className="totals-row">
        <span>IVA (16%):</span>
        <span>{formatPrice(safeTotals.tax)}</span>
      </div>
      <div className="totals-row">
        <span>Envío:</span>
        <span>
          {safeTotals.shipping > 0
            ? formatPrice(safeTotals.shipping)
            : <span className="free-shipping">Gratis</span>}
        </span>
      </div>
      {safeTotals.discount > 0 && (
        <div className="totals-row">
          <span>Descuento:</span>
          <span className="text-success">-{formatPrice(safeTotals.discount)}</span>
        </div>
      )}
      <div className="totals-row total">
        <span>Total:</span>
        <span className="total-amount">{formatPrice(safeTotals.finalTotal)}</span>
      </div>
    </div>
  );
};