import { useNavigate } from 'react-router-dom';
import '../../../styles/pages/cart.css';
import { useCart } from '../hooks/useCart.js'
import { CartItem, CartTotal, EmptyCart } from '../components/cart-page/index.js'
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
    // Si el usuario no está autenticado, redirigir a inicio de sesión
    if (status !== 'authenticated') {
      navigate('/auth/login?redirect=checkout');
      return;
    }

    // Si hay productos sin stock, mostrar alerta
    if (hasOutOfStockItems) {
      alert('Hay productos sin stock en tu carrito. Por favor, elimínalos antes de continuar.');
      return;
    }

    // Redirigir a checkout
    navigate('/checkout');
  };

  // Si el carrito está vacío, mostrar componente EmptyCart
  if (cartItems.length === 0) {
    return <EmptyCart onContinueShopping={() => navigate('/shop')} />;
  }

  return (
    <div className="container cart-page pt-5 mt-5">

      {/* Encabezado y botón de regreso */}
      <div className="d-flex align-items-center mb-4">

        {/* Botón de regreso */}
        <button
          className="btn-arrow-back me-3"
          onClick={handleGoBack}
          aria-label="Regresar"
        >
          <i className="bi bi-arrow-left"></i>
        </button>

        {/* Título y cantidad de artículos */}
        <div>
          <h2 className="mb-0 fw-bold">Tu Carrito</h2>
          <p className="text-muted mb-0">
            {itemsCount} {itemsCount === 1 ? 'artículo' : 'artículos'}
          </p>
        </div>

      </div>

      {/* Alerta de productos sin stock */}
      {hasOutOfStockItems && (
        <div className="alert alert-warning mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Hay productos sin stock en tu carrito. Por favor, elimínalos antes de continuar.
        </div>
      )}

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
                    onIncrement={() => increaseQuantity(item.id)}
                    onDecrement={() => decreaseQuantity(item.id)}
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