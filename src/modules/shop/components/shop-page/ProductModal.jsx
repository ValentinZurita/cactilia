import { useState, useEffect } from "react";
import '../../../../styles/pages/shop.css';
import { ProductImageCarousel } from './ProductModalCarousel.jsx';
import { useCart } from '../../../user/hooks/useCart.js';

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
  const [currentImage, setCurrentImage] = useState(product?.mainImage);

  // Use our cart hook
  const { addToCart } = useCart();

  // Reset quantity when modal opens
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setAdded(false);
      setCurrentImage(product.mainImage);
    }
  }, [isOpen, product]);

  // If modal is not open or product is not set, return null
  if (!isOpen || !product) return null;

  // Handle clicking outside of modal
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  // Handlers for increment/decrement
  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // Add to cart handler
  const handleAddToCartClick = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(onClose, 2000);
  };

  // Calculate total
  const totalPrice = (product.price * quantity).toFixed(2);


  return (

    <div className="modal-backdrop" onClick={handleBackdropClick}>

      {/* Modal container */}
      <div className="modal-container">

        {/* Close button */}
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Product image */}
        <div className="modal-img-container fixed-size">
          <img src={currentImage} alt={product.name} className="modal-img" />
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
            <ProductImageCarousel images={product.images} onSelectImage={(img) => setCurrentImage(img)} />

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

          </div>
        </div>
      </div>
    </div>
  );
};