import { NavbarIcon } from './NavbarIcon';
import { CartWidget } from './CartWidget';
import { useSelector } from 'react-redux';

export const NavbarIcons = () => {

  // Get only the first name of the user
  const getFirstName = (fullName) => fullName ? fullName.split(' ')[0] : "Perfil";

  // Get the user's authentication status, role, and display name
  const { status, role, displayName } = useSelector((state) => state.auth);

  // Icons
  const profileIcon = "bi-person-circle";

  // Labels
  const profileLabel = status === "authenticated" ? getFirstName(displayName) || "Perfil" : "Iniciar sesión";

  // 📌 The profile icon and label are displayed according to the user's authentication status.
  const profileHref =
    status !== "authenticated"
      ? "/auth/login"
      : role === "admin" || role === "superadmin"
        ? "/admin/home"
        : "/profile";

  return (
    <div className="d-flex align-items-center order-lg-2 ms-auto justify-content-between">

      {/* User Icon */}
      <NavbarIcon
        iconClass={profileIcon}
        label={profileLabel}
        href={profileHref}
        hideLabelOnMobile={true}
      />

      {/* Cart Widget with dropdown */}
      <CartWidget />

    </div>
  );
};