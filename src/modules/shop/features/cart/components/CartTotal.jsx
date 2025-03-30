// src/modules/shop/features/cart/components/CartTotal.jsx
import React from 'react';

/**
 * Muestra el resumen de totales del carrito
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.items - Elementos del carrito
 * @returns {JSX.Element}
 */
export const CartTotal = ({ items = [] }) => {
  // Cálculos simplificados directamente en el componente
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.16; // 16%
  const taxes = subtotal * taxRate;
  const minFreeShipping = 500;
  const shippingCost = 50;

  const isFreeShipping = subtotal >= minFreeShipping;
  const shipping = isFreeShipping ? 0 : shippingCost;

  const total = subtotal + shipping;

  // Formato de precios
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

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
        <span className="text-success">
          {isFreeShipping ? 'Gratis' : formatPrice(shipping)}
        </span>
      </div>

      <hr />

      {/* Total */}
      <div className="d-flex justify-content-between align-items-center">
        <strong>Total:</strong>
        <strong className="text-green-1 fs-5">{formatPrice(total)}</strong>
      </div>

      {/* Seguridad y envío */}
      <div className="mt-4">
        <div className="d-flex align-items-center text-muted mb-2">
          <i className="bi bi-shield-check me-2 text-success"></i>
          <small>Pago seguro garantizado</small>
        </div>

        <div className="d-flex align-items-center text-muted">
          <i className="bi bi-truck me-2 text-success"></i>
          <small>Envío gratis en compras mayores a $500</small>
        </div>
      </div>
    </div>
  );
};