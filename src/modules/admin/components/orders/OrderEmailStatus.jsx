// src/modules/admin/components/orders/OrderEmailStatus.jsx
import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Componente para mostrar el estado de los emails de un pedido
 * y permitir reenviar emails en caso de error
 */
export const OrderEmailStatus = ({ order, onEmailSent }) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Estado del email de confirmación
  const emailSent = order.emailStatus?.confirmationSent === true;
  const sentDate = order.emailStatus?.sentAt;

  /**
   * Formatea un timestamp para mostrar fecha y hora
   */
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

  /**
   * Reenvía el email de confirmación
   */
  const handleResendEmail = async () => {
    setError(null);
    setSending(true);

    try {
      const functions = getFunctions();
      const resendEmail = httpsCallable(functions, 'resendOrderConfirmationEmail');

      const result = await resendEmail({ orderId: order.id });

      if (result.data.success) {
        if (onEmailSent) {
          onEmailSent();
        }
      }
    } catch (err) {
      setError(err.message || 'Error al reenviar email');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="email-status mt-4">
      <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">
        Estado de Notificaciones
      </h6>

      <div className="d-flex justify-content-between align-items-center">
        <div>
          <span className="me-2">Email de Confirmación:</span>
          {emailSent ? (
            <>
              <span className="badge bg-success">Enviado</span>
              {sentDate && (
                <small className="text-muted ms-2">
                  {formatTimestamp(sentDate)}
                </small>
              )}
            </>
          ) : (
            <span className="badge bg-danger">No Enviado</span>
          )}
        </div>

        <button
          className="btn btn-sm btn-outline-primary"
          onClick={handleResendEmail}
          disabled={sending}
        >
          {sending ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Enviando...
            </>
          ) : (
            <>
              <i className="bi bi-envelope me-1"></i>
              Reenviar
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mt-2">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}
    </section>
  );
};