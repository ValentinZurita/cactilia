// src/modules/user/components/cart-page/CartItem.jsx

// Importamos Bootstrap Icons (opcional) y tu CSS
import '../../../styles/pages/cart.css';
import { useState } from 'react'


export const CartItem = ({ product, onIncrement, onDecrement, onRemove }) => {
  return (
    <div className="cart-item-container d-flex align-items-start py-3">
      {/* Contenedor de detalles y controles */}
      <div className="cart-item-details flex-grow-1">
        <h5 className="cart-item-title">{product.title}</h5>
        <p className="cart-item-subtitle text-muted mb-1">{product.subtitle}</p>

        <div className="cart-item-price-stock d-flex align-items-center mb-2">
          {/* Se calcula el total del producto según la cantidad */}
          <span className="me-2 fw-bold">${(product.price * product.quantity).toFixed(2)}</span>
          {product.inStock
            ? <span className="text-success fw-light">En stock</span>
            : <span className="text-danger fw-light">Sin stock</span>
          }
        </div>

        {/* Acciones: cantidad y botón eliminar */}
        <div className="cart-item-actions d-flex align-items-center">
          <div className="btn-group" role="group" aria-label="Cantidad del producto">
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => onDecrement(product.id)}
              aria-label="Disminuir cantidad"
            >
              –
            </button>
            <span className="btn btn-sm btn-light border disabled mb-0">
              {product.quantity}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={() => onIncrement(product.id)}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-light border ms-3"
            onClick={() => onRemove(product.id)}
            aria-label="Eliminar del carrito"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>

      {/* Contenedor para la imagen */}
      <div className="cart-item-image ms-3">
        <img
          src={product.image}
          alt={product.title}
          className="img-fluid rounded"
        />
      </div>
    </div>
  );
};