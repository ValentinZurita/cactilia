import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../../styles/profileNavigation.css';
import { useSelector } from 'react-redux'

/**
 * Menú de navegación para perfil en dispositivos móviles
 * Se muestra fijo en la parte inferior de la pantalla
 */
export const MobileProfileMenu = () => {
  const navigate = useNavigate();

  // Obtener el rol del usuario
  const { role } = useSelector(state => state.auth);
  const isAdmin = role === 'admin' || role === 'superadmin';

  // Determina qué sección está activa basada en la URL actual
  const [activeSection, setActiveSection] = useState('orders');

  useEffect(() => {
    // Actualiza la sección activa cuando cambia la URL
    const path = window.location.pathname;

    // Extraer la sección de la URL del perfil
    // Por ejemplo, de "/profile/orders" extrae "orders"
    if (path.startsWith('/profile/')) {
      const section = path.split('/')[2] || 'orders';
      setActiveSection(section);
    }
  }, [window.location.pathname]);

  // Función para navegar a una sección
  const navigateTo = (section) => {
    setActiveSection(section);
    navigate(`/profile/${section}`);
  };

  return (
    <div className="mobile-profile-menu">
      {/* Pedidos (ahora es el primer item) */}
      <div
        className={`mobile-menu-item ${activeSection === 'orders' ? 'active' : ''}`}
        onClick={() => navigateTo('orders')}
      >
        <i className="bi bi-bag"></i>
        <span>Pedidos</span>
      </div>

      {/* Direcciones */}
      <div
        className={`mobile-menu-item ${activeSection === 'addresses' ? 'active' : ''}`}
        onClick={() => navigateTo('addresses')}
      >
        <i className="bi bi-geo-alt"></i>
        <span>Direcciones</span>
      </div>

      {/* Pagos */}
      <div
        className={`mobile-menu-item ${activeSection === 'payments' ? 'active' : ''}`}
        onClick={() => navigateTo('payments')}
      >
        <i className="bi bi-credit-card"></i>
        <span>Pagos</span>
      </div>

      {/* Configuración */}
      <div
        className={`mobile-menu-item ${activeSection === 'settings' ? 'active' : ''}`}
        onClick={() => navigateTo('settings')}
      >
        <i className="bi bi-gear"></i>
        <span>Ajustes</span>
      </div>

      {/* Enlace al panel de admin (solo para admins) */}
      {isAdmin && (
        <div
          className="mobile-menu-item"
          onClick={() => navigate('/admin/home')}
        >
          <i className="bi bi-speedometer2"></i>
          <span>Admin</span>
        </div>
      )}
    </div>
  );
};