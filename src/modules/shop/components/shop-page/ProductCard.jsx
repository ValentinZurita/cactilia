import '../../../../styles/pages/shop.css';

export const ProductCard = ({ product }) => {

  const { title, image, price, category } = product;

  const handleAddToCart = () => {
    alert(`Agregado al carrito: ${title}`);
  };

  return (
    // Card - Container
    <div className="card shadow-sm h-100">

      {/* Card - Image */}
      <img
        src={image}
        className="card-img-top"
        alt={title}
        style={{ objectFit: 'cover', height: '200px' }}
      />

      {/* Card - Description */}
      <div className="card-body d-flex flex-column">

        {/* Title */}
        <h5 className="text-md mb-xs">{title}</h5>

        {/* Container - Two columns, price and button */}
        <div className="d-flex justify-content-between align-items-center">

          {/* Left column */}
          <div>
            <p className="text-green-1 text-xs mb-xs">{category}</p>
            <p className="text-soft-black text-xs mb-xs">${price.toFixed(2)}</p>
          </div>

          {/* Right column */}
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