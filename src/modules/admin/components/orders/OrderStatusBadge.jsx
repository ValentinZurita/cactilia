import { ORDER_STATUS_CONFIG } from './orderConstants.js'


export const OrderStatusBadge = ({ status, className = '' }) => {

  // Obtener configuración del estado o usar valores por defecto
  const config = ORDER_STATUS_CONFIG[status] || {
    label: status || 'Desconocido',
    color: 'secondary',
    icon: 'question-circle'
  };

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