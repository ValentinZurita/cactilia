import { useCart } from '../cart/hooks/useCart.js'

/**
 * Component to display the product's status in the cart
 * Shows a small badge if the product is already in the cart
 *
 * @param {Object} props
 * @param {string} props.productId - The product ID to check
 * @param {string} props.className - Additional classes
 */

export const ProductStatus = ({ productId, className = '' }) => {

  // Use our custom cart hook
  const { isInCart, getItem } = useCart();

  // Check if product is in cart
  if (!isInCart(productId)) {
    return null;
  }

  // Get item from cart to display quantity
  const cartItem = getItem(productId);


  return (

    // Badge to show product is in cart
    <div className={`product-in-cart-badge ${className}`}>

      {/* Badge */}
      <span className="badge bg-success-subtle text-success px-2 py-1">
        <i className="bi bi-cart-check me-1"></i>
        En carrito{cartItem?.quantity > 1 ? ` (${cartItem.quantity})` : ''}
      </span>

    </div>
  );
};