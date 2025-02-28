import { useNavigate } from 'react-router-dom';
import '../../../styles/pages/cart.css';
import { useCart } from '../hooks/useCart.js'
import { CartItem, CartTotal, EmptyCart } from '../components/cart-page/index.js'

export const CartPage = () => {
  const navigate = useNavigate();
  const {
    items: cartItems,
    itemsCount,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCheckout = () => {
    // Para implementación posterior
    alert('Procesando checkout... Esta funcionalidad se implementará pronto.');
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
            >
              <i className="bi bi-credit-card me-2"></i>
              Proceder al pago
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};