import React, { useMemo } from 'react';
import { formatPrice } from '../../../utils/index.js';

/**
 * Muestra el resumen de totales del carrito
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.items - Elementos del carrito
 * @returns {JSX.Element}
 */
export const CartTotal = ({ items = [] }) => {

  // Cálculos memoizados para evitar recálculos innecesarios
  const calculatedValues = useMemo(() => {
    // Validar que items sea un array
    if (!Array.isArray(items) || items.length === 0) {
      return {
        subtotal: 0,
        taxes: 0,
        total: 0
      };
    }

    // Calcular subtotal (con validación de datos)
    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);

    // Constantes para cálculos
    const taxRate = 0.16; // 16%

    // Calcular impuestos (IVA incluido en el precio en México)
    const taxes = subtotal * taxRate / (1 + taxRate);

    // Calcular total final
    const total = subtotal;

    return {
      subtotal,
      taxes,
      total
    };
  }, [items]);

  const { subtotal, taxes, total } = calculatedValues;

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