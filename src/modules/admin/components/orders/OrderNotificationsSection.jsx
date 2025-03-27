import React from 'react';
import { OrderEmailStatus } from './OrderEmailStatus';
import { OrderShippingForm } from './OrderShippingForm';

export const OrderNotificationsSection = ({
                                            order,
                                            onOrderUpdate
                                          }) => {
  // Formatear timestamp para mostrar fecha y hora
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('es-MX');
    } catch (error) {
      console.error('Error formateando timestamp:', error);
      return '';
    }
  };

  return (
    <div className="row g-4">
      {/* Sección de email de confirmación */}
      <div className="col-md-6">
        <div className="mb-4">
          <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Email de confirmación</h6>
          <OrderEmailStatus
            order={order}
            onEmailSent={onOrderUpdate}
          />
        </div>
      </div>

      {/* Sección para futuras notificaciones */}
      <div className="col-md-6">
        <div className="mb-4">
          <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Historial de notificaciones</h6>

          {order.emailHistory && order.emailHistory.length > 0 ? (
            <div>
              {order.emailHistory.map((entry, index) => (
                <div key={index} className="d-flex mb-3 border-bottom pb-3">
                  <div
                    className={`rounded-circle d-flex justify-content-center align-items-center me-3`}
                    style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: entry.success ? '#198754' : '#dc3545'
                    }}
                  >
                    <i className={`bi bi-${entry.success ? 'check' : 'x'} text-white`}></i>
                  </div>
                  <div>
                    <p className="mb-0">
                      Email de {
                      entry.type === 'confirmation' ? 'confirmación' :
                        entry.type === 'shipped' ? 'envío' :
                          entry.type
                    }
                      {entry.success ? ' enviado' : ' fallido'}
                    </p>
                    <small className="text-muted d-block">
                      {formatTimestamp(entry.sentAt)}
                    </small>
                    {entry.sentBy && entry.sentBy !== 'system' && (
                      <small className="text-muted d-block">
                        Reenviado por: Admin #{entry.sentBy.substring(0, 6)}
                      </small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Para compatibilidad con el formato actual
            order.emailStatus?.confirmationSent ? (
              <div className="d-flex mb-3">
                <div className="bg-success rounded-circle d-flex justify-content-center align-items-center me-3" style={{width: "32px", height: "32px"}}>
                  <i className="bi bi-check text-white"></i>
                </div>
                <div>
                  <p className="mb-0">Email de confirmación enviado</p>
                  <small className="text-muted">
                    {formatTimestamp(order.emailStatus.sentAt)}
                  </small>
                </div>
              </div>
            ) : (
              <div className="text-muted small">
                <i className="bi bi-info-circle me-2"></i>
                No hay notificaciones enviadas aún
              </div>
            )
          )}
        </div>
      </div>

      {/* Sección de Envío - NUEVA */}
      <div className="col-12">
        <div className="card border-0 shadow-sm rounded-3 p-3 mt-2">
          <OrderShippingForm
            order={order}
            onOrderUpdated={onOrderUpdate}
          />
        </div>
      </div>
    </div>
  );
};