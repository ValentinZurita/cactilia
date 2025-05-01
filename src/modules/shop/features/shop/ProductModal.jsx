import React, { useState, useEffect } from 'react';
import { ProductImageCarousel } from './ProductModalCarousel';
import { ImageComponent } from '../../../../shared/components/images/ImageComponent.jsx';
import { useModalVisibility } from '../../hooks/useModalVisibility';
import { useProductModal } from '../../hooks/useProductModal';
import '../../styles/productModal.css';

// --- Subcomponentes Internos (Contenido) --- 

// Devuelve el contenido para la columna de imagen
const ModalImageColumnContent = ({ currentImage, productName, isOutOfStock, availableStock }) => (
  <>
    <ImageComponent 
      src={currentImage} 
      alt={productName} 
      className="prod-modal__image"
    />
    {isOutOfStock && (
      <span className="position-absolute top-0 start-0 m-2 badge bg-danger">Agotado</span>
    )}
    {!isOutOfStock && availableStock > 0 && availableStock <= 5 && (
      <span className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark">¡Solo {availableStock} disponibles!</span>
    )}
  </>
);

// Devuelve el contenido de los detalles (sin el div prod-modal__details)
const ModalDetailsContent = ({
  product,
  hasMultipleImages,
  onSelectImage,
  stockError,
  isOutOfStock,
  availableStock,
  quantity, // Necesario para el control de cantidad
  handleDecrement, // Necesario para el control de cantidad
  handleIncrement, // Necesario para el control de cantidad
  totalPrice, // Necesario para el control de cantidad
  added, // Necesario para el botón
  handleAddToCartClick, // Necesario para el botón
  isButtonDisabled, // Necesario para el botón
  getButtonText, // Necesario para el botón
}) => (
  <>
    {/* Título del producto */}
    <h3 id="product-modal-title" className="prod-modal__title">{product.name}</h3>
    
    {/* Categoría y stock */}
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

    {/* Precio */}
    <p className="prod-modal__price">${typeof product.price === 'number' ? product.price.toFixed(2) : '--.--'}</p>

    {/* Descripción */}
    <p className="prod-modal__desc">{product.description || 'Sin descripción disponible'}</p>

    {/* Carrusel */}
    {hasMultipleImages && (
      <div className="prod-modal__carousel-container">
        <ProductImageCarousel
          images={product.images}
          onSelectImage={onSelectImage}
        />
      </div>
    )}

    {/* Visualización de error de stock */} 
    {stockError && (
      <div className="prod-modal__stock-error">
        <i className="bi bi-exclamation-triangle me-2"></i> 
        {stockError}
      </div>
    )}

    {/* Fila de cantidad (Control de cantidad ahora como subcomponente) */}
    <ModalQuantityControlContent 
        quantity={quantity}
        isOutOfStock={isOutOfStock}
        availableStock={availableStock}
        handleDecrement={handleDecrement}
        handleIncrement={handleIncrement}
        totalPrice={totalPrice}
    />

    {/* Botón de carrito (ahora como subcomponente) */}
    <ModalAddToCartButtonContent
        added={added}
        onClick={handleAddToCartClick}
        disabled={isButtonDisabled}
        buttonText={getButtonText()}
    />
  </>
);

// Devuelve el contenido de la fila de cantidad
const ModalQuantityControlContent = ({
  quantity,
  isOutOfStock,
  availableStock,
  handleDecrement,
  handleIncrement,
  totalPrice,
}) => (
  <div className="prod-modal__quantity-row">
    <div className="prod-modal__quantity">
      <button
        className="prod-modal__quantity-btn"
        onClick={handleDecrement}
        disabled={isOutOfStock || quantity <= 1}
        aria-label="Decrementar cantidad" 
      >
        <i className="bi bi-dash"></i>         
      </button>
      <span className="prod-modal__quantity-num">{quantity}</span>
      <button
        className="prod-modal__quantity-btn"
        onClick={handleIncrement}
        disabled={isOutOfStock || quantity >= availableStock}
        aria-label="Incrementar cantidad" 
      >
        <i className="bi bi-plus"></i> 
      </button>
    </div>
    <p className="prod-modal__total">Total: ${totalPrice}</p> 
  </div>
);

// Devuelve solo el botón del carrito
const ModalAddToCartButtonContent = ({ added, onClick, disabled, buttonText }) => (
  <button
    className={`prod-modal__cart-btn ${added ? 'prod-modal__cart-btn--added' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    <i className="bi bi-cart me-2"></i> 
    {buttonText}
  </button>
);


// --- Componente Principal Refactorizado (Conservando Estructura DOM) --- 
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
      // Usa mainImage o la primera de la galería
      setCurrentImage(product.mainImage || (product.images && product.images[0]));
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const modalClass = modalVisible ? 'prod-modal--visible' : 'prod-modal--hidden';
  const hasMultipleImages = product.images && Array.isArray(product.images) && product.images.length > 1;

  const handleThumbnailSelect = (img) => {
    setCurrentImage(img);
  };

  const getButtonText = () => {
    if (isOutOfStock || quantity <= 0) return 'Sin stock';
    if (added) return 'Producto agregado';
    return `Agregar ($${totalPrice})`;
  };

  const isButtonDisabled = added || isOutOfStock || quantity <= 0;
  const displayImage = currentImage; // Usar el estado local que se actualiza

  return (
    <div
      className={`prod-modal__backdrop ${modalClass}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
            {displayImage && (
              <ModalImageColumnContent
                currentImage={displayImage}
                productName={product.name}
                isOutOfStock={isOutOfStock}
                availableStock={availableStock}
              />
            )}
          </div>

          {/* Columna de Detalles (Mantiene divs originales) */}
          <div className="prod-modal__content">
            <div className="prod-modal__details">
              
              {/* Renderiza el contenido de los detalles usando el subcomponente */}
              <ModalDetailsContent
                product={product}
                hasMultipleImages={hasMultipleImages}
                onSelectImage={handleThumbnailSelect}
                stockError={stockError}
                isOutOfStock={isOutOfStock}
                availableStock={availableStock}
                quantity={quantity}
                handleDecrement={handleDecrement}
                handleIncrement={handleIncrement}
                totalPrice={totalPrice}
                added={added}
                handleAddToCartClick={handleAddToCartClick}
                isButtonDisabled={isButtonDisabled}
                getButtonText={getButtonText}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};