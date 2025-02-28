import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { FirebaseAuth } from '../../../../firebase/firebaseConfig';
import { logout } from '../../../../store/auth/authSlice';

/**
 * ProfileSidebar
 *
 * Sidebar navigation for user profile with user info and navigation links
 *
 * @param {Object} props - Component props
 * @param {string} props.displayName - User's name
 * @param {string} props.email - User's email
 * @param {string} props.photoURL - User's profile photo URL
 */
export const ProfileSidebar = ({ displayName, email, photoURL }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Active section state
  const [activeSection, setActiveSection] = useState('overview');

  // Navigation menu items
  const menuItems = [
    { id: 'overview', label: 'Mi Cuenta', icon: 'person' },
    { id: 'orders', label: 'Mis Pedidos', icon: 'bag' },
    { id: 'addresses', label: 'Direcciones', icon: 'geo-alt' },
    { id: 'payments', label: 'Métodos de Pago', icon: 'credit-card' },
    { id: 'settings', label: 'Configuración', icon: 'gear' }
  ];

  /**
   * Handle menu item click
   * @param {string} sectionId - Section ID to navigate to
   */
  const handleNavigation = (sectionId) => {
    setActiveSection(sectionId);
    navigate(`/profile/${sectionId}`);
  };

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await signOut(FirebaseAuth);
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="profile-sidebar card shadow-sm border-0">
      {/* User info header */}
      <div className="p-4 text-center bg-light border-bottom">
        <img
          src={photoURL || 'https://via.placeholder.com/100'}
          alt={displayName}
          className="rounded-circle mb-3 user-avatar"
        />
        <h5 className="mb-1">{displayName}</h5>
        <p className="text-muted mb-0 small">{email}</p>
      </div>

      {/* Navigation menu */}
      <div className="p-3">
        {/* Menu items */}
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`profile-nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => handleNavigation(item.id)}
          >
            <i className={`bi bi-${item.icon} me-3`}></i>
            {item.label}
          </button>
        ))}

        {/* Logout button */}
        <button
          className="profile-nav-item text-danger"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-3"></i>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};