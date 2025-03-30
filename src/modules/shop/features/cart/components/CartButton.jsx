import { useState } from 'react';
import PropTypes from 'prop-types';
import { useCart } from '../hooks/useCart.js';

/**
 * Reusable cart button that can be used in multiple places
 * with animation feedback
 *
 * @param {Object} props - Component properties
 * @param {Object} props.product - The product to add to cart
 * @param {number} props.quantity - Quantity to add (defaults to 1)
 * @param {string} props.variant - Button style variant: "icon" or "button" (default)
 * @param {string} props.size - Button size: "sm", "md" (default), "lg"
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {string} props.className - Additional CSS classes
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
  const { addToCart } = useCart();
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

CartButton.propTypes = {
  product: PropTypes.object.isRequired,
  quantity: PropTypes.number,
  variant: PropTypes.oneOf(["button", "icon"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  disabled: PropTypes.bool,
  className: PropTypes.string
};