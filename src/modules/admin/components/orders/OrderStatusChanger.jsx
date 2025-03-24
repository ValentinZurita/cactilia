import { useState } from 'react'

/**
 * Componente para cambiar el estado de un pedido
 * Con diseño mejorado y mejor experiencia de usuario
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
          { value: 'processing', label: 'Procesar pedido', color: 'primary', icon: 'gear',
            description: 'Marcar como en proceso de preparación' },
          { value: 'cancelled', label: 'Cancelar pedido', color: 'danger', icon: 'x-circle',
            description: 'Cancelar completamente este pedido' }
        ];
      case 'processing':
        return [
          { value: 'shipped', label: 'Marcar como enviado', color: 'info', icon: 'truck',
            description: 'El pedido ha sido enviado al cliente' },
          { value: 'cancelled', label: 'Cancelar pedido', color: 'danger', icon: 'x-circle',
            description: 'Cancelar este pedido en proceso' }
        ];
      case 'shipped':
        return [
          { value: 'delivered', label: 'Marcar como entregado', color: 'success', icon: 'check-circle',
            description: 'Confirmar que el cliente ha recibido el pedido' },
          { value: 'cancelled', label: 'Cancelar pedido', color: 'danger', icon: 'x-circle',
            description: 'Cancelar este pedido en tránsito' }
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
    console.log('OrderStatusChanger: Intentando cambiar estado a', selectedStatus, 'con notas:', notes);
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
    return (
      <div className="alert alert-info mb-4 d-flex align-items-center">
        <i className="bi bi-info-circle me-2"></i>
        <div>Este pedido no puede cambiar de estado actualmente.</div>
      </div>
    );
  }

  return (
    <div className="order-status-changer mb-4">
      {!showNotes ? (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-light py-3">
            <h5 className="mb-0 d-flex align-items-center">
              <i className="bi bi-arrow-repeat me-2 text-primary"></i>
              Cambiar estado del pedido
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {validTransitions.map(transition => (
                <div key={transition.value} className="col-md-6">
                  <div className={`card h-100 border border-${transition.color} border-opacity-25`}>
                    <div className={`card-body p-0`}>
                      <div className={`bg-${transition.color} bg-opacity-10 px-3 py-2 border-bottom border-${transition.color} border-opacity-25`}>
                        <h6 className={`mb-0 text-${transition.color} d-flex align-items-center`}>
                          <i className={`bi bi-${transition.icon} me-2`}></i>
                          {transition.label}
                        </h6>
                      </div>
                      <div className="p-3">
                        <p className="card-text text-muted small mb-3">
                          {transition.description}
                        </p>
                        <button
                          className={`btn btn-${transition.color} w-100`}
                          onClick={() => handleSelectStatus(transition.value)}
                          disabled={isProcessing}
                        >
                          <i className={`bi bi-${transition.icon} me-2`}></i>
                          {transition.label}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-light d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 d-flex align-items-center">
              <i className={`bi bi-pencil me-2 text-primary`}></i>
              Añadir nota para el cambio de estado
            </h5>
            <span className="badge bg-primary">
              {validTransitions.find(t => t.value === selectedStatus)?.label}
            </span>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label fw-medium mb-2">Nota (opcional):</label>
              <textarea
                className="form-control"
                placeholder="Añade una nota sobre este cambio de estado..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              ></textarea>
              <div className="form-text">
                La nota se mostrará en el historial y puede ayudar a entender por qué se realizó este cambio.
              </div>
            </div>
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