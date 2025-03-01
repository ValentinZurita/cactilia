import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { EmptyState, SectionTitle, ProfileCard } from '../components/shared/index.js';
import '../../../../src/styles/pages/userProfile.css';


/**
 * OverviewPage - Página principal del perfil
 * Versión refinada con mejor estructura visual y más elementos informativos
 */
export const OverviewPage = () => {
  // Obtener datos del usuario desde Redux
  const { displayName, email, photoURL } = useSelector((state) => state.auth);

  // Datos de ejemplo - vendrían de Firebase en implementación real
  const recentOrders = [
    { id: 'ORD-1234', date: '25 Feb 2025', status: 'delivered', total: 129.99, items: 3 },
    { id: 'ORD-1233', date: '18 Feb 2025', status: 'processing', total: 59.99, items: 1 },
  ];

  /**
   * Obtener clase CSS para la etiqueta de estado
   * @param {string} status - Estado del pedido
   * @returns {string} - Clase CSS
   */
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'delivered': return 'badge-delivered';
      case 'processing': return 'badge-processing';
      case 'cancelled': return 'badge-cancelled';
      default: return 'bg-secondary';
    }
  };

  /**
   * Obtener texto para el estado
   * @param {string} status - Estado del pedido
   * @returns {string} - Texto formateado
   */
  const getStatusText = (status) => {
    switch(status) {
      case 'delivered': return 'Entregado';
      case 'processing': return 'En proceso';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  /**
   * Obtener icono para el estado
   * @param {string} status - Estado del pedido
   * @returns {string} - Clase de icono
   */
  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return 'bi-check-circle-fill';
      case 'processing': return 'bi-clock-fill';
      case 'cancelled': return 'bi-x-circle-fill';
      default: return 'bi-circle-fill';
    }
  };

  return (
    <div>
      {/* Título de sección */}
      <SectionTitle title="Mi Cuenta" />

      {/* Perfil del usuario */}
      <ProfileCard>
        <div className="overview-profile">
          <div className="d-flex align-items-center gap-3">
            {/* Avatar */}
            <div className="overview-avatar-container">
              <img
                src={photoURL || 'https://via.placeholder.com/100'}
                alt={displayName || 'Usuario'}
                className="rounded-circle overview-avatar"
              />
            </div>

            {/* Información del usuario */}
            <div className="overview-user-info">
              <h5 className="mb-1">{displayName || 'Usuario'}</h5>
              <p className="text-muted mb-0 small">{email}</p>

              {/* Indicador de cuenta */}
              <div className="account-badge mt-2">
                <i className="bi bi-shield-check"></i>
                <span>Cuenta activa</span>
              </div>
            </div>
          </div>

          {/* Resumen de actividad */}
          <div className="activity-summary mt-3">
            <div className="row g-2">
              <div className="col-4">
                <div className="activity-stat">
                  <span className="activity-value">2</span>
                  <span className="activity-label">Pedidos</span>
                </div>
              </div>
              <div className="col-4">
                <div className="activity-stat">
                  <span className="activity-value">1</span>
                  <span className="activity-label">Direcciones</span>
                </div>
              </div>
              <div className="col-4">
                <div className="activity-stat">
                  <span className="activity-value">1</span>
                  <span className="activity-label">Pagos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProfileCard>

      {/* Sección de pedidos recientes */}
      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <h6 className="mb-0 fw-semibold">Pedidos Recientes</h6>
        <Link to="/profile/orders" className="btn-view-all" title="Ver todos los pedidos">
          <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      {recentOrders.length > 0 ? (
        <div className="recent-orders">
          {recentOrders.map(order => (
            <div key={order.id} className="order-card p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center">
                    <span className="fs-6 fw-medium me-2">{order.id}</span>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      <i className={`bi ${getStatusIcon(order.status)} me-1`}></i>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="text-muted small mt-1">{order.date}</div>
                  <div className="order-meta mt-2">
                    <span className="badge bg-light text-dark me-2">
                      <i className="bi bi-box me-1"></i>
                      {order.items} {order.items === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>
                </div>
                <div className="text-end">
                  <div className="fs-6 fw-bold text-end">${order.total.toFixed(2)}</div>
                  <Link to={`/profile/orders/${order.id}`} className="btn btn-sm btn-outline-secondary mt-2">
                    <i className="bi bi-eye me-1"></i>
                    Ver detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="bag-x"
          title="No hay pedidos recientes"
          message="Aquí verás tus pedidos más recientes"
          actionLink="/shop"
          actionText="Ir a la tienda"
        />
      )}

      {/* Accesos rápidos - Con mejor diseño */}
      <h6 className="mt-4 mb-3 fw-semibold">Accesos Rápidos</h6>
      <div className="row g-3">
        {/* Direcciones */}
        <div className="col-6 col-md-4">
          <Link to="/profile/addresses" className="text-decoration-none">
            <div className="quick-access-card">
              <div className="quick-access-icon">
                <i className="bi bi-geo-alt"></i>
              </div>
              <h5 className="quick-access-title">Direcciones</h5>
              <p className="quick-access-desc">Gestiona tus direcciones de envío</p>
            </div>
          </Link>
        </div>

        {/* Pagos */}
        <div className="col-6 col-md-4">
          <Link to="/profile/payments" className="text-decoration-none">
            <div className="quick-access-card">
              <div className="quick-access-icon">
                <i className="bi bi-credit-card"></i>
              </div>
              <h5 className="quick-access-title">Pagos</h5>
              <p className="quick-access-desc">Administra tus métodos de pago</p>
            </div>
          </Link>
        </div>

        {/* Configuración */}
        <div className="col-6 col-md-4">
          <Link to="/profile/settings" className="text-decoration-none">
            <div className="quick-access-card">
              <div className="quick-access-icon">
                <i className="bi bi-gear"></i>
              </div>
              <h5 className="quick-access-title">Ajustes</h5>
              <p className="quick-access-desc">Actualiza tu información personal</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};