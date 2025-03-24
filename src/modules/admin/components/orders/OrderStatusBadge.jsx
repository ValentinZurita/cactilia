/**
 * Componente para mostrar el estado de un pedido como badge
 * Con diseño visual mejorado
 *
 * @param {Object} props
 * @param {string} props.status - Estado del pedido
 * @param {string} props.className - Clases adicionales
 */
export const OrderStatusBadge = ({ status, className = '' }) => {
  // Mapeo de estados a configuración de visualización
  const statusConfig = {
    pending: {
      label: 'Pendiente',
      color: 'warning',
      icon: 'hourglass-split',
      bgClass: 'bg-warning bg-opacity-10'
    },
    processing: {
      label: 'Procesando',
      color: 'primary',
      icon: 'gear',
      bgClass: 'bg-primary bg-opacity-10'
    },
    shipped: {
      label: 'Enviado',
      color: 'info',
      icon: 'truck',
      bgClass: 'bg-info bg-opacity-10'
    },
    delivered: {
      label: 'Entregado',
      color: 'success',
      icon: 'check-circle-fill',
      bgClass: 'bg-success bg-opacity-10'
    },
    cancelled: {
      label: 'Cancelado',
      color: 'danger',
      icon: 'x-circle-fill',
      bgClass: 'bg-danger bg-opacity-10'
    }
  };

  // Si el estado no está definido en la configuración, usar valores por defecto
  const config = statusConfig[status] || {
    label: status || 'Desconocido',
    color: 'secondary',
    icon: 'question-circle',
    bgClass: 'bg-secondary bg-opacity-10'
  };

  return (
    <span className={`badge rounded-pill px-3 py-2 ${config.bgClass} text-${config.color} ${className}`}>
      <i className={`bi bi-${config.icon} me-1`}></i>
      {config.label}
    </span>
  );
};