import '../../../../styles/pages/shop.css';
import { ProductStatus } from './ProductStatus.jsx'
import { CartButton } from '../cart/components/index.js'


export const ProductCard = ({ product, onProductClick }) => {
  // Destructure product data
  const { id, name, mainImage, price, category } = product;

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
      className="card shadow-sm h-100 product-card"
      style={{ cursor: 'pointer' }}
      onClick={handleCardClick}
    >
      {/* Product image container with status badge */}
      <div className="position-relative">
        <img
          src={mainImage}
          className="card-img-top"
          alt={name}
          style={{ objectFit: 'cover', height: '200px' }}
        />

        {/* Status badge - top right */}
        <div className="position-absolute top-0 end-0 m-2">
          <ProductStatus productId={id} />
        </div>

        {/* Stock badge - top left */}
        {product.stock === 0 && (
          <span className="position-absolute top-0 start-0 m-2 badge bg-danger">
            Sin Stock
          </span>
        )}
      </div>

      {/* Product name, price, category */}
      <div className="card-body d-flex flex-column">
        {/* Product name */}
        <h5 className="text-md mb-xs">{name}</h5>

        {/* Price and category */}
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex gap-2">
              <p className="category-label">{category}</p>
            </div>
            <p className="text-soft-black text-xs mb-xs">${price.toFixed(2)}</p>
          </div>

          {/* Add to Cart button - Con un div que detiene la propagación */}
          <div
            className="cart-button-wrapper"
            onClick={handleCartButtonWrapperClick}
          >
            <CartButton
              product={product}
              variant="icon"
              disabled={product.stock === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};