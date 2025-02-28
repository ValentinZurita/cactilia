import '../../../../styles/pages/cart.css';
import { calculateCartTotals, formatPrice } from '../../../shop/utils/cartUtilis.js'


export const CartTotal = ({ items = [] }) => {

  // Calcular totales usando nuestra función de utilidad con el modelo mexicano (IVA incluido)
  const { subtotal, taxes, shipping, total, finalTotal, isFreeShipping } = calculateCartTotals(items, 0.16, 500, 50);


  return (

    // Cart total container
    <div className="cart-total">
      <h4>Resumen del Pedido</h4>

      {/* Subtotal */}
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">Subtotal:</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      {/* Taxes */}
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">IVA (16% incluido):</span>
        <span>{formatPrice(taxes)}</span>
      </div>

      {/* Shipping */}
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">Envío:</span>
        <span className="text-success">
          {isFreeShipping ? 'Gratis' : formatPrice(shipping)}
        </span>
      </div>

      <hr />

      {/* Total */}
      <div className="d-flex justify-content-between align-items-center">
        <strong>Total:</strong>
        <strong className="text-green-1 fs-5">{formatPrice(finalTotal)}</strong>
      </div>

      {/* Seguridad y envío */}
      <div className="mt-4">

        {/* Iconos */}
        <div className="d-flex align-items-center text-muted mb-2">
          <i className="bi bi-shield-check me-2 text-success"></i>
          <small>Pago seguro garantizado</small>
        </div>

        {/* Envío gratis */}
        <div className="d-flex align-items-center text-muted">
          <i className="bi bi-truck me-2 text-success"></i>
          <small>Envío gratis en compras mayores a $500</small>
        </div>

      </div>
    </div>
  );
};