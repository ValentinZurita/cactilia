import React, { useMemo } from 'react';
import '../../../../styles/pages/shop.css';
import '../cart/styles/ProductCartd.css';
import { CartButton } from '../cart/components/index.js';
import { validateAndNormalizeProduct, ensureShippingProperties } from '../../services/productServices.js';
import { ImageComponent } from '../../../../shared/components/images/ImageComponent.jsx';

// ============================================================================
// Componente ProductCard (Memoizado)
// ============================================================================
export const ProductCard = React.memo(({ product, onProductClick }) => {

  // --- Procesamiento del Producto (Memoizado) ---
  // Validar, normalizar y asegurar propiedades de envío solo cuando `product` cambia
  const processedProduct = useMemo(() => {
      if (!product) return null; // Manejar producto nulo/indefinido
      const { product: validatedProduct } = validateAndNormalizeProduct(product, true);
      return ensureShippingProperties(validatedProduct, 'ProductCard');
  }, [product]);

  // --- Desestructuración y Estado Derivado ---
  // Usar valores por defecto por seguridad después del procesamiento
  const { id, name, mainImage, price, category, stock = 0 } = processedProduct || {}; 
  const currentStock = stock ?? 0;
  const isOutOfStock = currentStock <= 0;

  // --- Manejadores de Eventos ---
  // Maneja el clic en la tarjeta (evita si se hace clic en el botón del carrito)
  const handleCardClick = (e) => {
    // Si el clic ocurrió dentro del botón del carrito o sus hijos, no hacer nada.
    if (e.target.closest('.cart-btn')) {
      return;
    }
    // Llamar a onProductClick (para abrir modal) con el producto procesado
    if (onProductClick && processedProduct) { 
      onProductClick(processedProduct);
    }
  };

  // Evita que el clic en el wrapper del botón propague a handleCardClick
  const handleCartButtonWrapperClick = (e) => {
    e.stopPropagation();
  };

  // --- Renderizado Condicional Temprano ---
  // Si el producto no es válido después del procesamiento, no renderizar nada
  if (!processedProduct) {
    return null; 
  }

  // --- Renderizado del Componente ---
  return (
    <div
      className="card product-card h-100" // h-100 para altura consistente
      onClick={handleCardClick}
      role="button" // Rol para accesibilidad
      tabIndex={0} // Hacer enfocable
      aria-label={`Ver detalles de ${name || 'producto'}`}
    >
      {/* Contenedor de Imagen */}
      <div className="product-image-container position-relative"> 
        <ImageComponent
          src={mainImage}
          alt={name || 'Producto'}
          className="card-img-top"
          loading="lazy" // Carga diferida de imagen
        />
        {/* Badges de Stock */}
        {isOutOfStock && (
          <span className="position-absolute top-0 start-0 m-2 badge bg-danger status-badge">
            Agotado
          </span>
        )}
        {!isOutOfStock && currentStock <= 5 && (
          <span className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark low-stock-badge">
            ¡Solo {currentStock} disponibles!
          </span>
        )}
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="card-body product-info d-flex flex-column">
        {/* Título (con crecimiento flexible para alinear botones abajo) */}
        <h5 className="product-title flex-grow-1">{name || 'Nombre no disponible'}</h5> 

        {/* Info Inferior (Precio, Categoría, Botón Carrito) */}
        <div className="d-flex justify-content-between align-items-center mt-auto pt-2"> 
          <div>
            {/* Categoría (si existe) */}
            {category && (
                <p className="category-label mb-1">{category}</p>
            )}
            {/* Precio (con fallback) */}
            <p className="text-soft-black product-price mb-0">${price?.toFixed(2) ?? '--.--'}</p>
          </div>

          {/* Wrapper del Botón Carrito (para detener propagación) */}
          <div
            className="cart-button-wrapper"
            onClick={handleCartButtonWrapperClick}
          >
            <CartButton
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

// Nombre para React DevTools
ProductCard.displayName = 'ProductCard';