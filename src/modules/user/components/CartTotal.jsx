
import '../../../styles/pages/cart.css';

export const CartTotal = ({ total }) => {
  return (
    <div className="cart-total p-3 bg-light">
      <h4 className="mb-3">Resumen</h4>
      <div className="d-flex justify-content-between mb-2">
        <span>Subtotal:</span>
        <span>${total.toFixed(2)}</span>
      </div>
      {/* Aquí se pueden agregar más detalles (envío, impuestos, etc.) */}
      <hr />
      <div className="d-flex justify-content-between">
        <strong>Total:</strong>
        <strong>${total.toFixed(2)}</strong>
      </div>
    </div>
  );
};