import '../../../../styles/pages/shop.css';

export const ProductCard = ({ product, onProductClick }) => {
  const { title, image, price, category } = product;

  /**
   * This prevents the "Add to Cart" button
   * from also triggering the modal open when the entire card is clickable.
   */
  const handleAddToCart = (e) => {
    e.stopPropagation();
    alert(`Agregado al carrito: ${title}`);
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
      <img
        src={image}
        className="card-img-top"
        alt={title}
        style={{ objectFit: 'cover', height: '200px' }}
      />

      <div className="card-body d-flex flex-column">
        <h5 className="text-md mb-xs">{title}</h5>

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p className="text-green-1 text-xs mb-xs">{category}</p>
            <p className="text-soft-black text-xs mb-xs">${price.toFixed(2)}</p>
          </div>

          <button
            className="btn cart-btn"
            onClick={handleAddToCart}
          >
            <i className="bi bi-cart cart-icon"></i>
          </button>
        </div>
      </div>
    </div>
  );
};