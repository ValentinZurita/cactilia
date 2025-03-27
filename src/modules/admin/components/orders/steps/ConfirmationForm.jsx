import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Formulario para reenviar email de confirmación de pedido
 *
 * @param {Object} props
 * @param {Object} props.order - Datos del pedido
 * @param {Function} props.onComplete - Función a ejecutar cuando se complete
 * @param {Function} props.onCancel - Función para cancelar la acción
 */
export const ConfirmationForm = ({ order, onComplete, onCancel }) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleResendConfirmation = async () => {
    setError(null);
    setSending(true);

    try {
      // Obtener referencia a la función Cloud
      const functions = getFunctions();
      const resendEmail = httpsCallable(functions, 'resendOrderConfirmationEmail');

      // Llamar a la función Cloud
      const result = await resendEmail({ orderId: order.id });

      if (result.data.success) {
        onComplete();
      } else {
        throw new Error(result.data.message || 'Error al reenviar email');
      }
    } catch (err) {
      console.error('Error reenviando email de confirmación:', err);
      setError(err.message || 'Error al reenviar email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="confirmation-form">
      <h5 className="mb-3">Reenviar Email de Confirmación</h5>
      <p className="text-muted mb-4">
        Esta acción enviará nuevamente el email de confirmación de pedido al cliente.
        Útil cuando el cliente no ha recibido la confirmación original.
      </p>

      {error && (
        <div className="alert alert-danger py-2 small mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-secondary"
          onClick={onCancel}
          disabled={sending}
        >
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          onClick={handleResendConfirmation}
          disabled={sending}
        >
          {sending ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Enviando...
            </>
          ) : (
            <>
              <i className="bi bi-envelope me-2"></i>
              Reenviar confirmación
            </>
          )}
        </button>
      </div>
    </div>
  );
};