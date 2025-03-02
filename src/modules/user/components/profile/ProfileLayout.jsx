import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ProfileSidebar } from './ProfileSidebar';
import { MobileProfileMenu } from './MobileProfileMenu';
import '../../styles/profileBase.css';

/**
 * ProfileLayout - Layout principal para el perfil de usuario
 * Con enfoque mobile-first y navegación optimizada para móviles
 */
export const ProfileLayout = () => {
  // Obtener datos del usuario desde Redux
  const { displayName, email, photoURL } = useSelector((state) => state.auth);
  const location = useLocation();

  // Si estamos en la ruta exacta /profile, redirigir a /profile/orders
  if (location.pathname === '/profile') {
    return <Navigate to="/profile/orders" replace />;
  }

  return (
    <>
      <div className="container user-profile-container">
        <div className="row g-3">
          {/* Sidebar - Solo visible en desktop */}
          <div className="col-md-3 d-none d-md-block">
            <ProfileSidebar
              displayName={displayName}
              email={email}
              photoURL={photoURL}
            />
          </div>

          {/* Contenido principal */}
          <div className="col-12 col-md-9">
            <div className="card shadow-sm border-0 rounded-3 p-3">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Menú de navegación para móviles */}
      <MobileProfileMenu />
    </>
  );
};