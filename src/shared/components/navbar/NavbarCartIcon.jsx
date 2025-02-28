import { NavbarIcon } from './NavbarIcon';
import { useSelector } from 'react-redux';
import { selectCartItemsCount } from '../../../store/cart/cartSlice.js'

/**
 * Cart Icon for the Navbar with a badge showing the number of items in the cart
 */

export const NavbarCartIcon = () => {


  // Get cart items count from Redux
  const cartItemsCount = useSelector(selectCartItemsCount);


  // Icon and label
  const cartIcon = "bi-cart-fill";
  const cartLabel = "Carrito";


  return (

    <div className="position-relative">

      {/* Cart Icon */}
      <NavbarIcon
        iconClass={cartIcon}
        label={cartLabel}
        href="/cart"
        hideLabelOnMobile={true}
      />

      {/* Cart badge showing number of items */}
      {cartItemsCount > 0 && (
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          {cartItemsCount > 99 ? '99+' : cartItemsCount}
          <span className="visually-hidden">productos en el carrito</span>
        </span>
      )}

    </div>
  );
};