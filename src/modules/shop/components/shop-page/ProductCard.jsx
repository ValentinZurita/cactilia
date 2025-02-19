import '../../../../styles/pages/shop.css';

export const ProductCard = ({ product, onProductClick }) => {
  const { name, mainImage, price, category } = product;

  /**
   * This prevents the "Add to Cart" button
   * from also triggering the modal open when the entire card is clickable.
   */
  const handleAddToCart = (e) => {
    e.stopPropagation();
    alert(`Agregado al carrito: ${name}`);
  };

  /**
   * Handle the entire card click => open modal
   */
  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <div
      className="card shadow-sm h-100"
      style={{ cursor: 'pointer' }}
      onClick={handleCardClick} // The entire card is clickable
    >

      {/* Product image */}
      <img
        src={mainImage}
        className="card-img-top"
        alt={name}
        style={{ objectFit: 'cover', height: '200px' }}
      />

      {/* Product name, price, category */}
      <div className="card-body d-flex flex-column">

        {/* Product name */}
        <h5 className="text-md mb-xs">{name}</h5>

        {/* Price and category */}
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex gap-2">
              <p className="category-label">{category}</p>
              {product.stock === 0 && (
                <p className="stock-label">Sin Stock</p>
              )}
            </div>
            <p className="text-soft-black text-xs mb-xs">${price.toFixed(2)}</p>
          </div>

          {/* Add to Cart button */}
          <button
            className={`btn cart-btn` }
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            <i className="bi bi-cart cart-icon" disabled={product.stock === 0} ></i>
          </button>

        </div>
      </div>
    </div>
  );
};