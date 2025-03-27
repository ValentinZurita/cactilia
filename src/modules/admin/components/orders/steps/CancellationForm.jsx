import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { updateOrderStatus } from '../orderAdminService.js';

/**
 * Formulario para cancelar un pedido
 * Solicita confirmación y motivo de cancelación
 */
export const CancellationForm = ({ order, onComplete, onCancel }) => {
  const { uid } = useSelector(state => state.auth);
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Manejar la cancelación del pedido
  const handleCancelOrder = async () => {
    if (!uid) {
      setError('Error de autenticación. Inicia sesión nuevamente.');
      return;
    }

    if (!confirmed) {
      setError('Debes confirmar la cancelación marcando la casilla.');
      return;
    }

    if (!reason.trim()) {
      setError('Por favor, indica el motivo de la cancelación.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Preparar notas con el motivo de cancelación
      const cancellationNotes = `Motivo de cancelación: ${reason}`;

      const result = await updateOrderStatus(order.id, 'cancelled', uid, cancellationNotes);

      if (!result.ok) {
        throw new Error(result.error || 'Error al cancelar el pedido');
      }

      onComplete();
    } catch (err) {
      console.error('Error cancelando pedido:', err);
      setError(err.message || 'Error al cancelar el pedido');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <h5 className="mb-3">Cancelar Pedido</h5>

      <div className="alert alert-warning py-2 mb-4">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Esta acción cancelará el pedido #{order.id}. Esta operación no se puede deshacer.
      </div>

      <div className="mb-3">
        <label htmlFor="cancellationReason" className="form-label">Motivo de la cancelación</label>
        <textarea
          id="cancellationReason"
          className="form-control"
          placeholder="Indica el motivo de la cancelación..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          disabled={processing}
          required
        ></textarea>
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="confirmCancellation"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          disabled={processing}
        />
        <label className="form-check-label" htmlFor="confirmCancellation">
          Confirmo que deseo cancelar este pedido
        </label>
      </div>

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
          disabled={processing}
        >
          Volver
        </button>
        <button
          className="btn btn-dark"
          onClick={handleCancelOrder}
          disabled={processing || !reason.trim() || !confirmed}
        >
          {processing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Procesando...
            </>
          ) : (
            <>
              <i className="bi bi-x-circle me-2"></i>
              Cancelar Pedido
            </>
          )}
        </button>
      </div>
    </div>
  );
};