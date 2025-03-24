/**
 * Componente para mostrar estadísticas de pedidos con diseño adaptado para sidebar
 *
 * @param {Object} props
 * @param {Object} props.stats - Estadísticas de pedidos
 * @param {boolean} props.loading - Indica si se están cargando las estadísticas
 */
export const OrderStats = ({ stats, loading = false }) => {
  // Formatear cantidad como moneda
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0.00';

    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Si están cargando, mostrar placeholder con efecto skeleton
  if (loading) {
    return (
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="list-group list-group-flush">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="list-group-item border-0">
              <div className="placeholder-glow">
                <span className="placeholder col-6 mb-2"></span>
                <h5 className="placeholder col-4 mb-3"></h5>
                <span className="placeholder col-8"></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Si no hay estadísticas, no mostrar nada
  if (!stats) {
    return null;
  }

  // Definir tarjetas de estadísticas
  const statItems = [
    {
      title: 'Pedidos Hoy',
      value: stats.todaysOrders || 0,
      icon: 'calendar-check',
      color: 'info',
      subtitle: `${formatCurrency(stats.todaysRevenue)} en ventas hoy`,
      trend: stats.todaysOrders > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Pendientes',
      value: stats.pendingOrders || 0,
      icon: 'hourglass-split',
      color: 'warning',
      subtitle: 'Esperando procesamiento',
      trend: stats.pendingOrders > 5 ? 'up' : 'neutral'
    },
    {
      title: 'En Proceso',
      value: stats.processingOrders || 0,
      icon: 'gear',
      color: 'primary',
      subtitle: 'Siendo preparados',
      trend: 'neutral'
    },
    {
      title: 'Total Pedidos',
      value: stats.totalOrders || 0,
      icon: 'cart-check',
      color: 'success',
      subtitle: `${formatCurrency(stats.totalRevenue)} en ventas totales`,
      trend: 'up'
    }
  ];

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="list-group list-group-flush">
        {statItems.map((item, index) => (
          <div key={index} className="list-group-item border-0 py-3">
            <div className="d-flex align-items-center mb-2">
              <div className={`rounded-circle bg-${item.color} bg-opacity-10 p-2 me-3`}>
                <i className={`bi bi-${item.icon} text-${item.color}`}></i>
              </div>
              <span className="text-muted">{item.title}</span>

              {/* Indicador de tendencia */}
              {item.trend !== 'neutral' && (
                <div className={`ms-auto text-${item.trend === 'up' ? 'success' : 'danger'}`}>
                  <i className={`bi bi-arrow-${item.trend}`}></i>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-baseline">
              <h4 className="fw-bold mb-0">{item.value}</h4>
              <small className="text-muted">{item.subtitle}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};