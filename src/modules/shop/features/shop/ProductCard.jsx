import React from 'react';
import '../../../../styles/pages/shop.css';
import '../cart/styles/ProductCartd.css';
import { CartButton } from '../cart/components/index.js';
import { useAsync } from '../../hooks/useAsync';
import { getProductCurrentStock } from '../../services/productServices.js'

export const ProductCard = ({ product, onProductClick }) => {
  // Destructure product data
  const { id, name, mainImage, price, category } = product;

  // Hook para obtener stock actual en tiempo real
  const {
    data: currentStock,
    isPending: isLoadingStock
  } = useAsync(() => getProductCurrentStock(id), true);

  // Determinar si el producto está agotado
  const isOutOfStock = currentStock === 0 || isLoadingStock;

  /**
   * Handle the entire card click => open modal
   * Verificar que el clic no fue en el botón de carrito
   */
  const handleCardClick = (e) => {
    // Verificar que el clic no fue en el botón de carrito o sus descendientes
    if (e.target.closest('.cart-btn')) {
      console.log('Clic en botón de carrito, ignorando apertura de modal');
      return;
    }

    console.log('ProductCard: handleCardClick ejecutado para producto:', name);

    if (onProductClick) {
      onProductClick(product);
    }
  };

  /**
   * Prevenir la propagación del evento al hacer clic en el botón de carrito
   */
  const handleCartButtonWrapperClick = (e) => {
    e.stopPropagation();
    console.log('ProductCard: Propagación detenida en wrapper del CartButton');
  };

  return (
    <div
      className="card product-card"
      onClick={handleCardClick}
    >
      {/* Contenedor de imagen con efecto de elevación */}
      <div className="product-image-container">
        <img
          src={mainImage}
          className="card-img-top"
          alt={name}
        />

        {/* Badge de disponibilidad */}
        {isOutOfStock && (
          <span className="position-absolute top-0 start-0 m-2 badge status-badge">
            Agotado
          </span>
        )}

        {/* Badge de stock bajo (opcional) */}
        {!isOutOfStock && currentStock <= 5 && currentStock > 0 && (
          <span className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark low-stock-badge">
            ¡Solo {currentStock} disponibles!
          </span>
        )}
      </div>

      {/* Información del producto */}
      <div className="card-body product-info d-flex flex-column">
        <h5 className="product-title">{name}</h5>

        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div>
            <div className="d-flex gap-2">
              <p className="category-label">{category}</p>
            </div>
            <p className="text-soft-black product-price">${price.toFixed(2)}</p>
          </div>

          {/* Botón de carrito */}
          <div
            className="cart-button-wrapper"
            onClick={handleCartButtonWrapperClick}
          >
            <CartButton
              product={{...product, stock: currentStock}}
              variant="icon"
              disabled={isOutOfStock}
            />
          </div>
        </div>
      </div>
    </div>
  );
};