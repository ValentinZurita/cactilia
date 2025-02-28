import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ProfileSidebar } from './ProfileSidebar';

/**
 * ProfileLayout
 *
 * Main layout for user profile pages with sidebar and content area
 */
export const ProfileLayout = () => {
  // Get user data from Redux store
  const { displayName, email, photoURL } = useSelector((state) => state.auth);

  return (
    <div className="container user-profile-container">
      <div className="row">
        {/* Sidebar - 3 columns on desktop */}
        <div className="col-md-3 mb-4">
          <ProfileSidebar
            displayName={displayName}
            email={email}
            photoURL={photoURL}
          />
        </div>

        {/* Main content - 9 columns on desktop */}
        <div className="col-md-9">
          <div className="card shadow-sm border-0 p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};