import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { ProfileSidebar } from '../components/profile/ProfileSidebar';
import { OverviewPage } from './OverviewPage.jsx'
import '/src/styles/pages/userProfile.css';


/**
 * UserProfilePage
 *
 * Combines the profile layout and overview page for direct access via the navbar
 */
export const UserProfilePage = () => {
  const { status, displayName, email, photoURL } = useSelector((state) => state.auth);

  // If not authenticated, redirect to login
  if (status !== 'authenticated') {
    return <Navigate to="/auth/login" />;
  }

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
            <OverviewPage />
          </div>
        </div>
      </div>
    </div>
  );
};