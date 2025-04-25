import React, { useMemo } from 'react';
import '../../../../styles/pages/shop.css';
import '../cart/styles/ProductCartd.css';
import { CartButton } from '../cart/components/index.js';
import { validateAndNormalizeProduct, ensureShippingProperties } from '../../services/productServices.js';
import { ImageComponent } from '../../../../shared/components/images/ImageComponent.jsx';

export const ProductCard = React.memo(({ product, onProductClick }) => {
  // Use useMemo to process the product only when the input product changes
  const processedProduct = useMemo(() => {
      if (!product) return null; // Handle null/undefined product
      // Validate and normalize first
      const { product: validatedProduct } = validateAndNormalizeProduct(product, true);
      // Ensure shipping properties
      return ensureShippingProperties(validatedProduct, 'ProductCard');
  }, [product]);

  // Destructure product data AFTER processing
  // Use default values for safety
  const { id, name, mainImage, price, category, stock = 0 } = processedProduct || {}; 
  
  // State for stock (now derived directly from prop)
  const currentStock = stock ?? 0; // Use the stock from the processed product
  const isOutOfStock = currentStock <= 0;

  // Handle card click (no changes needed here, but ensure processedProduct is used)
  const handleCardClick = (e) => {
    if (e.target.closest('.cart-btn')) {
      return;
    }
    // Pass the fully processed product to the modal
    if (onProductClick && processedProduct) { 
      onProductClick(processedProduct);
    }
  };

  // Prevent propagation (no changes needed here)
  const handleCartButtonWrapperClick = (e) => {
    e.stopPropagation();
  };

  // Handle potential null product during processing
  if (!processedProduct) {
    // Optionally render a placeholder or null
    return null; 
  }

  return (
    <div
      className="card product-card h-100" // Added h-100 for consistent height
      onClick={handleCardClick}
      role="button" // Add role for accessibility
      tabIndex={0} // Make it focusable
      aria-label={`Ver detalles de ${name}`}
    >
      <div className="product-image-container position-relative"> 
        <ImageComponent
          src={mainImage}
          alt={name || 'Producto'} // Provide default alt text
          className="card-img-top"
          loading="lazy" // Add lazy loading for images
        />

        {isOutOfStock && (
          <span className="position-absolute top-0 start-0 m-2 badge bg-danger status-badge"> {/* Use bg-danger for consistency */}
            Agotado
          </span>
        )}

        {!isOutOfStock && currentStock <= 5 && (
          <span className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark low-stock-badge">
            ¡Solo {currentStock} disponibles!
          </span>
        )}
      </div>

      <div className="card-body product-info d-flex flex-column">
        {/* Use min-height or similar CSS if needed to prevent title height changes */}
        <h5 className="product-title flex-grow-1">{name || 'Nombre no disponible'}</h5> 

        <div className="d-flex justify-content-between align-items-center mt-auto pt-2"> {/* Added pt-2 for spacing */}
          <div>
            {category && (
                <p className="category-label mb-1">{category}</p> // Ensure margin is appropriate
            )}
            <p className="text-soft-black product-price mb-0">${price?.toFixed(2) ?? '--.--'}</p> {/* Handle potential undefined price */}
          </div>

          <div
            className="cart-button-wrapper"
            onClick={handleCartButtonWrapperClick}
          >
            <CartButton
              // Pass the processed product with the stock we derived
              product={processedProduct} 
              variant="icon"
              disabled={isOutOfStock}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

// Add display name for React DevTools
ProductCard.displayName = 'ProductCard';