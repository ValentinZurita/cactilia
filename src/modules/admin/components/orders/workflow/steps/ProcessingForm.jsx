import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateOrderStatus } from '../../services/orderAdminService.js';
import { updateOrderFieldsOptimistic } from '../../slices/ordersSlice.js';
import { fetchOrderById } from '../../thunks/orderThunks.js';

/**
 * Formulario para actualizar el estado del pedido a "procesando"
 * Versión mejorada con actualizaciones optimistas para UI fluida
 */
export const ProcessingForm = ({ order, onComplete, onCancel }) => {
  const dispatch = useDispatch();
  const { uid } = useSelector(state => state.auth);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // El estado objetivo depende del estado actual
  const targetStatus = 'processing';
  const isNewProcessing = order.status === 'pending';

  const handleUpdateStatus = async () => {
    if (!uid) {
      setError('Error de autenticación. Inicia sesión nuevamente.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 1. Actualizar optimistamente primero para UI inmediata
      dispatch(updateOrderFieldsOptimistic({
        orderId: order.id,
        fields: {
          status: targetStatus,
          updatedAt: new Date().toISOString()
        }
      }));

      // 2. Luego hacer la actualización real en el backend
      const result = await updateOrderStatus(order.id, targetStatus, uid, notes);

      if (!result.ok) {
        throw new Error(result.error || 'Error al actualizar el estado');
      }

      // 3. Actualizar solo los datos necesarios del pedido
      // para obtener el historial actualizado
      await dispatch(fetchOrderById(order.id));

      onComplete();
    } catch (err) {
      console.error('Error actualizando estado:', err);
      setError(err.message || 'Error al actualizar el estado');

      // 4. Si falla, revertir a estado anterior
      dispatch(updateOrderFieldsOptimistic({
        orderId: order.id,
        fields: {
          status: order.status,
          updatedAt: order.updatedAt
        }
      }));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <h5 className="mb-3">
        {isNewProcessing ? 'Marcar como procesando' : 'Actualizar estado'}
      </h5>

      <p className="text-muted mb-4">
        {isNewProcessing
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
          className="btn btn-dark"
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
              {isNewProcessing ? 'Marcar como procesando' : 'Actualizar estado'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};