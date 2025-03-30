import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../modules/shop/features/cart/hooks/useCart.js';
import { formatPrice } from '../../../modules/shop/features/cart/utils/cartUtils.js';

/**
 * CartWidget component with dropdown functionality and elegant badge
 */
export const CartWidget = () => {
  const [showPreview, setShowPreview] = useState(false);
  const { items, total } = useCart();
  const previewRef = useRef(null);
  const timerRef = useRef(null);

  // Calcular el número de items directamente
  const itemsCount = items.reduce((count, item) => count + item.quantity, 0);

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

  // Handle mouse events
  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowPreview(false);
    }, 500);
  };

  // Elegant badge styles for perfect circle
  const badgeStyle = {
    position: 'absolute',
    top: '-8px',
    left: '-8px',
    backgroundColor: '#34C749',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    // Removed white border for cleaner look
  };

  return (
    <div
      className="position-relative d-flex align-items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={previewRef}
    >
      {/* Cart Icon with badge */}
      <Link to="/cart" className="nav-link d-flex align-items-center px-2 text-dark">
        <div className="position-relative">
          <i className="bi bi-cart-fill fs-5 text-muted fw-light"></i>

          {/* Badge - positioned absolutely */}
          {itemsCount > 0 && (
            <div style={badgeStyle}>
              {itemsCount > 99 ? '9+' : itemsCount}
            </div>
          )}
        </div>

        <span className="fw-light d-none d-lg-inline ms-1">
          Carrito
        </span>
      </Link>

      {/* Cart preview dropdown */}
      {showPreview && items.length > 0 && (
        <div
          className="position-absolute bg-white shadow-lg rounded-3 p-3"
          style={{
            right: 0,
            top: '100%',
            width: '320px',
            zIndex: 1000,
            marginTop: '10px'
          }}
        >
          {/* Dropdown content */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="m-0">Tu Carrito ({itemsCount})</h6>
            <button className="btn-close btn-sm" onClick={() => setShowPreview(false)}></button>
          </div>

          {/* Preview items */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {items.slice(0, 3).map(item => (
              <div key={item.id} className="d-flex py-2 border-bottom">
                <div className="me-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="rounded"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <p className="mb-0 text-truncate" style={{ maxWidth: '150px' }}>{item.name}</p>
                    <span className="text-muted">{formatPrice(item.price)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">Cantidad: {item.quantity}</small>
                    <small className="fw-bold">{formatPrice(item.price * item.quantity)}</small>
                  </div>
                </div>
              </div>
            ))}

            {items.length > 3 && (
              <div className="text-center text-muted my-2">
                <small>Y {items.length - 3} productos más...</small>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-3">
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">Total:</span>
              <span className="fw-bold" style={{ color: '#34C749' }}>{formatPrice(total)}</span>
            </div>
            <div className="d-grid gap-2">
              <Link
                to="/cart"
                className="btn w-100"
                style={{ backgroundColor: '#34C749', color: 'white' }}
                onClick={() => setShowPreview(false)}
              >
                Ver Carrito
              </Link>
              <Link
                to="/shop/checkout"
                className="btn btn-outline-secondary w-100"
                onClick={() => setShowPreview(false)}
              >
                Finalizar Compra
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};