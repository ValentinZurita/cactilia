import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { signOut } from 'firebase/auth';
import { FirebaseAuth } from '../../../../config/firebase/firebaseConfig';
import { logout } from '../../../../store/auth/authSlice';
import '../../styles/profileNavigation.css';

/**
 * ProfileSidebar - Navegación lateral del perfil (solo desktop)
 * Con diseño minimalista usando principalmente grises
 */
export const ProfileSidebar = ({ displayName, email, photoURL }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Obtener el rol del usuario
  const { role } = useSelector(state => state.auth);
  const isAdmin = role === 'admin' || role === 'superadmin';

  // Estado para la sección activa
  const [activeSection, setActiveSection] = useState('orders');

  // Actualiza la sección activa basada en la URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/orders')) setActiveSection('orders');
    else if (path.includes('/addresses')) setActiveSection('addresses');
    else if (path.includes('/payments')) setActiveSection('payments');
    else if (path.includes('/settings')) setActiveSection('settings');
    else setActiveSection('orders'); // Default to orders instead of overview
  }, [window.location.pathname]);

  // Items del menú de navegación - removed 'overview'
  const menuItems = [
    { id: 'orders', label: 'Mis Pedidos', icon: 'bag' },
    { id: 'addresses', label: 'Direcciones', icon: 'geo-alt' },
    { id: 'payments', label: 'Métodos de Pago', icon: 'credit-card' },
    { id: 'settings', label: 'Configuración', icon: 'gear' }
  ];


  /**
   * Manejar clic en item de navegación
   * @param {string} sectionId - ID de la sección a navegar
   */
  const handleNavigation = (sectionId) => {
    setActiveSection(sectionId);
    navigate(`/profile/${sectionId}`);
  };


  /**
   * Manejar el cierre de sesión
   */
  const handleLogout = async () => {
    try {
      await signOut(FirebaseAuth);
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };


  return (
    <div className="profile-sidebar">
      {/* Información del usuario */}
      <div className="p-3 text-center bg-white border-bottom">
        <img
          src={photoURL || 'https://via.placeholder.com/100'}
          alt={displayName || 'Usuario'}
          className="rounded-circle mb-2 user-avatar"
        />
        <h5 className="mb-0 fs-6">{displayName || 'Usuario'}</h5>
        <p className="text-muted small mb-0">{email}</p>
      </div>

      {/* Menú de navegación */}
      <div className="p-2">
        {/* Items del menú */}
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`profile-nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => handleNavigation(item.id)}
          >
            <i className={`bi bi-${item.icon} me-2`}></i>
            {item.label}
          </button>
        ))}

        {/* Botón para ir al panel de admin (solo visible para admins) */}
        {isAdmin && (
          <button
            className="profile-nav-item "
            onClick={() => navigate("/admin/home")}
          >
            <i className="bi bi-speedometer2 me-2"></i>
            Panel de Administración
          </button>
        )}

        {/* Botón de cierre de sesión */}
        <button
          className="profile-nav-item text-danger mt-2"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Cerrar Sesión
        </button>
      </div>


    </div>
  );
};