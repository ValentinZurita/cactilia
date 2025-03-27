import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const OrderEmailStatus = ({ order, onEmailSent }) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Estado del email de confirmación
  const emailSent = order.emailStatus?.confirmationSent === true;
  const sentDate = order.emailStatus?.sentAt;

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

  // Reenviar el email de confirmación
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
    <div>
      <div className="d-flex align-items-center mb-3">
        <div className="rounded-circle bg-light p-2 d-flex align-items-center justify-content-center me-3" style={{ width: '42px', height: '42px', minWidth: '42px' }}>
          <i className="bi bi-envelope text-secondary"></i>
        </div>

        <div className="flex-grow-1">
          <div className="d-flex align-items-center">
            <div className="me-2">Estado:</div>
            {emailSent ? (
              <span className="badge bg-success">Enviado</span>
            ) : (
              <span className="badge bg-danger">No enviado</span>
            )}
          </div>

          {emailSent && sentDate && (
            <div className="small text-muted mt-1">
              Enviado el {formatTimestamp(sentDate)}
            </div>
          )}
        </div>

        <button
          className="btn btn-sm btn-outline-secondary"
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
              <i className="bi bi-arrow-clockwise me-1"></i>
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

      {!emailSent && !error && (
        <div className="alert alert-info py-2 small mt-2">
          <i className="bi bi-info-circle-fill me-2"></i>
          El email de confirmación no se ha enviado aún. Puedes enviarlo manualmente.
        </div>
      )}
    </div>
  );
};