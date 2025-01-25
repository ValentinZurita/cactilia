import { NavbarIcon } from './NavbarIcon';

export const NavbarIcons = () => {
  return (
    <div className="d-flex align-items-center order-lg-2 ms-auto justify-content-between">
      {/* Profile Icon */}
      <NavbarIcon iconClass="bi-person-circle" label="Perfil" href="/profile" />
      {/* Cart Icon */}
      <NavbarIcon iconClass="bi-cart-fill" label="Carrito" href="/cart" />
    </div>
  );
};