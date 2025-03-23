/**
 * Componente para mostrar el estado de un pedido como badge
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
      icon: 'hourglass-split'
    },
    processing: {
      label: 'Procesando',
      color: 'primary',
      icon: 'gear'
    },
    shipped: {
      label: 'Enviado',
      color: 'info',
      icon: 'truck'
    },
    delivered: {
      label: 'Entregado',
      color: 'success',
      icon: 'check-circle-fill'
    },
    cancelled: {
      label: 'Cancelado',
      color: 'danger',
      icon: 'x-circle-fill'
    }
  };

  // Si el estado no está definido en la configuración, usar valores por defecto
  const config = statusConfig[status] || {
    label: status || 'Desconocido',
    color: 'secondary',
    icon: 'question-circle'
  };

  return (
    <span className={`badge bg-${config.color} ${className}`}>
      <i className={`bi bi-${config.icon} me-1`}></i>
      {config.label}
    </span>
  );
};