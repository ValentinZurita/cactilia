import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useCart } from '../hooks/useCart.js';

/**
 * Botón reutilizable para añadir productos al carrito
 * con retroalimentación visual y validación de stock
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.product - El producto a añadir al carrito
 * @param {number} props.quantity - Cantidad a añadir (por defecto: 1)
 * @param {string} props.variant - Variante de estilo: "icon" o "button" (por defecto)
 * @param {string} props.size - Tamaño del botón: "sm", "md" (por defecto), "lg"
 * @param {boolean} props.disabled - Si el botón está deshabilitado
 * @param {string} props.className - Clases CSS adicionales
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
  const { addToCart, isInCart, getItem } = useCart();
  const [adding, setAdding] = useState(false);

  // Verificar stock disponible
  const hasStock = product && product.stock > 0;
  const isDisabled = disabled || !hasStock;

  // Verificar si está en el carrito y si tiene stock suficiente
  const cartItem = isInCart(product?.id) ? getItem(product.id) : null;
  let stockWarning = null;

  if (cartItem) {
    const totalQuantity = cartItem.quantity + quantity;
    if (totalQuantity > product.stock) {
      stockWarning = `Stock máximo: ${product.stock}`;
    }
  }

  // Manejar clic en el botón
  const handleClick = useCallback((e) => {
    e.stopPropagation(); // Prevenir propagación de eventos

    if (isDisabled || adding) return;

    // Si ya está en el carrito y excedería el stock, no hacer nada
    if (stockWarning) return;

    // Añadir al carrito
    addToCart(product, quantity);

    // Mostrar animación de retroalimentación
    setAdding(true);
    setTimeout(() => setAdding(false), 800);
  }, [isDisabled, adding, stockWarning, addToCart, product, quantity]);

  // Clases de tamaño
  const sizeClasses = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };

  // Versión de icono
  if (variant === "icon") {
    return (
      <button
        className={`btn cart-btn ${adding ? 'adding' : ''} ${sizeClasses[size]} ${className}`}
        disabled={isDisabled || !!stockWarning}
        onClick={handleClick}
        aria-label="Agregar al carrito"
        title={
          !hasStock
            ? "Sin stock disponible"
            : stockWarning
              ? stockWarning
              : "Agregar al carrito"
        }
      >
        <i className="bi bi-cart cart-icon"></i>
      </button>
    );
  }

  // Versión de botón completo
  return (
    <button
      className={`btn btn-green-lg ${adding ? 'btn-added' : ''} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled || !!stockWarning}
      onClick={handleClick}
      title={stockWarning || ""}
    >
      <i className="bi bi-cart me-2"></i>
      {!hasStock ? (
        "Sin stock"
      ) : stockWarning ? (
        stockWarning
      ) : adding ? (
        "¡Agregado!"
      ) : (
        "Agregar al carrito"
      )}
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