import { useState } from 'react'

/**
 * Componente para cambiar el estado de un pedido
 * Con diseño mejorado y más simple
 *
 * @param {Object} props
 * @param {string} props.currentStatus - Estado actual del pedido
 * @param {Function} props.onChangeStatus - Función para cambiar el estado
 * @param {boolean} props.isProcessing - Indica si hay una operación en proceso
 */
export const OrderStatusChanger = ({
                                     currentStatus,
                                     onChangeStatus,
                                     isProcessing = false
                                   }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Definir transiciones válidas según el estado actual
  const getValidTransitions = (status) => {
    switch (status) {
      case 'pending':
        return [
          { value: 'processing', label: 'Procesar pedido', icon: 'gear' },
          { value: 'cancelled', label: 'Cancelar pedido', icon: 'x-circle', isDanger: true }
        ];
      case 'processing':
        return [
          { value: 'shipped', label: 'Marcar como enviado', icon: 'truck' },
          { value: 'cancelled', label: 'Cancelar pedido', icon: 'x-circle', isDanger: true }
        ];
      case 'shipped':
        return [
          { value: 'delivered', label: 'Marcar como entregado', icon: 'check-circle' },
          { value: 'cancelled', label: 'Cancelar pedido', icon: 'x-circle', isDanger: true }
        ];
      case 'delivered':
        // Un pedido entregado no puede cambiar de estado
        return [];
      case 'cancelled':
        // Un pedido cancelado no puede cambiar de estado
        return [];
      default:
        return [];
    }
  };

  const validTransitions = getValidTransitions(currentStatus);

  // Manejador para seleccionar un nuevo estado
  const handleSelectStatus = (status) => {
    setSelectedStatus(status);
    setShowNotes(true);
  };

  // Manejador para cambiar el estado
  const handleChangeStatus = () => {
    onChangeStatus(selectedStatus, notes);
    setShowNotes(false);
    setNotes('');
    setSelectedStatus('');
  };

  // Manejador para cancelar el cambio
  const handleCancel = () => {
    setShowNotes(false);
    setNotes('');
    setSelectedStatus('');
  };

  // Si no hay transiciones válidas, mostrar mensaje simplificado
  if (validTransitions.length === 0) {
    return (
      <div className="alert alert-light border">
        <div className="d-flex align-items-center text-secondary">
          <i className="bi bi-info-circle me-2"></i>
          <span>Este pedido no puede cambiar de estado actualmente.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="order-status-changer">
      {!showNotes ? (
        // Lista simple de botones para cambiar estado
        <div className="status-options">
          <div className="d-flex flex-column gap-2">
            {validTransitions.map(transition => (
              <button
                key={transition.value}
                className={`btn ${transition.isDanger ? 'btn-outline-danger' : 'btn-outline-secondary'} d-flex align-items-center justify-content-start`}
                onClick={() => handleSelectStatus(transition.value)}
                disabled={isProcessing}
              >
                <i className={`bi bi-${transition.icon} me-2`}></i>
                {transition.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Formulario para añadir notas al cambio
        <div className="status-notes">
          <div className="mb-3">
            <div className="alert alert-light border mb-3">
              <span className="d-block mb-1">Cambiar estado a:</span>
              <div className="fw-normal">
                <i className={`bi bi-${validTransitions.find(t => t.value === selectedStatus)?.icon} me-2`}></i>
                {validTransitions.find(t => t.value === selectedStatus)?.label}
              </div>
            </div>

            <label className="form-label text-secondary small">Añadir nota (opcional):</label>
            <textarea
              className="form-control"
              placeholder="Escribe una nota sobre este cambio de estado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isProcessing}
            ></textarea>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary flex-grow-1"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary flex-grow-1"
              onClick={handleChangeStatus}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Procesando...
                </>
              ) : (
                <>Confirmar</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};