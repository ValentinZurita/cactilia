import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../modules/shop/features/cart/hooks/useCart.js'
import { formatPrice } from '../../../modules/shop/features/cart/utils/cartUtils.js'

/**
 * CartWidget component that shows a mini preview of the cart
 * when hovering over the cart icon. Includes a badge with the
 * number of items in the cart styled in the brand green color.
 */
export const CartWidget = () => {
  const [showPreview, setShowPreview] = useState(false);
  const { items, total, itemsCount } = useCart();
  const previewRef = useRef(null);
  const timerRef = useRef(null);

  // Close the preview when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (previewRef.current && !previewRef.current.contains(event.target)) {
        setShowPreview(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle mouse enter with delay
  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 300);
  };

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowPreview(false);
    }, 500);
  };

  // Close preview when navigating to cart
  const handleGoToCart = () => {
    setShowPreview(false);
  };

  return (
    <div
      className="position-relative d-flex align-items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={previewRef}
    >
      {/* Cart Icon with number badge */}
      <Link to="/cart" className="nav-link d-flex align-items-center px-2 text-dark navbar-hover">
        <i className="bi bi-cart-fill fs-5 me-1 text-muted fw-light" />
        <span className="fw-light d-none d-lg-inline">
          Carrito
        </span>

        {/* Cart badge showing number of items - now with brand green color */}
        {itemsCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill cart-badge" style={{ marginLeft: '-1rem' }}>
            {itemsCount > 99 ? '99+' : itemsCount}
            <span className="visually-hidden">productos en el carrito</span>
          </span>
        )}
      </Link>

      {/* Cart preview popup */}
      {showPreview && items.length > 0 && (
        <div
          className="cart-preview-dropdown position-absolute bg-white shadow-lg rounded-3 p-3"
          style={{
            right: 0,
            top: '100%',
            width: '320px',
            zIndex: 1000,
            marginTop: '10px'
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="m-0">Tu Carrito ({itemsCount})</h6>

            {/* Close button */}
            <button
              className="btn-close btn-sm"
              onClick={() => setShowPreview(false)}
              aria-label="Cerrar"
            ></button>

          </div>

          {/* Cart items */}
          <div
            className="cart-preview-items"
            style={{
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >

            {/* Show only the first 3 items */}
            {items.slice(0, 3).map(item => (
              <div key={item.id} className="cart-preview-item d-flex py-2 border-bottom">
                <div className="cart-preview-image me-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="rounded"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                </div>

                {/* Product details */}
                <div className="cart-preview-details flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <p className="mb-0 text-truncate" style={{ maxWidth: '150px' }}>{item.name}</p>
                    <span className="text-muted">{formatPrice(item.price)}</span>
                  </div>

                  {/* Quantity and total */}
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">Cantidad: {item.quantity}</small>
                    <small className="fw-bold">{formatPrice(item.price * item.quantity)}</small>
                  </div>

                </div>
              </div>
            ))}

            {/* Show a message if there are more than 3 items */}
            {items.length > 3 && (
              <div className="text-center text-muted my-2">
                <small>Y {items.length - 3} productos más...</small>
              </div>
            )}
          </div>

          {/* Footer with total and buttons */}
          <div className="cart-preview-footer mt-3">
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">Total:</span>
              <span className="fw-bold text-green-1">{formatPrice(total)}</span>
            </div>

            {/* Buttons */}
            <div className="d-grid gap-2">

              {/* Go to cart button */}
              <Link
                to="/cart"
                className="btn btn-green-lg w-100"
                onClick={handleGoToCart}
              >
                Ver Carrito
              </Link>

              {/* Pay now button */}
              <button className="btn btn-outline-secondary w-100">
                Pagar Ahora
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};