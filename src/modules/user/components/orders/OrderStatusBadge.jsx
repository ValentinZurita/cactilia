/**
 * Componente para mostrar el estado de un pedido con un badge estilizado
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.status - Estado del pedido ('delivered', 'processing', 'cancelled')
 * @param {string} props.className - Clases adicionales para el badge
 * @returns {JSX.Element}
 */

export const OrderStatusBadge = ({ status, className = '' }) => {


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

    <span className={`order-status ${status} ${className}`}>
      <i className={`bi ${getStatusIcon(status)}`}></i>
      {getStatusText(status)}
    </span>

  );
};