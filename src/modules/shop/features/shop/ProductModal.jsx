import React, { useState, useEffect } from 'react';
import { ProductImageCarousel } from './ProductModalCarousel';
import { ImageComponent } from '../../../../shared/components/images/ImageComponent.jsx';
import { useModalVisibility } from '../../hooks/useModalVisibility';
import { useProductModal } from '../../hooks/useProductModal';
import '../../styles/productModal.css';

// ============================================================================
// Subcomponentes Internos (Solo Contenido)
// ============================================================================

/** Contenido de la columna de imagen */
const ModalImageColumnContent = ({ currentImage, productName, isOutOfStock, availableStock }) => (
  <>
    <ImageComponent 
      src={currentImage} 
      alt={productName} 
      className="prod-modal__image"
    />
    {/* Badges de Stock */}
    {isOutOfStock && (
      <span className="position-absolute top-0 start-0 m-2 badge bg-danger">Agotado</span>
    )}
    {!isOutOfStock && availableStock > 0 && availableStock <= 5 && (
      <span className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark">¡Solo {availableStock} disponibles!</span>
    )}
  </>
);

/** Contenido principal de los detalles del producto */
const ModalDetailsContent = ({
  product,
  hasMultipleImages,
  onSelectImage,
  stockError,
  isOutOfStock,
  availableStock,
  quantity, 
  handleDecrement, 
  handleIncrement, 
  totalPrice, 
  added, 
  handleAddToCartClick, 
  isButtonDisabled, 
  getButtonText, 
}) => (
  <>
    {/* Título */}
    <h3 id="product-modal-title" className="prod-modal__title">{product.name}</h3>
    
    {/* Categoría y Etiqueta de Stock */}
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

    {/* Carrusel de Imágenes (si aplica) */}
    {hasMultipleImages && (
      <div className="prod-modal__carousel-container">
        <ProductImageCarousel
          images={product.images}
          onSelectImage={onSelectImage}
        />
      </div>
    )}

    {/* Mensaje de Error de Stock (si aplica) */} 
    {stockError && (
      <div className="prod-modal__stock-error">
        <i className="bi bi-exclamation-triangle me-2"></i> 
        {stockError}
      </div>
    )}

    {/* Control de Cantidad */}
    <ModalQuantityControlContent 
        quantity={quantity}
        isOutOfStock={isOutOfStock}
        availableStock={availableStock}
        handleDecrement={handleDecrement}
        handleIncrement={handleIncrement}
        totalPrice={totalPrice}
    />

    {/* Botón Añadir al Carrito */}
    <ModalAddToCartButtonContent
        added={added}
        onClick={handleAddToCartClick}
        disabled={isButtonDisabled}
        buttonText={getButtonText()}
    />
  </>
);

/** Control para ajustar la cantidad y ver total */
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

/** Botón para añadir al carrito */
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


// ============================================================================
// Componente Principal: ProductModal
// ============================================================================
export const ProductModal = ({ product, isOpen, onClose }) => {

  // --- Estado Local ---
  const [currentImage, setCurrentImage] = useState(null);
  
  // --- Hooks Personalizados ---
  const modalVisible = useModalVisibility(isOpen, product); // Hook para animación/visibilidad
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
  } = useProductModal(product, isOpen, onClose); // Hook para lógica de cantidad y carrito

  // --- Efectos Secundarios ---
  useEffect(() => {
    // Establecer imagen inicial al abrir/cambiar producto
    if (isOpen && product) {
      setCurrentImage(product.mainImage || (product.images && product.images[0]));
    }
  }, [isOpen, product]);

  // --- Renderizado Condicional Temprano ---
  if (!isOpen || !product) return null;

  // --- Variables y Lógica de Renderizado --- 
  const modalClass = modalVisible ? 'prod-modal--visible' : 'prod-modal--hidden';
  const hasMultipleImages = product.images && Array.isArray(product.images) && product.images.length > 1;

  // Manejador para seleccionar imagen desde el carrusel
  const handleThumbnailSelect = (img) => {
    setCurrentImage(img);
  };

  // Texto dinámico para el botón de añadir
  const getButtonText = () => {
    if (isOutOfStock || quantity <= 0) return 'Sin stock';
    if (added) return 'Producto agregado';
    return `Agregar ($${totalPrice})`;
  };
  const isButtonDisabled = added || isOutOfStock || quantity <= 0;
  
  // Imagen a mostrar (estado o fallback)
  const displayImage = currentImage; 

  // --- JSX Principal --- 
  return (
    <div
      className={`prod-modal__backdrop ${modalClass}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} // Cierre al click en fondo
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      aria-hidden={!isOpen}
    >
      <div className="prod-modal__container">
        {/* Botón Cerrar */}
        <button 
          className="prod-modal__close" 
          onClick={onClose} 
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        {/* Contenedor Interno (Layout Flex/Grid) */}
        <div className="prod-modal__inner-container">

          {/* Columna Imagen (Renderiza contenido con subcomponente) */}
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

          {/* Columna Detalles (Renderiza contenido con subcomponente) */}
          <div className="prod-modal__content">
            <div className="prod-modal__details">
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