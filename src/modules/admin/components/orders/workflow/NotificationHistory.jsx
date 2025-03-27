import React from 'react';

/**
 * Componente para mostrar el historial de notificaciones
 *
 * @param {Object} props
 * @param {Object} props.order - Datos del pedido con historial de emails
 */
export const NotificationHistory = ({ order }) => {
  // Formatear timestamp para mostrar fecha y hora
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    try {
      const date = timestamp.toDate ? timestamp.toDate() :
        (timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp));
      return date.toLocaleString('es-MX');
    } catch (error) {
      console.error('Error formateando timestamp:', error);
      return '';
    }
  };

  // Obtener el tipo de notificación en español
  const getNotificationType = (type) => {
    const types = {
      'confirmation': 'confirmación',
      'shipped': 'envío',
      'delivered': 'entrega',
      'cancelled': 'cancelación'
    };
    return types[type] || type;
  };

  // Verificar si hay historial disponible
  const hasHistory = order.emailHistory && order.emailHistory.length > 0;
  const hasLegacyConfirmation = order.emailStatus?.confirmationSent;

  if (!hasHistory && !hasLegacyConfirmation) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-envelope-slash text-secondary opacity-50 d-block mb-2 fs-4"></i>
        <p className="mb-0 text-muted">No hay notificaciones enviadas aún</p>
      </div>
    );
  }

  return (
    <div className="notification-timeline">
      {/* Mostrar el historial nuevo si existe */}
      {hasHistory && (
        order.emailHistory.map((entry, index) => (
          <div key={index} className="d-flex mb-3 pb-3 border-bottom">
            <div
              className={`rounded-circle d-flex justify-content-center align-items-center me-3`}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: entry.success ? 'var(--bs-success)' : 'var(--bs-danger)'
              }}
            >
              <i className={`bi bi-${entry.success ? 'check' : 'x'} text-white`}></i>
            </div>
            <div>
              <p className="mb-0">
                Email de {getNotificationType(entry.type)}
                {entry.success ? ' enviado' : ' fallido'}
              </p>
              <small className="text-muted d-block">
                {formatTimestamp(entry.sentAt)}
              </small>
              {entry.sentBy && entry.sentBy !== 'system' && (
                <small className="text-muted d-block">
                  Enviado por: Admin #{entry.sentBy.substring(0, 6)}
                </small>
              )}
            </div>
          </div>
        ))
      )}

      {/* Mostrar el formato antiguo si no hay historial nuevo pero sí hay confirmación */}
      {!hasHistory && hasLegacyConfirmation && (
        <div className="d-flex mb-3">
          <div
            className="rounded-circle bg-success d-flex justify-content-center align-items-center me-3"
            style={{ width: '32px', height: '32px' }}
          >
            <i className="bi bi-check text-white"></i>
          </div>
          <div>
            <p className="mb-0">Email de confirmación enviado</p>
            <small className="text-muted">
              {formatTimestamp(order.emailStatus.sentAt)}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};