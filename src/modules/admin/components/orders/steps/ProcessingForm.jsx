import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { updateOrderStatus } from '../orderAdminService.js'

/**
 * Formulario para actualizar el estado del pedido a "procesando"
 *
 * @param {Object} props
 * @param {Object} props.order - Datos del pedido
 * @param {Function} props.onComplete - Función a ejecutar cuando se complete
 * @param {Function} props.onCancel - Función para cancelar la acción
 */
export const ProcessingForm = ({ order, onComplete, onCancel }) => {
  const { uid } = useSelector(state => state.auth);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // El estado objetivo depende del estado actual
  const targetStatus = order.status === 'pending' ? 'processing' : 'processing';

  const handleUpdateStatus = async () => {
    if (!uid) {
      setError('Error de autenticación. Inicia sesión nuevamente.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const result = await updateOrderStatus(order.id, targetStatus, uid, notes);

      if (!result.ok) {
        throw new Error(result.error || 'Error al actualizar el estado');
      }

      onComplete();
    } catch (err) {
      console.error('Error actualizando estado:', err);
      setError(err.message || 'Error al actualizar el estado');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="processing-form">
      <h5 className="mb-3">
        {order.status === 'pending' ? 'Marcar como procesando' : 'Actualizar estado'}
      </h5>

      <p className="text-muted mb-4">
        {order.status === 'pending'
          ? 'Esta acción indicará que el pedido está siendo preparado.'
          : 'Actualiza la información sobre el procesamiento del pedido.'}
      </p>

      <div className="mb-3">
        <label htmlFor="processingNotes" className="form-label">Notas (opcional)</label>
        <textarea
          id="processingNotes"
          className="form-control"
          placeholder="Información adicional sobre el procesamiento..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          disabled={processing}
        ></textarea>
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
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          onClick={handleUpdateStatus}
          disabled={processing}
        >
          {processing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Procesando...
            </>
          ) : (
            <>
              <i className="bi bi-gear me-2"></i>
              {order.status === 'pending' ? 'Marcar como procesando' : 'Actualizar estado'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};