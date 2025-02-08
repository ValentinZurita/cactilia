import { useState, useEffect } from "react";
import '../../../../styles/pages/shop.css'

/**
 * ProductModal component
 * @param {Object} product - The currently selected product
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Function to close the modal
 * @param {Function} onAddToCart - Function to add the product to cart
 */

export const ProductModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setAdded(false);
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCartClick = () => {
    // Agrega el producto al carrito
    onAddToCart(product, quantity);
    // Cambia el estado para actualizar el texto y animar el botón
    setAdded(true);
    // Opcional: Cierra el modal después de 2 segundos
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  // Cálculo del total
  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">


        {/* Botón de cerrar */}
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>


        {/* Imagen del producto (100% visible) */}
        <div className="modal-img-container">
          <img src={product.image} alt={product.title} className="modal-img" />
        </div>


        {/* Contenido del modal con transparencia leve en el área de detalles */}
        <div className="modal-content">
          <div className="modal-details">
            {/* Título del producto */}
            <h3 className="modal-title">{product.title}</h3>
            {/* Categoría (con estilo ya definido previamente) */}
            <p className="modal-category">{product.category}</p>
            {/* Precio */}
            <p className="modal-price">${product.price.toFixed(2)}</p>
            {/* Descripción */}
            <p className="modal-desc">
              {product.desc || 'Sin descripción disponible'}
            </p>


            {/* Fila para controles de cantidad y total */}
            <div className="modal-quantity-row">
              <div className="modal-quantity">
                <button className="quantity-btn" onClick={handleDecrement}>
                  <i className="bi bi-dash"></i>
                </button>
                <span className="quantity-number">{quantity}</span>
                <button className="quantity-btn" onClick={handleIncrement}>
                  <i className="bi bi-plus"></i>
                </button>
              </div>
              <p className="modal-total">Total: ${totalPrice}</p>
            </div>


            {/* Botón Agregar al Carrito */}
            <button
              className={`btn btn-green-lg d-flex align-items-center ${added ? "btn-added" : ""}`}
              onClick={handleAddToCartClick}
              disabled={added}  // Opcional: evita múltiples clics mientras se muestra el feedback
            >
              <i className="bi bi-cart me-2"></i>
              {added ? "Producto agregado" : "Agregar al Carrito"}
            </button>


          </div>
        </div>
      </div>
    </div>
  );
};