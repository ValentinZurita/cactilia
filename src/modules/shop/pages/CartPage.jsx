import { useNavigate } from 'react-router-dom';
import '../../../styles/pages/cart.css';
import { useCartPageLogic } from '../features/cart/hooks/useCartPageLogic.js'
import { CartPageContainer } from '../features/cart/components/CartPageContainer.jsx'

/**
 * CartPage - Página principal del carrito de compras
 *
 * Muestra los productos añadidos al carrito, permite modificar cantidades
 * y proceder al checkout cuando el usuario está listo para finalizar la compra.
 *
 * @returns {JSX.Element} Página completa del carrito
 */
export const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartLogic,
    uiState
  } = useCartPageLogic();

  // Si el carrito está vacío, mostrar componente de carrito vacío
  if (cartItems.length === 0) {
    return (
      <CartPageContainer.EmptyCart
        onContinueShopping={() => navigate('/shop')}
      />
    );
  }

  return (
    <CartPageContainer
      title="Tu Carrito"
      itemCount={cartLogic.itemsCount}
      onGoBack={() => navigate(-1)}
      onCheckout={cartLogic.handleCheckout}
      isCheckoutDisabled={cartLogic.hasStockIssues || uiState.isValidating}
      isValidating={uiState.isValidating}
      items={cartItems}
      onIncreaseQuantity={cartLogic.increaseQuantity}
      onDecreaseQuantity={cartLogic.decreaseQuantity}
      onRemoveItem={cartLogic.removeFromCart}
    />
  );
};