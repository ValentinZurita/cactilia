import React from 'react';
import { ProductImageCarousel } from './ProductModalCarousel';
import { ImageComponent } from '../../../../shared/components/images/ImageComponent.jsx';
import { useModalVisibility } from '../../hooks/useModalVisibility';
import { useProductModal } from '../../hooks/useProductModal';
import '../../../shop/styles/productModal.css';

// Componente Presentacional: Quantity Selector
const QuantitySelector = ({ quantity, stockError, isOutOfStock, handleIncrement, handleDecrement }) => (
  <div className="prod-modal__quantity">
    <label htmlFor="quantity" className="form-label">Cantidad:</label>
    <div className="input-group">
      <button 
        className="btn btn-outline-secondary" 
        type="button" 
        onClick={handleDecrement} 
        disabled={quantity <= 1 || isOutOfStock}
      >
        -
      </button>
      <input 
        type="text" 
        className="form-control text-center" 
        id="quantity" 
        value={quantity} 
        readOnly 
      />
      <button 
        className="btn btn-outline-secondary" 
        type="button" 
        onClick={handleIncrement} 
        disabled={isOutOfStock}
      >
        +
      </button>
    </div>
    {stockError && <div className="text-danger mt-2">{stockError}</div>}
  </div>
);

// Componente Presentacional: Add To Cart Button
const AddToCartButton = ({ added, isOutOfStock, quantity, totalPrice, handleAddToCartClick }) => {
  const getButtonText = () => {
    if (isOutOfStock || quantity <= 0) return 'Sin stock';
    if (added) return 'Producto agregado';
    return `Agregar ($${totalPrice})`;
  };

  const isButtonDisabled = added || isOutOfStock || quantity <= 0;

  return (
    <button
      className={`btn ${added ? 'btn-success' : 'btn-dark'} w-100 mt-3 prod-modal__add-btn`}
      onClick={handleAddToCartClick}
      disabled={isButtonDisabled}
    >
      {getButtonText()}
    </button>
  );
};

// Componente Principal Refactorizado
export const ProductModal = ({ product, isOpen, onClose }) => {
  const modalVisible = useModalVisibility(isOpen, product);
  const {
    quantity,
    added,
    stockError,
    isOutOfStock,
    availableStock, // Use this if needed for display, e.g., "Sólo quedan X"
    totalPrice,
    handleIncrement,
    handleDecrement,
    handleAddToCartClick,
  } = useProductModal(product, isOpen, onClose);

  if (!isOpen || !product) return null;

  const modalClass = modalVisible ? 'prod-modal--visible' : 'prod-modal--hidden';
  const hasMultipleImages = product.images?.length > 1;

  return (
    <div
      className={`prod-modal__backdrop ${modalClass}`}
      onClick={(e) => {
        // Close only if backdrop itself is clicked
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
          <div className="prod-modal__image-col">
            {hasMultipleImages ? (
              <ProductImageCarousel images={product.images} alt={product.name} />
            ) : (
              <ImageComponent 
                src={product.mainImage} 
                alt={product.name} 
                className="img-fluid rounded"
              />
            )}
            {/* Badges de Stock */}
            {isOutOfStock && (
                <span className="position-absolute top-0 start-0 m-2 badge bg-danger">Agotado</span>
            )}
            {!isOutOfStock && availableStock > 0 && availableStock <= 5 && (
                <span className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark">¡Solo {availableStock} disponibles!</span>
            )}
          </div>

          {/* Columna de Detalles */}
          <div className="prod-modal__details-col">
            <h2 id="product-modal-title" className="prod-modal__title">{product.name}</h2>
            <p className="prod-modal__description">{product.description || 'Descripción no disponible.'}</p>
            <p className="prod-modal__price">${product.price.toFixed(2)}</p>
            
            <QuantitySelector 
              quantity={quantity}
              stockError={stockError}
              isOutOfStock={isOutOfStock}
              handleIncrement={handleIncrement}
              handleDecrement={handleDecrement}
            />

            <AddToCartButton 
              added={added}
              isOutOfStock={isOutOfStock}
              quantity={quantity}
              totalPrice={totalPrice}
              handleAddToCartClick={handleAddToCartClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};