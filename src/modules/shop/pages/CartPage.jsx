// src/modules/shop/pages/CartPage.jsx
import { useNavigate } from 'react-router-dom';
import '../../../styles/pages/cart.css';
import { useCart } from '../features/cart/hooks/useCart';
import { CartItem, CartTotal, EmptyCart } from '../features/cart/components/index.js';
import { useSelector } from 'react-redux';

export const CartPage = () => {
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);
  const {
    items: cartItems,
    itemsCount,
    hasOutOfStockItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCheckout = () => {
    if (status !== 'authenticated') {
      navigate('/auth/login?redirect=shop/checkout');
      return;
    }

    if (hasOutOfStockItems) {
      alert('Hay productos sin stock en tu carrito. Por favor, elimínalos antes de continuar.');
      return;
    }

    navigate('/shop/checkout');
  };

  if (cartItems.length === 0) {
    return <EmptyCart onContinueShopping={() => navigate('/shop')} />;
  }

  return (
    <div className="container cart-page pt-5 mt-5">
      {/* Encabezado y botón de regreso */}
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn-arrow-back me-3"
          onClick={handleGoBack}
          aria-label="Regresar"
        >
          <i className="bi bi-arrow-left"></i>
        </button>

        <div>
          <h2 className="mb-0 fw-bold">Tu Carrito</h2>
          <p className="text-muted mb-0">
            {itemsCount} {itemsCount === 1 ? 'artículo' : 'artículos'}
          </p>
        </div>
      </div>

      {/* Layout con dos columnas en desktop */}
      <div className="row">
        {/* Columna izquierda: Lista de productos */}
        <div className="cart-items-column">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-0">
              <div className="cart-items">
                {cartItems.map(item => (
                  <CartItem
                    key={item.id}
                    product={item}
                    onIncrement={() => {
                      console.log("Intentando incrementar:", item.id);
                      increaseQuantity(item.id);
                    }}
                    onDecrement={() => {
                      console.log("Intentando decrementar:", item.id);
                      decreaseQuantity(item.id);
                    }}
                    onRemove={() => removeFromCart(item.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Resumen y acciones */}
        <div className="cart-summary-column">
          {/* Resumen del carrito */}
          <CartTotal items={cartItems} />

          {/* Botón de checkout */}
          <div className="d-grid mb-4">
            <button
              className="btn btn-green-checkout w-100"
              onClick={handleCheckout}
              disabled={hasOutOfStockItems}
            >
              <i className="bi bi-credit-card me-2"></i>
              Proceder al pago
            </button>

            <div className="text-center mt-3">
              <button
                className="btn btn-link text-muted text-decoration-none"
                onClick={() => navigate('/shop')}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Continuar comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};