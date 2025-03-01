import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { EmptyState, SectionTitle } from '../components/shared/index.js'
import '../../../../src/styles/pages/userProfile.css';


/**
 * OverviewPage - Página principal del perfil
 * Optimizada para móvil y con esquema de colores minimalista
 */
export const OverviewPage = () => {
  // Obtener datos del usuario desde Redux
  const { displayName } = useSelector((state) => state.auth);

  // Datos de ejemplo - vendrían de Firebase en implementación real
  const recentOrders = [
    { id: 'ORD-1234', date: '25 Feb 2025', status: 'delivered', total: 129.99 },
    { id: 'ORD-1233', date: '18 Feb 2025', status: 'processing', total: 59.99 },
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

  return (
    <div>
      {/* Título de sección */}
      <SectionTitle title="Mi Cuenta" />

      {/* Tarjeta de bienvenida */}
      <div className="profile-card p-3">
        <h6 className="mb-2">Bienvenido, {displayName}</h6>
        <p className="text-muted mb-0 small">
          Aquí puedes gestionar tus pedidos y datos personales.
        </p>
      </div>

      {/* Sección de pedidos recientes */}
      <div className="mt-4 mb-3 d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Pedidos Recientes</h6>
        <Link to="/profile/orders" className="btn-view-all" title="Ver todos los pedidos">
          <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      {recentOrders.length > 0 ? (
        recentOrders.map(order => (
          <div key={order.id} className="order-card p-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="fs-6 fw-medium">{order.id}</div>
                <div className="text-muted small">{order.date}</div>
              </div>
              <div className="text-end">
                <span className={`badge ${getStatusBadgeClass(order.status)} mb-1`}>
                  {getStatusText(order.status)}
                </span>
                <div className="fs-6 fw-bold text-end">${order.total.toFixed(2)}</div>
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

      {/* Accesos rápidos - Optimizados para móvil */}
      <h6 className="my-3">Accesos Rápidos</h6>
      <div className="row g-2">
        {/* Direcciones */}
        <div className="col-4">
          <Link to="/profile/addresses" className="text-decoration-none">
            <div className="quick-access-card">
              <i className="bi bi-geo-alt"></i>
              <h5>Direcciones</h5>
            </div>
          </Link>
        </div>

        {/* Pagos */}
        <div className="col-4">
          <Link to="/profile/payments" className="text-decoration-none">
            <div className="quick-access-card">
              <i className="bi bi-credit-card"></i>
              <h5>Pagos</h5>
            </div>
          </Link>
        </div>

        {/* Configuración */}
        <div className="col-4">
          <Link to="/profile/settings" className="text-decoration-none">
            <div className="quick-access-card">
              <i className="bi bi-gear"></i>
              <h5>Ajustes</h5>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};