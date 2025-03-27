import React from 'react';

/**
 * Muestra el historial de notificaciones enviadas al cliente
 */
export const NotificationHistory = ({ order }) => {
  // Función para formatear timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() :
        (timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp));
      return date.toLocaleString('es-MX');
    } catch (error) {
      return '';
    }
  };

  // Mapeo de tipos de notificación
  const getNotificationType = (type) => {
    const types = {
      'confirmation': 'confirmación',
      'shipped': 'envío',
      'delivered': 'entrega',
      'cancelled': 'cancelación'
    };
    return types[type] || type;
  };

  // Verificar si hay historial
  const hasHistory = order.emailHistory && order.emailHistory.length > 0;
  const hasLegacyConfirmation = order.emailStatus?.confirmationSent;

  // Estado vacío
  if (!hasHistory && !hasLegacyConfirmation) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-envelope text-secondary opacity-50 d-block mb-2 fs-4"></i>
        <p className="text-muted mb-0">No hay notificaciones enviadas</p>
      </div>
    );
  }

  return (
    <ul className="list-unstyled border-top pt-3">
      {/* Nuevo formato */}
      {hasHistory && order.emailHistory.map((entry, index) => (
        <li key={index} className="d-flex align-items-start mb-3 pb-3 border-bottom border-light">
          <i className={`bi bi-${entry.success ? 'check-circle' : 'x-circle'} 
                      text-${entry.success ? 'dark' : 'secondary'} me-3 mt-1`}></i>
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
        </li>
      ))}

      {/* Formato legacy */}
      {!hasHistory && hasLegacyConfirmation && (
        <li className="d-flex align-items-start mb-3 pb-3 border-bottom border-light">
          <i className="bi bi-check-circle text-dark me-3 mt-1"></i>
          <div>
            <p className="mb-0">Email de confirmación enviado</p>
            <small className="text-muted">
              {formatTimestamp(order.emailStatus.sentAt)}
            </small>
          </div>
        </li>
      )}
    </ul>
  );
};