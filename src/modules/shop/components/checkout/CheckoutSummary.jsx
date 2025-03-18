import React from 'react';
import { formatPrice } from '../../utils/cartUtilis.js'


/**
 * CheckoutSummary - Componente que muestra el resumen del pedido
 * Incluye lista de productos, subtotal, impuestos, envío y total
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.items - Lista de productos en el carrito
 * @param {number} props.subtotal - Subtotal del pedido (sin impuestos)
 * @param {number} props.taxes - Impuestos aplicados
 * @param {number} props.shipping - Costo de envío
 * @param {number} props.finalTotal - Total final a pagar
 * @param {boolean} props.isFreeShipping - Si el envío es gratis
 */
export const CheckoutSummary = ({
                                  items = [],
                                  subtotal,
                                  taxes,
                                  shipping,
                                  finalTotal,
                                  isFreeShipping
                                }) => {
  return (
    <div className="checkout-summary">
      <h3 className="summary-title mb-4">Resumen del Pedido</h3>

      {/* Lista de productos */}
      <div className="product-list mb-4">
        {items.map(item => (
          <div key={item.id} className="product-item d-flex mb-3">
            <div className="product-image me-3">
              <img
                src={item.image}
                alt={item.name}
                className="img-fluid rounded"
                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
              />
            </div>
            <div className="product-details flex-grow-1">
              <h6 className="product-name mb-0">{item.name}</h6>
              <div className="d-flex justify-content-between">
                <span className="product-quantity text-muted">
                  {item.quantity} x {formatPrice(item.price)}
                </span>
                <span className="product-total fw-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desglose de costos */}
      <div className="cost-breakdown">
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>IVA (16%):</span>
          <span>{formatPrice(taxes)}</span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>Envío:</span>
          {isFreeShipping ? (
            <span className="text-success">Gratis</span>
          ) : (
            <span>{formatPrice(shipping)}</span>
          )}
        </div>

        <hr className="my-3" />

        <div className="d-flex justify-content-between total-line">
          <span className="fw-bold">Total:</span>
          <span className="fw-bold fs-5 text-green-1">{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {/* Información adicional */}
      <div className="additional-info mt-4">
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