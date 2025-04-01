import { useState, useEffect } from "react";
import '../../../shop/styles/productModal.css';
import { ProductImageCarousel } from './ProductModalCarousel.jsx';
import { useCart } from '../cart/hooks/useCart.js';

/**
 * ProductModal component - Optimizado para móvil
 * @param {Object} product - The currently selected product
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Function to close the modal
 */
export const ProductModal = ({ product, isOpen, onClose }) => {
  // Local state
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [stockError, setStockError] = useState(null);

  // Use cart hook
  const { addToCart, isInCart, getItem } = useCart();

  // Reset quantity and handle image when modal opens/closes
  useEffect(() => {
    if (isOpen && product) {
      // Cuando se abre el modal, configuramos los valores iniciales
      setQuantity(1);
      setAdded(false);
      setStockError(null);
      setCurrentImage(product.mainImage);

      // Aseguramos que el modal sea visible después de un pequeño retraso
      setTimeout(() => {
        setModalVisible(true);
        document.body.style.overflow = 'hidden';
      }, 10);
    } else {
      // Cuando se cierra el modal, ocultamos primero visualmente
      setModalVisible(false);

      // Devolvemos el scroll al body
      document.body.style.overflow = '';
    }

    // Cleanup function para asegurar que el scroll se restaure
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, product]);

  // Si modal is not open or product is not set, return null
  if (!isOpen || !product) {
    return null;
  }

  // Handle clicking outside of modal
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('prod-modal__backdrop')) {
      onClose();
    }
  };

  // Verificamos stock disponible
  const productStock = product.stock || 0;
  const isOutOfStock = productStock === 0;

  // Verificar si el producto ya está en el carrito
  const itemInCart = isInCart ? isInCart(product.id) : false;
  const cartQuantity = itemInCart && getItem ? getItem(product.id)?.quantity || 0 : 0;

  // Verificar si se puede incrementar considerando el carrito actual
  const canIncrement = productStock > 0 && (quantity + cartQuantity) < productStock;

  // Handlers for increment/decrement
  const handleIncrement = () => {
    if (canIncrement) {
      setQuantity((q) => q + 1);
      setStockError(null);
    } else {
      // Si llega al límite, mostrar mensaje de error
      const remainingStock = Math.max(0, productStock - cartQuantity);
      if (remainingStock > 0) {
        setStockError(`Solo puedes agregar ${remainingStock} unidad(es) más. Ya tienes ${cartQuantity} en tu carrito.`);
      } else {
        setStockError(`No puedes agregar más unidades. Ya tienes ${cartQuantity} en tu carrito.`);
      }
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
      setStockError(null);
    }
  };

  // Add to cart handler
  const handleAddToCartClick = async (e) => {
    e.stopPropagation(); // Evitar que se propague el evento

    // Validar stock antes de agregar al carrito
    if (isOutOfStock) {
      setStockError("Este producto está agotado");
      return;
    }

    // Verificar stock considerando lo que ya está en el carrito
    if (quantity + cartQuantity > productStock) {
      const remainingStock = Math.max(0, productStock - cartQuantity);
      if (remainingStock > 0) {
        setStockError(`Solo puedes agregar ${remainingStock} unidad(es) más. Ya tienes ${cartQuantity} en tu carrito.`);
      } else {
        setStockError(`No puedes agregar más unidades. Ya tienes ${cartQuantity} en tu carrito.`);
      }
      return;
    }

    // Agregar al carrito usando la función del hook
    const result = await addToCart(product, quantity);

    if (result && result.success) {
      setAdded(true);
      setStockError(null);

      // Cerrar el modal después de un tiempo
      setTimeout(() => {
        onClose();
      }, 2000);
    } else if (result && !result.success) {
      // Mostrar mensaje de error del resultado
      setStockError(result.message || "Error al agregar al carrito");
    }
  };

  // Calculate total
  const totalPrice = (product.price * quantity).toFixed(2);

  // Clase adicional para controlar la visibilidad del modal con CSS
  const modalVisibilityClass = modalVisible ? 'prod-modal--visible' : 'prod-modal--hidden';

  // Verificar si hay suficientes imágenes para mostrar el carrusel
  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div
      className={`prod-modal__backdrop ${modalVisibilityClass}`}
      onClick={handleBackdropClick}
    >
      <div className="prod-modal__container">
        {/* Botón de cierre */}
        <button className="prod-modal__close" onClick={onClose}>
          ✕
        </button>

        {/* Contenedor interno */}
        <div className="prod-modal__inner-container">
          {/* Contenedor de la imagen */}
          <div className="prod-modal__image-wrap">
            <img
              src={currentImage || product.mainImage}
              alt={product.name}
              className="prod-modal__image"
            />
          </div>

          {/* Contenedor del contenido */}
          <div className="prod-modal__content">
            <div className="prod-modal__details">
              {/* Nombre del producto (ahora sin margen inferior en móvil) */}
              <h3 className="prod-modal__title">{product.name}</h3>

              {/* Categoría (ahora junto al título en móvil) */}
              <div className="prod-modal__category-wrap">
                <span className="prod-modal__category">{product.category || 'Sin categoría'}</span>
                {isOutOfStock && (
                  <span className="prod-modal__stock-label">Sin Stock</span>
                )}
                {!isOutOfStock && productStock <= 5 && (
                  <span className="prod-modal__stock-limited">¡Quedan solo {productStock}!</span>
                )}
              </div>

              {/* Precio */}
              <p className="prod-modal__price">${product.price.toFixed(2)}</p>

              {/* Descripción */}
              <p className="prod-modal__desc">{product.description || 'Sin descripción disponible'}</p>

              {/* Carrusel de imágenes (solo si hay más de una imagen) */}
              {hasMultipleImages && (
                <div className="prod-modal__carousel-container">
                  {/* Título opcional (ahora oculto en móvil) */}
                  <h4 className="prod-modal__section-title">Imágenes del producto</h4>
                  <ProductImageCarousel
                    images={product.images}
                    onSelectImage={(img) => setCurrentImage(img)}
                  />
                </div>
              )}

              {/* Mensaje de error de stock */}
              {stockError && (
                <div className="prod-modal__stock-error">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {stockError}
                </div>
              )}

              {/* Control de cantidad (simplificado en móvil) */}
              <div className="prod-modal__quantity-row">
                <div className="prod-modal__quantity">
                  <button
                    className="prod-modal__quantity-btn"
                    onClick={handleDecrement}
                    disabled={isOutOfStock || quantity <= 1}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <span className="prod-modal__quantity-num">{quantity}</span>
                  <button
                    className="prod-modal__quantity-btn"
                    onClick={handleIncrement}
                    disabled={isOutOfStock || !canIncrement}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
                <p className="prod-modal__total">Total: ${totalPrice}</p>
              </div>

              {/* Info de carrito si el producto ya está en el carrito */}
              {itemInCart && (
                <div className="prod-modal__cart-info">
                  <i className="bi bi-cart-check me-2"></i>
                  Ya tienes {cartQuantity} {cartQuantity === 1 ? 'unidad' : 'unidades'} en tu carrito
                </div>
              )}

              {/* Botón de agregar al carrito */}
              <button
                className={`prod-modal__cart-btn ${added ? "prod-modal__cart-btn--added" : ""}`}
                onClick={handleAddToCartClick}
                disabled={added || isOutOfStock || (productStock > 0 && quantity + cartQuantity > productStock)}
              >
                <i className="bi bi-cart me-2"></i>
                {isOutOfStock ? "Sin stock" :
                  added ? "Producto agregado" :
                    "Agregar al Carrito"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};