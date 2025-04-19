import React from 'react';
import { formatPrice } from '../../../utils/index.js';
import { useCart } from '../hooks/useCart.js';

/**
 * Muestra el resumen de totales del carrito
 *
 * @param {Object} props - Propiedades del componente (items ya no se usa para calcular)
 * @param {Array} props.items - Elementos del carrito (obtenido via useCart ahora)
 * @returns {JSX.Element}
 */
export const CartTotal = () => {

  // Obtener totales calculados desde el hook centralizado useCart
  const { subtotal, taxes, total } = useCart();

  return (
    <div className="cart-total">
      <h4>Resumen del Pedido</h4>

      {/* Subtotal */}
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">Subtotal:</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      {/* Taxes */}
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">IVA (16%):</span>
        <span>{formatPrice(taxes)}</span>
      </div>

      {/* Shipping */}
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">Envío:</span>
        <span className="text-muted text-sm">Pendiente</span>
      </div>

      <hr />

      {/* Total */}
      <div className="d-flex justify-content-between align-items-center">
        <strong>Total:</strong>
        <strong className="text-green-1 fs-5">{formatPrice(total)}</strong>
      </div>

      {/* Información adicional */}
      <div className="mt-4">
        <div className="d-flex align-items-center text-muted mb-2">
          <i className="bi bi-shield-check me-2 text-success"></i>
          <small>Pago seguro garantizado</small>
        </div>
        <div className="d-flex align-items-center text-muted">
          <i className="bi bi-truck me-2 text-success"></i>
          <small>Costo de envío calculado al finalizar la compra</small>
        </div>
      </div>
    </div>
  );
};