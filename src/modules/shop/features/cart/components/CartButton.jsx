import { useCart } from '../hooks/useCart';
import '../styles/cartButton.css';

/**
 * Botón de carrito elegante y minimalista
 */
export const CartButton = ({ product, disabled = false, quantity = 1 }) => {

  const { addToCart, isInCart } = useCart();

  const handleClick = e => {
    e.stopPropagation();
    if (!disabled) {
      addToCart(product, quantity);

      // Efecto visual sutil
      const button = e.currentTarget;
      button.classList.add('button-clicked');
      setTimeout(() => button.classList.remove('button-clicked'), 300);
    }
  };

  return (
    <button
      className={`add-to-cart ${isInCart(product.id) ? 'in-cart' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label="Agregar al carrito"
    >
      <i className="bi bi-cart-plus"></i>
    </button>
  );
};