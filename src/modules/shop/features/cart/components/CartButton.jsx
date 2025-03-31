// src/modules/shop/features/cart/components/CartButton.jsx
import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useCart } from '../hooks/useCart.js';
import '../styles/cartButton.css';

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
  const [validating, setValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Verificar stock disponible
  const hasStock = product && product.stock > 0;
  const isDisabled = disabled || !hasStock || validating;

  // Verificar si está en el carrito y si tiene stock suficiente
  const cartItem = isInCart(product?.id) ? getItem(product.id) : null;
  const [stockWarning, setStockWarning] = useState(null);

  // Actualizar el estado de stock cuando cambia el carrito
  useEffect(() => {
    if (product && cartItem) {
      const totalQuantity = cartItem.quantity + quantity;
      if (product.stock <= 0) {
        setStockWarning('Sin stock disponible');
      } else if (totalQuantity > product.stock) {
        setStockWarning(`Solo quedan ${product.stock} unidades disponibles`);
      } else {
        setStockWarning(null);
      }
    } else if (product && product.stock <= 0) {
      setStockWarning('Sin stock disponible');
    } else {
      setStockWarning(null);
    }
  }, [product, cartItem, quantity]);

  // Manejar clic en el botón
  const handleClick = useCallback(async (e) => {
    e.stopPropagation(); // Prevenir propagación de eventos

    if (isDisabled || adding) return;

    // Si ya está en el carrito y excedería el stock, no hacer nada
    if (stockWarning) {
      setErrorMessage(stockWarning);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    try {
      // Mostrar indicador de validación
      setValidating(true);

      // Añadir al carrito con validación en tiempo real
      const result = await addToCart(product, quantity);

      if (result.success) {
        // Mostrar animación de retroalimentación
        setAdding(true);
        setTimeout(() => setAdding(false), 800);
      } else {
        // Mostrar mensaje de error
        setErrorMessage(result.message);
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      setErrorMessage('Error al agregar al carrito. Intente nuevamente.');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setValidating(false);
    }
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
      <div className="cart-btn-container position-relative">
        <button
          className={`btn cart-btn ${adding ? 'adding' : ''} ${sizeClasses[size]} ${className}`}
          disabled={isDisabled || !!stockWarning}
          onClick={handleClick}
          aria-label="Agregar al carrito"
          title={
            validating ? "Verificando disponibilidad..." :
              !hasStock ? "Sin stock disponible" :
                stockWarning ? stockWarning :
                  "Agregar al carrito"
          }
        >
          {validating ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            <i className="bi bi-cart cart-icon"></i>
          )}
        </button>

        {errorMessage && (
          <div className="stock-tooltip">
            {errorMessage}
          </div>
        )}
      </div>
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
      {validating ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Verificando...
        </>
      ) : (
        <>
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
        </>
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