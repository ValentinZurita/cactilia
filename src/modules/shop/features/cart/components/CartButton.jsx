import { useState } from 'react';
import { useCart } from '../hooks/useCart.js';
import '../../../../../styles/pages/shop.css';


/**
 * Reusable cart button that can be used in multiple places
 * with animation feedback
 *
 * @param {Object} product - The product to add to cart
 * @param {number} quantity - Quantity to add (defaults to 1)
 * @param {string} variant - Button style variant: "icon" or "button" (default)
 * @param {string} size - Button size: "sm", "md" (default), "lg"
 * @returns {JSX.Element}
 */

export const CartButton = ({
                             product,
                             quantity = 1,
                             variant = "button",
                             size = "md",
                             disabled = false,
                             className = "",
                           }) => {

  // Use our custom cart hook
  const { addToCart } = useCart();

  // Local state
  const [adding, setAdding] = useState(false);

  // Handle adding to cart
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling

    if (disabled || adding) return;

    // Add to cart
    addToCart(product, quantity);

    // Show animation
    setAdding(true);
    setTimeout(() => setAdding(false), 500);
  };

  // Size classes
  const sizeClasses = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };

  // If icon variant
  if (variant === "icon") {
    return (
      <button
        className={`btn cart-btn ${adding ? 'adding' : ''} ${sizeClasses[size]} ${className}`}
        disabled={disabled}
        onClick={handleClick}
        aria-label="Agregar al carrito"
      >
        <i className="bi bi-cart cart-icon"></i>
      </button>
    );
  }

  // Default button variant
  return (

    <button
      className={`btn btn-green-lg ${adding ? 'btn-added' : ''} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      onClick={handleClick}
    >
      <i className="bi bi-cart me-2"></i>
      {disabled ? "Sin stock" : adding ? "¡Agregado!" : "Agregar al carrito"}
    </button>

  );
};