import React, { useState, useEffect } from 'react';
import { ProductImageCarousel } from './ProductModalCarousel';
import { ImageComponent } from '../../../../shared/components/images/ImageComponent.jsx';
import { useModalVisibility } from '../../hooks/useModalVisibility';
import { useProductModal } from '../../hooks/useProductModal';
import '../../styles/productModal.css';

// Componente Principal Refactorizado
export const ProductModal = ({ product, isOpen, onClose }) => {

  const [currentImage, setCurrentImage] = useState(null);
  const modalVisible = useModalVisibility(isOpen, product);
  const {
    quantity,
    added,
    stockError,
    isOutOfStock,
    availableStock,
    totalPrice,
    handleIncrement,
    handleDecrement,
    handleAddToCartClick,
  } = useProductModal(product, isOpen, onClose);

  useEffect(() => {
    if (isOpen && product) {
      // Revertido: Usa mainImage directamente como antes
      setCurrentImage(product.mainImage); 
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const modalClass = modalVisible ? 'prod-modal--visible' : 'prod-modal--hidden';

  const hasMultipleImages = product && Array.isArray(product.images) && product.images.length > 1;

  const handleThumbnailSelect = (img) => {
    setCurrentImage(img);
  };

  const getButtonText = () => {
    if (isOutOfStock || quantity <= 0) return 'Sin stock';
    if (added) return 'Producto agregado';
    // Usar totalPrice del hook
    return `Agregar ($${totalPrice})`; 
  };

  const isButtonDisabled = added || isOutOfStock || quantity <= 0;

  return (
    <div
      className={`prod-modal__backdrop ${modalClass}`}
      onClick={(e) => {
        // Cerrar solo si se hace clic en el fondo mismo
        if (e.target === e.currentTarget) onClose(); 
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      aria-hidden={!isOpen}
    >
      <div className="prod-modal__container">
        <button 
          className="prod-modal__close" 
          onClick={onClose} 
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <div className="prod-modal__inner-container">
          {/* Columna de Imagen */}
          <div className="prod-modal__image-wrap">
            <ImageComponent 
              // Revertido: Usa mainImage como fallback si currentImage es null
              src={currentImage || product.mainImage} 
              alt={product.name} 
              className="prod-modal__image"
            />
            {/* Badges de stock mantenidos como estaban en el estado intermedio */}
            {isOutOfStock && (
                <span className="position-absolute top-0 start-0 m-2 badge bg-danger">Agotado</span>
            )}
            {!isOutOfStock && availableStock > 0 && availableStock <= 5 && (
                <span className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark">¡Solo {availableStock} disponibles!</span>
            )}
          </div>

          {/* Columna de Detalles */}
          <div className="prod-modal__content">
            <div className="prod-modal__details">
              {/* Revertido a h3 y añadido el contenedor de categoría/stock */}
              <h3 id="product-modal-title" className="prod-modal__title">{product.name}</h3>
              
              <div className="prod-modal__category-wrap">
                <span className="prod-modal__category">{product.category || 'Sin categoría'}</span>
                {isOutOfStock && (
                  <span className="prod-modal__stock-label">Sin Stock</span>
                )}
                {!isOutOfStock && availableStock > 0 && availableStock <= 5 && (
                  <span className="prod-modal__stock-limited">
                    ¡Quedan solo {availableStock}!
                  </span>
                )}
              </div>

              <p className="prod-modal__price">${product.price.toFixed(2)}</p>
              <p className="prod-modal__desc">{product.description || 'Sin descripción disponible'}</p>

              {/* Carrusel: Revertido a pasar product.images directamente */}
              {hasMultipleImages && (
                <div className="prod-modal__carousel-container">
                  <ProductImageCarousel
                    images={product.images} // Pasa el array original
                    onSelectImage={handleThumbnailSelect} // Pasa la función original
                  />
                </div>
              )}

              {/* Visualización de error de stock */} 
              {stockError && (
                <div className="prod-modal__stock-error">
                  {/* Considerar añadir icono si se desea: <i className="bi bi-exclamation-triangle me-2"></i> */}
                  {stockError}
                </div>
              )}

              {/* Estructura de fila de cantidad restaurada, conectada al hook */}
              <div className="prod-modal__quantity-row">
                <div className="prod-modal__quantity">
                  <button
                    className="prod-modal__quantity-btn"
                    onClick={handleDecrement}
                    disabled={isOutOfStock || quantity <= 1}
                  >
                    - {/* Considerar usar icono: <i className="bi bi-dash" /> */}
                  </button>
                  <span className="prod-modal__quantity-num">{quantity}</span>
                  <button
                    className="prod-modal__quantity-btn"
                    onClick={handleIncrement}
                    disabled={isOutOfStock || quantity >= availableStock}
                  >
                    + {/* Considerar usar icono: <i className="bi bi-plus" /> */}
                  </button>
                </div>
                {/* Usar totalPrice del hook */}
                <p className="prod-modal__total">Total: ${totalPrice}</p> 
              </div>

              {/* Estructura de botón de carrito restaurada, conectada al hook */}
              <button
                className={`prod-modal__cart-btn ${added ? 'prod-modal__cart-btn--added' : ''}`}
                onClick={handleAddToCartClick}
                disabled={isButtonDisabled}
              >
                {/* Considerar añadir icono: <i className="bi bi-cart me-2" /> */}
                {getButtonText()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};