import { useCart } from '../hooks/useCart';
import '../styles/cartButton.css';
import { ensureShippingProperties } from '../../../services/productServices.js';

/**
 * Botón de carrito elegante y minimalista
 */
export const CartButton = ({ product, disabled = false, quantity = 1 }) => {

  const { addToCart, isInCart } = useCart();

  const handleClick = e => {
    e.stopPropagation();
    if (!disabled) {
      // Preparar el producto para asegurar que todas las propiedades se mantienen
      // y garantizar que las propiedades de envío estén presentes
      const productToAdd = ensureShippingProperties({...product}, 'CartButton');
      
      // Verificar explícitamente propiedades de envío
      console.log('Agregando producto completo al carrito con propiedades:', {
        id: productToAdd.id,
        name: productToAdd.name,
        shippingRuleId: productToAdd.shippingRuleId,
        shippingRuleIds: productToAdd.shippingRuleIds,
        propiedades: Object.keys(productToAdd).filter(key => key.toLowerCase().includes('shipping'))
      });
      
      // Si hay shippingRuleId, asegurarse de que se pase correctamente
      if (productToAdd.shippingRuleId) {
        console.log('Producto con regla de envío individual:', productToAdd.shippingRuleId);
      }
      
      // Si hay shippingRuleIds, asegurarse de que sea un array
      if (productToAdd.shippingRuleIds) {
        if (!Array.isArray(productToAdd.shippingRuleIds)) {
          console.warn('shippingRuleIds no es un array, convirtiendo...');
          // Si es un solo valor, convertirlo a array
          if (typeof productToAdd.shippingRuleIds === 'string') {
            productToAdd.shippingRuleIds = [productToAdd.shippingRuleIds];
          } else {
            // Si no es string ni array, usar shippingRuleId si existe
            productToAdd.shippingRuleIds = productToAdd.shippingRuleId ? [productToAdd.shippingRuleId] : [];
          }
        }
        console.log('Producto con reglas de envío:', productToAdd.shippingRuleIds);
      }
      
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