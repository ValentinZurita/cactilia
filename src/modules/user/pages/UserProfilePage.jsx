import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { ProfileSidebar } from '../components/profile/ProfileSidebar';
import { MobileProfileMenu } from '../components/profile/MobileProfileMenu';
import { OverviewPage } from './OverviewPage.jsx';
import '../../../styles/pages/userProfile.css';

/**
 * UserProfilePage
 *
 * Página principal del perfil - vista cuando el usuario navega a /profile
 * Incluye el layout y el contenido de la página de inicio del perfil (Overview)
 */
export const UserProfilePage = () => {
  // Obtener información del usuario desde Redux
  const { status, displayName, email, photoURL } = useSelector((state) => state.auth);

  // Si no está autenticado, redirigir a login
  if (status !== 'authenticated') {
    return <Navigate to="/auth/login" />;
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
              <OverviewPage />
            </div>
          </div>
        </div>
      </div>

      {/* Menú de navegación para móviles */}
      <MobileProfileMenu />
    </>
  );
};