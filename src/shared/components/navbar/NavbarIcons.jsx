import { NavbarIcon } from './NavbarIcon';

export const NavbarIcons = ({ status, displayName }) => {

  const profileIcon = "bi-person-circle";
  const cartIcon = "bi-cart-fill";
  const cartLabel = "Carrito"
  const showProfileLabel = status === "authenticated" ? displayName || "Perfil" : "Iniciar sesión";
  const showHref = status === "authenticated" ? "/profile" : "/auth/login";

  return (
    <div className="d-flex align-items-center order-lg-2 ms-auto justify-content-between">

      {/* User Icon */}
      <NavbarIcon
        iconClass={profileIcon}
        label={showProfileLabel}
        href={showHref}
        hideLabelOnMobile = {true}
      />

      {/* Cart Icon */}
      <NavbarIcon
        iconClass={cartIcon}
        label={cartLabel}
        href="/cart"
        hideLabelOnMobile = {true}
      />

    </div>
  );
};