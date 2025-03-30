// src/modules/shop/features/cart/components/CartItem.jsx
import React from 'react';
import '../../../../../styles/pages/cart.css';

export const CartItem = ({ product, onIncrement, onDecrement, onRemove }) => {
  // Verificar que tenemos un producto válido
  if (!product) {
    return null;
  }

  // Valores por defecto para propiedades que podrían faltar
  const name = product.name || 'Producto';
  const category = product.category || 'Sin categoría';
  const price = product.price || 0;
  const quantity = product.quantity || 1;
  const image = product.image || '/images/placeholder.jpg';
  const stock = typeof product.stock === 'number' ? product.stock : Infinity;

  // Calcular estados de stock
  const hasStock = stock > 0;
  const hasEnoughStock = hasStock && quantity <= stock;
  const isMaxStock = hasStock && quantity >= stock;

  return (
    <div className="cart-item-container d-flex align-items-start py-3">
      {/* Contenedor de detalles y controles */}
      <div className="cart-item-details flex-grow-1">
        <h5 className="cart-item-title">{name}</h5>
        <p className="cart-item-subtitle text-muted mb-1">{category}</p>

        <div className="cart-item-price-stock d-flex align-items-center mb-2">
          {/* Se calcula el total del producto según la cantidad */}
          <span className="me-2 fw-bold">${(price * quantity).toFixed(2)}</span>

          {/* Mensaje de stock */}
          {!hasStock ? (
            <span className="text-danger fw-light">Sin stock</span>
          ) : hasEnoughStock ? (
            <span className="text-success fw-light">En stock</span>
          ) : (
            <span className="text-warning fw-light">Stock insuficiente (max: {stock})</span>
          )}
        </div>

        {/* Acciones: cantidad y botón eliminar */}
        <div className="cart-item-actions d-flex align-items-center">
          <div className="quantity-controls d-flex align-items-center">
            <div className="btn-group" role="group" aria-label="Cantidad del producto">
              {/* Botón decrementar */}
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={onDecrement}
                aria-label="Disminuir cantidad"
                disabled={!hasStock || quantity <= 1}
              >
                –
              </button>

              {/* Indicador de cantidad */}
              <span className="btn btn-sm btn-light disabled mb-0">
                {quantity}
              </span>

              {/* Botón incrementar */}
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={onIncrement}
                aria-label="Aumentar cantidad"
                disabled={!hasStock || isMaxStock}
              >
                +
              </button>
            </div>

            {/* Botón de eliminar */}
            <button
              type="button"
              className="btn btn-sm btn-light ms-2"
              onClick={onRemove}
              aria-label="Eliminar del carrito"
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor para la imagen */}
      <div className="cart-item-image ms-3">
        <img
          src={image}
          alt={name}
          className="img-fluid rounded"
          onError={(e) => {
            e.target.src = '/images/placeholder.jpg'; // Imagen de respaldo si hay error
          }}
        />
      </div>
    </div>
  );
};