import React from 'react';
import { useCart } from '../hooks/useCart'; // Ajusta la ruta según tu estructura

/**
 * Botón para agregar productos al carrito
 * Soporta diferentes variantes (botón completo o solo icono)
 *
 * @param {Object} props - Props del componente
 * @param {Object} props.product - Datos del producto
 * @param {string} props.variant - Variante del botón ('button' o 'icon')
 * @param {boolean} props.disabled - Si el botón está deshabilitado
 * @param {number} props.quantity - Cantidad a agregar (por defecto 1)
 */
export const CartButton = ({
                             product,
                             variant = 'button',
                             disabled = false,
                             quantity = 1
                           }) => {
  const { addToCart, isInCart, getItem } = useCart();

  /**
   * Manejador de clic en el botón
   * Detiene la propagación del evento para evitar que se abra el modal
   */
  const handleClick = (e) => {
    // Detener la propagación del evento para evitar que se abra el modal
    e.stopPropagation();
    e.preventDefault();

    console.log("CartButton: Click interceptado y detenido");

    if (!disabled) {
      addToCart(product, quantity);

      // Opcional: Mostrar algún feedback visual como una animación o mensaje
      const button = e.currentTarget;
      button.classList.add('btn-success-pulse');

      // Remover la clase después de la animación
      setTimeout(() => {
        button.classList.remove('btn-success-pulse');
      }, 500);
    }
  };

  // Verificar si el producto ya está en el carrito
  const itemInCart = isInCart ? isInCart(product.id) : false;
  const cartQuantity = itemInCart && getItem ? getItem(product.id)?.quantity : 0;

  // Clases para el botón cuando ya está en el carrito
  const inCartClass = itemInCart ? 'in-cart' : '';

  // Render según la variante
  if (variant === 'icon') {
    return (
      <button
        className={`cart-btn btn btn-outline-success btn-sm ${inCartClass}`}
        onClick={handleClick}
        disabled={disabled}
        aria-label="Agregar al carrito"
        style={{ position: 'relative', zIndex: 20 }} // Asegurar que esté encima para recibir eventos
      >
        <i className="bi bi-cart-plus cart-icon"></i>
        {itemInCart && cartQuantity > 0 && (
          <span className="cart-item-badge">{cartQuantity}</span>
        )}
      </button>
    );
  }

  // Variante por defecto (botón completo)
  return (
    <button
      className={`btn btn-success ${inCartClass}`}
      onClick={handleClick}
      disabled={disabled}
      style={{ position: 'relative', zIndex: 20 }} // Asegurar que esté encima para recibir eventos
    >
      <i className="bi bi-cart-plus me-2"></i>
      {itemInCart ? `En carrito (${cartQuantity})` : 'Agregar al carrito'}
    </button>
  );
};