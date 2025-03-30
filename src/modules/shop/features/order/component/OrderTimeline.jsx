import { formatDate } from '../../../utils/index.js'

/**
 * Muestra una línea de tiempo con el estado del pedido
 * @param {Object} props - Propiedades del componente
 * @param {string} props.status - Estado actual del pedido
 * @param {Object} props.createdAt - Fecha de creación del pedido
 * @returns {JSX.Element}
 */
export const OrderTimeline = ({ status, createdAt }) => {
  // Determinar los pasos completados según estado
  const getStepStatus = (stepName) => {
    const statusMap = {
      'pending': ['confirmado'],
      'processing': ['confirmado', 'procesando'],
      'shipped': ['confirmado', 'procesando', 'enviado'],
      'delivered': ['confirmado', 'procesando', 'enviado', 'entregado'],
      'cancelled': ['confirmado', 'cancelado']
    };

    const steps = statusMap[status] || ['confirmado'];
    return steps.includes(stepName) ? 'completed' : 'pending';
  };

  return (
    <div className="order-timeline">
      <h4>Estado del Pedido</h4>

      <div className="timeline-steps">
        <div className={`timeline-step ${getStepStatus('confirmado')}`}>
          <div className="timeline-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="timeline-content">
            <h6>Confirmado</h6>
            <p className="small">{formatDate(createdAt)}</p>
          </div>
        </div>

        {status !== 'cancelled' ? (
          <>
            <div className={`timeline-step ${getStepStatus('procesando')}`}>
              <div className="timeline-icon">
                <i className="bi bi-gear-fill"></i>
              </div>
              <div className="timeline-content">
                <h6>Procesando</h6>
                <p className="small">Preparando tu pedido</p>
              </div>
            </div>

            <div className={`timeline-step ${getStepStatus('enviado')}`}>
              <div className="timeline-icon">
                <i className="bi bi-truck"></i>
              </div>
              <div className="timeline-content">
                <h6>Enviado</h6>
                <p className="small">En camino</p>
              </div>
            </div>

            <div className={`timeline-step ${getStepStatus('entregado')}`}>
              <div className="timeline-icon">
                <i className="bi bi-house-check"></i>
              </div>
              <div className="timeline-content">
                <h6>Entregado</h6>
                <p className="small">Pedido completado</p>
              </div>
            </div>
          </>
        ) : (
          <div className="timeline-step completed cancelled">
            <div className="timeline-icon">
              <i className="bi bi-x-circle-fill"></i>
            </div>
            <div className="timeline-content">
              <h6>Cancelado</h6>
              <p className="small">El pedido ha sido cancelado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};