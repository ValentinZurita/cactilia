import { useCart } from '../hooks/useCart';
import '../styles/cartButton.css';
import { ensureShippingProperties, validateAndNormalizeProduct } from '../../../services/productServices.js';

/**
 * Botón de carrito elegante y minimalista
 */
export const CartButton = ({ product, disabled = false, quantity = 1 }) => {

  const { addToCart, isInCart } = useCart();

  const handleClick = e => {
    e.stopPropagation();
    if (!disabled) {
      // Validar y normalizar el producto primero
      const { product: validatedProduct, valid } = validateAndNormalizeProduct(product);
      
      if (!valid) {
        console.warn(`⚠️ Producto con datos incompletos. Se intentará añadir de todas formas.`);
      }
      
      // Aplicar garantías adicionales de propiedades de envío
      const productToAdd = ensureShippingProperties(validatedProduct, 'CartButton');
      
      // Log simplificado con información esencial
      console.log(`🛒 Añadiendo al carrito: "${productToAdd.name}" (${productToAdd.id})`);
      
      addToCart(productToAdd, quantity);

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