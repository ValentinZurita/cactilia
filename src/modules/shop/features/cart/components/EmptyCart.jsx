import { Link } from 'react-router-dom';
import '../../../../shop/features/cart/styles/emptyCart.css';

export const EmptyCart = ({ onContinueShopping }) => {
  return (
    <div className="container empty-cart-container pt-5 mt-5">
      {/* Empty cart icon */}
      <i className="bi bi-cart-x empty-cart-icon"></i>

      {/* Empty cart title */}
      <h2>Tu carrito está vacío</h2>

      {/* Separador decorativo */}
      <div className="empty-cart-separator"></div>

      {/* Empty cart message */}
      <p>
        Aún no has agregado productos a tu carrito. Explora nuestra tienda y descubre nuestros increíbles productos.
      </p>

      {/* Continue shopping button */}
      <Link
        to="/shop"
        className="btn btn-green-checkout"
        onClick={onContinueShopping}
      >
        <i className="bi bi-shop me-2"></i>
        Ir a la tienda
      </Link>
    </div>
  );
};