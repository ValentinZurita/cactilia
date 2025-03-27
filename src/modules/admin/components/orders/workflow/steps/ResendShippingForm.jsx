// ResendShippingForm.jsx - Mejorado
import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Formulario para reenviar la notificación de envío
 */
export const ResendShippingForm = ({ order, onComplete, onCancel }) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Determinar si hay información existente de seguimiento
  const trackingInfo = order?.shipping?.trackingInfo || {};
  const isLocalDelivery = trackingInfo.isLocal === true ||
    (!trackingInfo.carrier && !trackingInfo.trackingNumber);

  // Preparar información a mostrar y enviar
  const shippingInfo = isLocalDelivery
    ? { isLocal: true, carrier: 'Entrega local' }
    : trackingInfo;

  const handleResendShippingEmail = async () => {
    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const functions = getFunctions();
      const sendShippedEmail = httpsCallable(functions, 'sendOrderShippedEmail');

      // Parámetros para indicar que esto es solo un reenvío
      const result = await sendShippedEmail({
        orderId: order.id,
        shippingInfo: shippingInfo,
        resendOnly: true,
        preserveOrderStatus: true
      });

      if (!result.data.success) {
        throw new Error(result.data.message || 'Error al enviar notificación');
      }

      setSuccess('Email de envío reenviado correctamente');

      // Pequeña pausa para mostrar el mensaje de éxito
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      console.error('Error reenviando notificación de envío:', err);
      setError(err.message || 'Error al enviar notificación');
      setSending(false);
    }
  };

  return (
    <div>
      <h5 className="mb-3">Reenviar Notificación de Envío</h5>

      <p className="text-muted mb-4">
        Esta acción enviará un email de notificación de envío al cliente
        {isLocalDelivery
          ? ', indicando que se trata de una entrega local.'
          : ', incluyendo la información de seguimiento registrada.'}
      </p>

      {/* Mostrar información de envío */}
      <div className="card mb-3">
        <div className="card-body p-3">
          <div className="mb-1 small text-muted">Información de envío:</div>

          {isLocalDelivery ? (
            <p className="mb-0">
              <strong>Tipo de entrega:</strong> Entrega local/directa
            </p>
          ) : (
            <>
              {trackingInfo.carrier && (
                <p className="mb-1">
                  <strong>Transportista:</strong> {trackingInfo.carrier}
                </p>
              )}
              {trackingInfo.trackingNumber && (
                <p className="mb-1">
                  <strong>Número de guía:</strong> {trackingInfo.trackingNumber}
                </p>
              )}
              {trackingInfo.trackingUrl && (
                <p className="mb-1">
                  <strong>URL de seguimiento:</strong>{' '}
                  <a href={trackingInfo.trackingUrl} target="_blank" rel="noopener noreferrer">
                    {trackingInfo.trackingUrl}
                  </a>
                </p>
              )}
              {trackingInfo.estimatedDelivery && (
                <p className="mb-0">
                  <strong>Entrega estimada:</strong> {trackingInfo.estimatedDelivery}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success py-2 small mb-3">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
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
          className="btn btn-dark"
          onClick={handleResendShippingEmail}
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
              Reenviar notificación
            </>
          )}
        </button>
      </div>
    </div>
  );
};