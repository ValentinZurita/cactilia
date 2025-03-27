// DeliveryForm.jsx - Mejorado
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { updateOrderStatus } from '../../services/orderAdminService.js';

/**
 * Formulario para marcar el pedido como entregado
 */
export const DeliveryForm = ({ order, onComplete, onCancel }) => {
  const { uid } = useSelector(state => state.auth);
  const [notes, setNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirmDelivery = async () => {
    if (!uid) {
      setError('Error de autenticación. Inicia sesión nuevamente.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Preparar notas con la fecha de entrega
      const deliveryNotes = `Entregado el ${deliveryDate}. ${notes}`.trim();

      const result = await updateOrderStatus(order.id, 'delivered', uid, deliveryNotes);

      if (!result.ok) {
        throw new Error(result.error || 'Error al confirmar la entrega');
      }

      onComplete();
    } catch (err) {
      console.error('Error confirmando entrega:', err);
      setError(err.message || 'Error al confirmar la entrega');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <h5 className="mb-3">Confirmar Entrega del Pedido</h5>

      <p className="text-muted mb-4">
        Esta acción marcará el pedido como entregado al cliente.
      </p>

      <div className="mb-3">
        <label htmlFor="deliveryDate" className="form-label">Fecha de entrega</label>
        <input
          type="date"
          id="deliveryDate"
          className="form-control"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          disabled={processing}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="deliveryNotes" className="form-label">Notas (opcional)</label>
        <textarea
          id="deliveryNotes"
          className="form-control"
          placeholder="Información adicional sobre la entrega..."
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
          onClick={handleConfirmDelivery}
          disabled={processing}
        >
          {processing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Procesando...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Confirmar entrega
            </>
          )}
        </button>
      </div>
    </div>
  );
};