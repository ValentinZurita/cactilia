import '../../../../../styles/pages/cart.css';

export const CartItem = ({ product, onIncrement, onDecrement, onRemove }) => {
  // Verificar si el producto tiene stock
  const inStock = product.stock > 0;

  return (
    <div className="cart-item-container d-flex align-items-start py-3">
      {/* Contenedor de detalles y controles */}
      <div className="cart-item-details flex-grow-1">
        <h5 className="cart-item-title">{product.name}</h5>
        <p className="cart-item-subtitle text-muted mb-1">{product.category}</p>

        <div className="cart-item-price-stock d-flex align-items-center mb-2">
          {/* Se calcula el total del producto según la cantidad */}
          <span className="me-2 fw-bold">${(product.price * product.quantity).toFixed(2)}</span>
          {inStock
            ? <span className="text-success fw-light">En stock</span>
            : <span className="text-danger fw-light">Sin stock</span>
          }
        </div>

        {/* Acciones: cantidad y botón eliminar */}
        <div className="cart-item-actions d-flex align-items-center">
          <div className="quantity-controls d-flex align-items-center">
            <div className="btn-group" role="group" aria-label="Cantidad del producto">
              {/* Botones de cantidad */}
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={onDecrement}
                aria-label="Disminuir cantidad"
                disabled={!inStock || product.quantity <= 1}
              >
                –
              </button>
              <span className="btn btn-sm btn-light disabled mb-0">
                {product.quantity}
              </span>

              {/* Botón de aumentar cantidad */}
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={onIncrement}
                aria-label="Aumentar cantidad"
                disabled={!inStock}
              >
                +
              </button>
            </div>

            {/* Botón de eliminar (gris) */}
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
          src={product.image}
          alt={product.name}
          className="img-fluid rounded"
        />
      </div>
    </div>
  );
};