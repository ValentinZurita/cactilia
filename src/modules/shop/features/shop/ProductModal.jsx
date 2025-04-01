import { useState, useEffect } from "react";
import '../../../shop/styles/productModal.css';
import { ProductImageCarousel } from './ProductModalCarousel.jsx';
import { useCart } from '../cart/hooks/useCart.js';

/**
 * ProductModal component
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

  // Use our cart hook
  const { addToCart } = useCart();

  // Reset quantity and handle image when modal opens/closes
  useEffect(() => {
    if (isOpen && product) {
      // Cuando se abre el modal, configuramos los valores iniciales
      setQuantity(1);
      setAdded(false);
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

  // Handlers for increment/decrement
  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // Add to cart handler
  const handleAddToCartClick = (e) => {
    e.stopPropagation(); // Evitar que se propague el evento
    addToCart(product, quantity);
    setAdded(true);

    // Cerrar el modal después de un tiempo
    setTimeout(() => {
      onClose();
    }, 2000);
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
            {/* Nombre del producto */}
            <h3 className="prod-modal__title">{product.name}</h3>

            {/* Categoría */}
            <div className="prod-modal__category-wrap">
              <span className="prod-modal__category">{product.category || 'Sin categoría'}</span>
              {product.stock === 0 && (
                <span className="prod-modal__stock-label">Sin Stock</span>
              )}
            </div>

            {/* Precio */}
            <p className="prod-modal__price">${product.price.toFixed(2)}</p>

            {/* Descripción */}
            <p className="prod-modal__desc">{product.description || 'Sin descripción disponible'}</p>

            {/* Carrusel de imágenes (solo si hay más de una imagen) */}
            {hasMultipleImages && (
              <div className="prod-modal__carousel-container">
                <h4 className="prod-modal__section-title">Imágenes del producto</h4>
                <ProductImageCarousel
                  images={product.images}
                  onSelectImage={(img) => setCurrentImage(img)}
                />
              </div>
            )}

            {/* Control de cantidad */}
            <div className="prod-modal__quantity-row">
              <div className="prod-modal__quantity">
                <button
                  className="prod-modal__quantity-btn"
                  onClick={handleDecrement}
                  disabled={product.stock === 0}
                >
                  <i className="bi bi-dash"></i>
                </button>
                <span className="prod-modal__quantity-num">{quantity}</span>
                <button
                  className="prod-modal__quantity-btn"
                  onClick={handleIncrement}
                  disabled={product.stock === 0}
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
              <p className="prod-modal__total">Total: ${totalPrice}</p>
            </div>

            {/* Botón de agregar al carrito */}
            <button
              className={`prod-modal__cart-btn ${added ? "prod-modal__cart-btn--added" : ""}`}
              onClick={handleAddToCartClick}
              disabled={added || product.stock === 0}
            >
              <i className="bi bi-cart me-2"></i>
              {product.stock === 0 ? "Sin stock" : added ? "Producto agregado" : "Agregar al Carrito"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};