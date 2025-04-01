import React, { useState, useEffect } from 'react';
import { useCart } from '../cart/hooks/useCart';
import { ProductImageCarousel } from './ProductModalCarousel';
import { validateItemsStock } from '../../services/productServices.js';
import '../../../shop/styles/productModal.css';

// -------------------------------------------
// HOOK: Controla visibilidad del modal
// -------------------------------------------
const useModalVisibility = (isOpen, product) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      const timer = setTimeout(() => {
        setVisible(true);
        document.body.style.overflow = 'hidden';
      }, 10);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    }
    setVisible(false);
  }, [isOpen, product]);

  return visible;
};

// -------------------------------------------
// HOOK: Validación de stock individual
// -------------------------------------------
const useStockValidation = (product, getItem) => {
  const validateStock = async (requestedQty) => {
    try {
      const result = await validateItemsStock([{
        id: product.id,
        name: product.name,
        quantity: requestedQty
      }]);

      if (!result.valid && result.outOfStockItems.length > 0) {
        const errorItem = result.outOfStockItems[0];
        const inCartQty = getItem(product.id)?.quantity || 0;
        const remaining = errorItem.currentStock - inCartQty;
      return {
          valid: remaining > 0,
          quantity: Math.max(Math.min(requestedQty, remaining), 0),
          error: null
      };
      }

      return { valid: true };
    } catch (err) {
      console.error('Error validando stock:', err);
      return { valid: false, error: 'Error al validar el stock.' };
    }
  };

  return { validateStock };
};

// -------------------------------------------
// COMPONENTE: ProductModal
// -------------------------------------------
export const ProductModal = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [stockError, setStockError] = useState(null);
  const [isOutOfStockState, setIsOutOfStockState] = useState(false);

  const modalVisible = useModalVisibility(isOpen, product);
  const { addToCart, isInCart, getItem } = useCart();
  const { validateStock } = useStockValidation(product, getItem);

  // Resetear estado al abrir el modal
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setAdded(false);
      setStockError(null);
      setCurrentImage(product.mainImage);
      setIsOutOfStockState(false);
    }
  }, [isOpen, product]);

  // Datos de stock
  const productStock = product?.stock || 0;
  const cartQuantity = isInCart(product?.id) ? getItem(product.id)?.quantity || 0 : 0;
  const availableStock = Math.max(productStock - cartQuantity, 0);
  const isOutOfStock = isOutOfStockState || availableStock <= 0;

  if (!isOpen || !product) return null;

  const totalPrice = (product.price * quantity).toFixed(2);
  const modalClass = modalVisible ? 'prod-modal--visible' : 'prod-modal--hidden';
  const hasMultipleImages = product.images?.length > 1;

  // Botón: Texto
  const getButtonText = () => {
    if (isOutOfStock || quantity <= 0) return 'Sin stock';
    if (added) return 'Producto agregado';
    return 'Agregar al Carrito';
  };

  // Botón: Disabled
  const isButtonDisabled = added || isOutOfStock || quantity <= 0;

  // Incrementar cantidad
  const handleIncrement = async () => {
    const nextQty = quantity + 1;
    const result = await validateStock(nextQty);

    if (result.valid) {
      setQuantity(nextQty);
      setStockError(null);
    } else {
      setStockError(result.error);
      if (typeof result.quantity === 'number') {
        if (result.quantity <= 0) {
          setQuantity(0);
          setIsOutOfStockState(true);
          setAdded(false);
        }
        else {
          setQuantity(result.quantity);
        }
      }
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      setStockError(null);
    }
  };

  const handleAddToCartClick = async (e) => {
    e.stopPropagation();

    const result = await validateStock(quantity);
    if (!result.valid) {
      setStockError(result.error);
      if (typeof result.quantity === 'number') {
        if (result.quantity <= 0) {
          setQuantity(0);
          setIsOutOfStockState(true);
          setAdded(false);
        }
        else {
          setQuantity(result.quantity);
        }
      }
      return;
    }

    try {
      const res = await addToCart(product, quantity);
      if (res?.success) {
        setAdded(true);
        setTimeout(onClose, 2000);
      }
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div
      className={`prod-modal__backdrop ${modalClass}`}
      onClick={(e) => {
        if (e.target.classList.contains('prod-modal__backdrop')) onClose();
      }}
    >
      <div className="prod-modal__container">
        <button className="prod-modal__close" onClick={onClose}>✕</button>

        <div className="prod-modal__inner-container">
          {/* Imagen */}
          <div className="prod-modal__image-wrap">
            <img
              src={currentImage || product.mainImage}
              alt={product.name}
              className="prod-modal__image"
            />
          </div>

          {/* Contenido */}
          <div className="prod-modal__content">
            <div className="prod-modal__details">
              <h3 className="prod-modal__title">{product.name}</h3>

              <div className="prod-modal__category-wrap">
                <span className="prod-modal__category">{product.category || 'Sin categoría'}</span>
                {isOutOfStock && (
                  <span className="prod-modal__stock-label">Sin Stock</span>
                )}
                {!isOutOfStock && availableStock <= 5 && (
                  <span className="prod-modal__stock-limited">
                    ¡Quedan solo {availableStock}!
                  </span>
                )}
              </div>

              <p className="prod-modal__price">${product.price.toFixed(2)}</p>
              <p className="prod-modal__desc">{product.description || 'Sin descripción disponible'}</p>

              {hasMultipleImages && (
                <div className="prod-modal__carousel-container">
                  <ProductImageCarousel
                    images={product.images}
                    onSelectImage={setCurrentImage}
                  />
                </div>
              )}

              {stockError && (
                <div className="prod-modal__stock-error">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {stockError}
                </div>
              )}

              <div className="prod-modal__quantity-row">
                <div className="prod-modal__quantity">
                  <button
                    className="prod-modal__quantity-btn"
                    onClick={handleDecrement}
                    disabled={isOutOfStock || quantity <= 1}
                  >
                    <i className="bi bi-dash" />
                  </button>
                  <span className="prod-modal__quantity-num">{quantity}</span>
                  <button
                    className="prod-modal__quantity-btn"
                    onClick={handleIncrement}
                    disabled={isOutOfStock || quantity >= availableStock}
                  >
                    <i className="bi bi-plus" />
                  </button>
                </div>
                <p className="prod-modal__total">Total: ${totalPrice}</p>
              </div>

              <button
                className={`prod-modal__cart-btn ${added ? 'prod-modal__cart-btn--added' : ''}`}
                onClick={handleAddToCartClick}
                disabled={isButtonDisabled}
              >
                <i className="bi bi-cart me-2" />
                {getButtonText()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};