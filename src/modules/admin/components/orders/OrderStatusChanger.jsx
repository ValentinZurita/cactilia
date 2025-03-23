import { useState } from 'react'

/**
 * Componente para cambiar el estado de un pedido
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
          { value: 'processing', label: 'Procesar pedido', color: 'primary', icon: 'gear' },
          { value: 'cancelled', label: 'Cancelar pedido', color: 'danger', icon: 'x-circle' }
        ];
      case 'processing':
        return [
          { value: 'shipped', label: 'Marcar como enviado', color: 'info', icon: 'truck' },
          { value: 'cancelled', label: 'Cancelar pedido', color: 'danger', icon: 'x-circle' }
        ];
      case 'shipped':
        return [
          { value: 'delivered', label: 'Marcar como entregado', color: 'success', icon: 'check-circle' },
          { value: 'cancelled', label: 'Cancelar pedido', color: 'danger', icon: 'x-circle' }
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

  // Si no hay transiciones válidas, no mostrar nada
  if (validTransitions.length === 0) {
    return null;
  }

  return (
    <div className="order-status-changer">
      {!showNotes ? (
        <div className="d-flex flex-wrap gap-2">
          {validTransitions.map(transition => (
            <button
              key={transition.value}
              className={`btn btn-${transition.color}`}
              onClick={() => handleSelectStatus(transition.value)}
              disabled={isProcessing}
            >
              <i className={`bi bi-${transition.icon} me-2`}></i>
              {transition.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body">
            <h6 className="card-subtitle mb-3">
              <i className={`bi bi-pencil me-2`}></i>
              Añadir nota (opcional):
            </h6>
            <textarea
              className="form-control mb-3"
              placeholder="Añade una nota sobre este cambio de estado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            ></textarea>
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleChangeStatus}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Procesando...
                  </>
                ) : (
                  <>Confirmar cambio</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};