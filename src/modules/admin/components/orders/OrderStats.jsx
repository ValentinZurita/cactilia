/**
 * Componente para mostrar estadísticas de pedidos
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

  // Si están cargando, mostrar placeholder
  if (loading) {
    return (
      <div className="row stats-cards g-3 mb-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-md-6 col-lg-3">
            <div className="card bg-light">
              <div className="card-body p-3">
                <div className="placeholder-glow">
                  <span className="placeholder col-6 mb-2"></span>
                  <h2 className="placeholder col-4"></h2>
                  <span className="placeholder col-8"></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Si no hay estadísticas, no mostrar nada
  if (!stats) {
    return null;
  }

  // Definir tarjetas de estadísticas
  const statCards = [
    {
      title: 'Pedidos Hoy',
      value: stats.todaysOrders || 0,
      icon: 'calendar-check',
      color: 'info',
      footer: `${formatCurrency(stats.todaysRevenue)} en ventas hoy`
    },
    {
      title: 'Pendientes',
      value: stats.pendingOrders || 0,
      icon: 'hourglass-split',
      color: 'warning',
      footer: 'Esperando procesamiento'
    },
    {
      title: 'En Proceso',
      value: stats.processingOrders || 0,
      icon: 'gear',
      color: 'primary',
      footer: 'Siendo preparados'
    },
    {
      title: 'Total Pedidos',
      value: stats.totalOrders || 0,
      icon: 'cart-check',
      color: 'success',
      footer: `${formatCurrency(stats.totalRevenue)} en ventas totales`
    }
  ];

  return (
    <div className="row stats-cards g-3 mb-4">
      {statCards.map((card, index) => (
        <div key={index} className="col-md-6 col-lg-3">
          <div className={`card border-0 shadow-sm bg-white h-100`}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center mb-3">
                <div className={`rounded-circle bg-${card.color} bg-opacity-10 p-2 me-3`}>
                  <i className={`bi bi-${card.icon} fs-5 text-${card.color}`}></i>
                </div>
                <h6 className="card-subtitle text-muted mb-0">{card.title}</h6>
              </div>
              <h2 className="card-title mb-1 fw-bold">{card.value}</h2>
              <p className="card-text text-muted small mb-0">{card.footer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};