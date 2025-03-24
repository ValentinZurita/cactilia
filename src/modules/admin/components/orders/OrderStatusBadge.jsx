/**
 * Componente para mostrar el estado de un pedido como badge
 * Con diseño ultraminimalista y sutil
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
      icon: 'check-circle'
    },
    cancelled: {
      label: 'Cancelado',
      color: 'danger',
      icon: 'x-circle'
    }
  };

  // Si el estado no está definido en la configuración, usar valores por defecto
  const config = statusConfig[status] || {
    label: status || 'Desconocido',
    color: 'secondary',
    icon: 'question-circle'
  };

  // Usar un diseño más sutil sin bordes ni fondos llamativos
  return (
    <span
      className={`text-${config.color} d-inline-flex align-items-center ${className}`}
      style={{
        fontSize: '0.815rem',
        fontWeight: 'normal',
        opacity: 0.85
      }}
    >
      <i className={`bi bi-${config.icon} me-1`} style={{ fontSize: '0.875em' }}></i>
      <span>{config.label}</span>
    </span>
  );
};