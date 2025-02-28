import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { EmptyState, ProfileCard, SectionTitle } from '../components/shared/index.js'


/**
 * OverviewPage
 *
 * The main dashboard page for the user profile showing recent orders,
 * quick links to other sections, and a welcome message.
 */
export const OverviewPage = () => {
  // Get user data from Redux store
  const { displayName } = useSelector((state) => state.auth);

  // Mock data - would come from Firebase in real implementation
  const recentOrders = [
    { id: 'ORD-1234', date: '25 Feb 2025', status: 'delivered', total: 129.99 },
    { id: 'ORD-1233', date: '18 Feb 2025', status: 'processing', total: 59.99 },
  ];

  /**
   * Get CSS class for the status badge
   * @param {string} status - Order status
   * @returns {string} - CSS class
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
   * Get display text for the status
   * @param {string} status - Order status
   * @returns {string} - Formatted text
   */
  const getStatusText = (status) => {
    switch(status) {
      case 'delivered': return 'Entregado';
      case 'processing': return 'En proceso';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div>
      {/* Section title */}
      <SectionTitle title="Mi Cuenta" />

      {/* Welcome card */}
      <ProfileCard>
        <h5>Bienvenido, {displayName}</h5>
        <p className="text-muted mb-0">
          Desde aquí puedes gestionar tus pedidos, direcciones y métodos de pago.
        </p>
      </ProfileCard>

      {/* Recent orders section */}
      <ProfileCard title="Pedidos Recientes">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span></span> {/* Empty span for flex alignment */}
          <Link to="/profile/orders" className="btn btn-sm btn-outline-green">
            Ver todos
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          recentOrders.map(order => (
            <div key={order.id} className="border-bottom py-3">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="mb-1">{order.id}</h6>
                  <p className="text-muted mb-0 small">{order.date}</p>
                </div>
                <div className="text-end">
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <p className="text-green-3 fw-bold mt-1">${order.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon="bag-x"
            title="No hay pedidos recientes"
            message="Aquí verás tus pedidos más recientes"
            actionLink="/shop"
            actionText="Ir a la tienda"
          />
        )}
      </ProfileCard>

      {/* Quick access section */}
      <h5 className="mb-3">Accesos Rápidos</h5>
      <div className="row">
        {/* Address card */}
        <div className="col-md-4 mb-3">
          <Link to="/profile/addresses" className="text-decoration-none">
            <div className="profile-card card shadow-sm text-center p-3 h-100">
              <i className="bi bi-geo-alt fs-1 text-green-3 mb-2"></i>
              <h5>Mis Direcciones</h5>
              <p className="text-muted mb-0 small">Gestiona tus direcciones de envío</p>
            </div>
          </Link>
        </div>

        {/* Payment methods card */}
        <div className="col-md-4 mb-3">
          <Link to="/profile/payments" className="text-decoration-none">
            <div className="profile-card card shadow-sm text-center p-3 h-100">
              <i className="bi bi-credit-card fs-1 text-green-3 mb-2"></i>
              <h5>Métodos de Pago</h5>
              <p className="text-muted mb-0 small">Administra tus tarjetas</p>
            </div>
          </Link>
        </div>

        {/* Settings card */}
        <div className="col-md-4 mb-3">
          <Link to="/profile/settings" className="text-decoration-none">
            <div className="profile-card card shadow-sm text-center p-3 h-100">
              <i className="bi bi-gear fs-1 text-green-3 mb-2"></i>
              <h5>Configuración</h5>
              <p className="text-muted mb-0 small">Edita tu perfil y preferencias</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};