import { useState, useEffect } from "react";
import '../../../../styles/pages/shop.css';
import { ProductImageCarousel } from './ProductModalCarousel.jsx';
import { useCart } from '../cart/hooks/useCart.js';

/**
 * ProductModal component
 * @param {Object} product - The currently selected product
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Function to close the modal
 */
export const ProductModal = ({ product, isOpen, onClose }) => {
  console.log("ProductModal props:", { isOpen, product: product?.name });

  // Local state
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Use our cart hook
  const { addToCart } = useCart();

  // Reset quantity and handle image when modal opens/closes
  useEffect(() => {
    console.log("useEffect triggered, isOpen:", isOpen);

    if (isOpen && product) {
      // Cuando se abre el modal, configuramos los valores iniciales
      setQuantity(1);
      setAdded(false);
      setCurrentImage(product.mainImage);

      // Aseguramos que el modal sea visible después de un pequeño retraso
      // para permitir que el DOM se actualice
      setTimeout(() => {
        setModalVisible(true);
        document.body.style.overflow = 'hidden'; // Prevenir scroll del body cuando el modal está abierto
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
    console.log("Modal no renderizado - isOpen:", isOpen, "product:", product ? true : false);
    return null;
  }

  console.log("Renderizando modal con producto:", product.name);

  // Handle clicking outside of modal
  const handleBackdropClick = (e) => {
    console.log("Backdrop click - target:", e.target.classList.contains('modal-backdrop'));
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  // Handlers for increment/decrement
  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // Add to cart handler
  const handleAddToCartClick = (e) => {
    // Evitar que se propague el evento (por si acaso)
    e.stopPropagation();

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
  const modalVisibilityClass = modalVisible ? 'modal-visible' : 'modal-hidden';

  return (
    <div
      className={`modal-backdrop ${modalVisibilityClass}`}
      onClick={handleBackdropClick}
      style={{
        display: 'flex', // Garantizar que sea flex
        position: 'fixed', // Garantizar que sea fixed
        zIndex: 9999,    // Alto z-index
      }}
    >
      {/* Modal container */}
      <div
        className="modal-container"
        style={{
          position: 'relative',
          zIndex: 10000, // Mayor que el backdrop
          backgroundColor: 'white', // Garantizar que sea visible
          display: 'flex'
        }}
        onClick={(e) => e.stopPropagation()} // Evitar cierre accidental
      >
        {/* Close button */}
        <button
          className="modal-close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            zIndex: 10001 // Mayor que el contenedor
          }}
        >
          ✕
        </button>

        {/* Product image */}
        <div className="modal-img-container">
          <img
            src={currentImage || product.mainImage}
            alt={product.name}
            className="modal-img"
          />
        </div>

        {/* Modal content */}
        <div className="modal-content">
          <div className="modal-details">
            {/* Product name */}
            <h3 className="modal-title">{product.name}</h3>

            {/* Category */}
            <div className="modal-category-container">
              <p className="modal-category">{product.category || 'Sin categoría'}</p>
              {product.stock === 0 && (
                <span className="stock-label">Sin Stock</span>
              )}
            </div>

            {/* Price */}
            <p className="modal-price">${product.price.toFixed(2)}</p>

            {/* Description */}
            <p className="modal-desc">{product.description || 'Sin descripción disponible'}</p>

            {/* Image carousel */}
            {product.images && product.images.length > 0 && (
              <ProductImageCarousel
                images={product.images}
                onSelectImage={(img) => setCurrentImage(img)}
              />
            )}

            {/* Quantity controls */}
            <div className="modal-quantity-row">
              <div className="modal-quantity">
                <button className="quantity-btn" onClick={handleDecrement} disabled={product.stock === 0}>
                  <i className="bi bi-dash"></i>
                </button>
                <span className="quantity-number">{quantity}</span>
                <button className="quantity-btn" onClick={handleIncrement} disabled={product.stock === 0}>
                  <i className="bi bi-plus"></i>
                </button>
              </div>
              <p className="modal-total">Total: ${totalPrice}</p>
            </div>

            {/* Add to cart button */}
            <button
              className={`btn btn-green-lg d-flex align-items-center ${added ? "btn-added" : ""}`}
              onClick={handleAddToCartClick}
              disabled={added || product.stock === 0}
            >
              <i className="bi bi-cart me-2"></i>
              {product.stock === 0 ? "Sin stock" : added ? "Producto agregado" : "Agregar al Carrito"}
            </button>

            {/* Botón para depuración */}
            <button
              className="btn btn-sm btn-warning mt-2"
              onClick={() => console.log("Estado del modal:", {
                isOpen,
                product: product?.name,
                quantity,
                added,
                modalVisible,
                currentImage
              })}
            >
              Debug: Log Modal State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};