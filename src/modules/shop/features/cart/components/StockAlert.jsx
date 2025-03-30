// src/modules/shop/features/cart/components/StockAlert.jsx
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar alertas de disponibilidad de productos
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.items - Items del carrito a verificar
 * @param {string} props.className - Clases adicionales
 * @returns {JSX.Element|null}
 */
export const StockAlert = ({ items, className = '' }) => {
  // Verificar productos sin stock
  const outOfStockItems = items.filter(item => item.stock === 0);

  // Verificar productos con cantidad mayor al stock disponible
  const insufficientStockItems = items.filter(item =>
    item.stock > 0 && item.quantity > item.stock
  );

  // Si no hay problemas de stock, no mostramos nada
  if (outOfStockItems.length === 0 && insufficientStockItems.length === 0) {
    return null;
  }

  return (
    <div className={`stock-alerts ${className}`}>
      {/* Alerta para productos sin stock */}
      {outOfStockItems.length > 0 && (
        <div className="alert alert-danger mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Productos sin existencia:</strong>
          <ul className="mb-0 mt-1">
            {outOfStockItems.map(item => (
              <li key={`out-${item.id}`}>{item.name}</li>
            ))}
          </ul>
          <div className="small mt-2">
            Por favor, elimina estos productos de tu carrito para continuar.
          </div>
        </div>
      )}

      {/* Alerta para productos con stock insuficiente */}
      {insufficientStockItems.length > 0 && (
        <div className="alert alert-warning mb-3">
          <i className="bi bi-exclamation-circle me-2"></i>
          <strong>Stock insuficiente:</strong>
          <ul className="mb-0 mt-1">
            {insufficientStockItems.map(item => (
              <li key={`insuf-${item.id}`}>
                {item.name} - Solicitados: <strong>{item.quantity}</strong>,
                Disponibles: <strong>{item.stock}</strong>
              </li>
            ))}
          </ul>
          <div className="small mt-2">
            Por favor, ajusta las cantidades para continuar.
          </div>
        </div>
      )}
    </div>
  );
};

StockAlert.propTypes = {
  items: PropTypes.array.isRequired,
  className: PropTypes.string
};