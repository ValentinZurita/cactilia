// ConfirmationForm.jsx - Mejorado
import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Formulario para reenviar email de confirmación de pedido
 */
export const ConfirmationForm = ({ order, onComplete, onCancel }) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(null);

  // Enviar el email de confirmación
  const handleResendConfirmation = async () => {
    setError(null);
    setDebug(null);
    setSending(true);

    try {
      // Obtener referencia a la función Cloud - usando Firebase real
      const functions = getFunctions();
      
      // NO conectar al emulador - usamos Firebase real
      // if (window.location.hostname === 'localhost') {
      //   connectFunctionsEmulator(functions, 'localhost', 5002);
      // }
      
      // Mostrar información de debugging
      setDebug({
        orderId: order.id,
        modo: "Firebase Real (Producción)",
        timestamp: new Date().toISOString()
      });
      
      console.log("Reenviando email usando Firebase real para pedido:", order.id);
      
      const resendEmail = httpsCallable(functions, 'resendOrderConfirmationEmail');

      // Llamar a la función Cloud
      const result = await resendEmail({ orderId: order.id });
      console.log('Resultado del reenvío:', result.data);

      setDebug(prev => ({
        ...prev, 
        resultado: result.data,
        estado: "Éxito"
      }));

      if (result.data.success) {
        onComplete();
      } else {
        throw new Error(result.data.message || 'Error al reenviar email');
      }
    } catch (err) {
      console.error('Error reenviando email de confirmación:', err);
      
      setDebug(prev => ({
        ...prev, 
        error: err.toString(),
        estado: "Error"
      }));
      
      setError(err.message || 'Error al reenviar email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h5 className="mb-3">Reenviar Email de Confirmación</h5>
      <p className="text-muted mb-4">
        Esta acción enviará nuevamente el email de confirmación de pedido al cliente.
        Útil cuando el cliente no ha recibido la confirmación original.
      </p>

      {error && (
        <div className="alert alert-danger py-2 small mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          
          {debug && (
            <div className="mt-2 p-2 bg-light rounded">
              <small className="d-block fw-bold">Información de depuración:</small>
              <pre className="small mb-0 mt-1">{JSON.stringify(debug, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {!error && debug && (
        <div className="alert alert-info py-2 small mb-3">
          <i className="bi bi-info-circle-fill me-2"></i>
          Usando Firebase real para enviar el email
          
          <div className="mt-2 p-2 bg-light rounded">
            <small className="d-block fw-bold">Información de depuración:</small>
            <pre className="small mb-0 mt-1">{JSON.stringify(debug, null, 2)}</pre>
          </div>
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