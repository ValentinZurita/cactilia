import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Formulario para reenviar la notificación de envío
 * - Soporta tanto envíos con transportista como envíos locales
 *
 * @param {Object} props
 * @param {Object} props.order - Datos del pedido
 * @param {Function} props.onComplete - Función a ejecutar cuando se complete
 * @param {Function} props.onCancel - Función para cancelar la acción
 */
export const ResendShippingForm = ({ order, onComplete, onCancel }) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Determinar si hay información existente de seguimiento
  const trackingInfo = order?.shipping?.trackingInfo || {};
  const isLocalDelivery = trackingInfo.isLocal === true ||
    (!trackingInfo.carrier && !trackingInfo.trackingNumber);

  // Preparamos la información a mostrar y enviar
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

      // Parámetro adicional para indicar que esto es solo un reenvío
      // y NO debe cambiar el estado del pedido
      const result = await sendShippedEmail({
        orderId: order.id,
        shippingInfo: shippingInfo,
        resendOnly: true,  // Este parámetro es clave para evitar el cambio de estado
        preserveOrderStatus: true  // Parámetro adicional para garantizar compatibilidad
      });

      if (!result.data.success) {
        throw new Error(result.data.message || 'Error al enviar notificación');
      }

      setSuccess('Email de envío reenviado correctamente');

      // Pequeña pausa para mostrar el mensaje de éxito antes de completar
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
    <div className="resend-shipping-form">
      <h5 className="mb-3">Reenviar Notificación de Envío</h5>

      <p className="text-muted mb-4">
        Esta acción enviará un email de notificación de envío al cliente
        {isLocalDelivery
          ? ', indicando que se trata de una entrega local.'
          : ', incluyendo la información de seguimiento registrada.'}
      </p>

      {/* Mostrar información de envío según el tipo */}
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
          className="btn btn-primary"
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