import { useState, useRef, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../modules/shop/features/cart/hooks/useCart.js';
import { formatPrice } from '../../../modules/shop/features/cart/utils/cartUtils.js';

/**
 * CartItem component - Renders a single item in the cart preview
 */
const CartItem = memo(({ item }) => (
  <article className="d-flex py-2 border-bottom">
    <img
      src={item.image}
      alt={item.name}
      className="rounded me-2"
      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
    />
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
  </article>
));

/**
 * CartWidget component with dropdown functionality and elegant badge
 * Optimized for readability, semantics and performance
 */
export const CartWidget = () => {
  // State & hooks
  const [showPreview, setShowPreview] = useState(false);
  const { items, total } = useCart();
  const previewRef = useRef(null);
  const timerRef = useRef(null);

  // Derived values
  const itemsCount = items.reduce((count, item) => count + item.quantity, 0);
  const hasItems = items.length > 0;
  const showCartPreview = showPreview && hasItems;

  // Badge styles for perfect circle
  const badgeStyles = {
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
  };

  // Effect for clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (previewRef.current && !previewRef.current.contains(event.target)) {
        setShowPreview(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Event handlers
  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowPreview(true), 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowPreview(false), 500);
  };

  const closePreview = () => setShowPreview(false);

  // Render cart badge
  const renderBadge = () =>
    itemsCount > 0 && (
      <span style={badgeStyles}>
        {itemsCount > 99 ? '9+' : itemsCount}
      </span>
    );

  // Render cart preview content
  const renderPreviewItems = () => (
    <>
      {items.slice(0, 3).map(item => (
        <CartItem key={item.id} item={item} />
      ))}

      {items.length > 3 && (
        <p className="text-center text-muted my-2">
          <small>Y {items.length - 3} productos más...</small>
        </p>
      )}
    </>
  );

  return (
    <nav
      className="position-relative d-flex align-items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={previewRef}
    >
      {/* Cart Icon with badge */}
      <Link to="/cart" className="nav-link d-flex align-items-center px-2 text-dark">
        <span className="position-relative">
          <i className="bi bi-cart-fill fs-5 text-muted fw-light"></i>
          {renderBadge()}
        </span>
        <span className="fw-light d-none d-lg-inline ms-1">Carrito</span>
      </Link>

      {/* Cart preview dropdown */}
      {showCartPreview && (
        <section
          className="position-absolute bg-white shadow-lg rounded-3 p-3"
          style={{
            right: 0,
            top: '100%',
            width: '320px',
            zIndex: 1000,
            marginTop: '10px'
          }}
        >
          {/* Header */}
          <header className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="m-0">Tu Carrito ({itemsCount})</h6>
            <button
              className="btn-close btn-sm"
              onClick={closePreview}
              aria-label="Cerrar vista previa del carrito"
            ></button>
          </header>

          {/* Items list */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {renderPreviewItems()}
          </div>

          {/* Footer */}
          <footer className="mt-3">
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">Total:</span>
              <span className="fw-bold" style={{ color: '#34C749' }}>
                {formatPrice(total)}
              </span>
            </div>
            <div className="d-grid gap-2">
              <Link
                to="/cart"
                className="btn w-100"
                style={{ backgroundColor: '#34C749', color: 'white' }}
                onClick={closePreview}
              >
                Ver Carrito
              </Link>
              <Link
                to="/shop/checkout"
                className="btn btn-outline-secondary w-100"
                onClick={closePreview}
              >
                Finalizar Compra
              </Link>
            </div>
          </footer>
        </section>
      )}
    </nav>
  );
};