import React, { useState } from 'react';
import { ORDER_TRANSITIONS } from '../utils/orderConstants.js';

// Componente reutilizable
const IconCircle = ({ icon, className = '', color = 'secondary', ...props }) => (
  <div
    className={`rounded-circle bg-${color}-subtle d-flex align-items-center justify-content-center me-3 ${className}`}
    style={{ width: '38px', height: '38px', minWidth: '38px' }}
    {...props}
  >
    <i className={`bi bi-${icon} text-${color}`}></i>
  </div>
);

export const OrderStatusChanger = ({
                                     currentStatus,
                                     onChangeStatus,
                                     isProcessing = false
                                   }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const validTransitions = ORDER_TRANSITIONS[currentStatus] || [];

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

  // Si no hay transiciones válidas, mostrar mensaje
  if (validTransitions.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center text-center py-4">
        <div>
          <i className="bi bi-info-circle text-secondary opacity-50 fs-3 mb-3 d-block"></i>
          <p className="mb-0 text-muted">Este pedido no puede cambiar de estado actualmente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-status-changer">
      {!showNotes ? (
        // Lista de opciones para cambiar estado
        <div className="transition-options">
          {validTransitions.map(transition => (
            <button
              key={transition.value}
              className="btn w-100 d-flex align-items-center text-start mb-3 border rounded-3 py-3 px-3 bg-white"
              onClick={() => handleSelectStatus(transition.value)}
              disabled={isProcessing}
            >
              <IconCircle
                icon={transition.icon}
                color={transition.isDanger ? 'danger' :
                  transition.value === 'shipped' ? 'info' :
                    transition.value === 'delivered' ? 'success' : 'primary'}
              />
              {/* Texto en gris oscuro */}
              <span className="text-secondary">
                {transition.label}
              </span>
            </button>
          ))}
        </div>
      ) : (
        // Formulario para agregar notas
        <div className="status-notes-form">
          <div className="bg-light rounded-3 p-3 mb-3">
            <div className="mb-2 small text-secondary">Cambiar estado a:</div>
            <div className="d-flex align-items-center">
              <IconCircle
                icon={validTransitions.find(t => t.value === selectedStatus)?.icon || 'arrow-right'}
                color={
                  selectedStatus === 'cancelled' ? 'danger' :
                    selectedStatus === 'shipped' ? 'info' :
                      selectedStatus === 'delivered' ? 'success' : 'primary'
                }
              />
              {/* Texto en gris oscuro */}
              <span className="fw-medium text-secondary">
                {validTransitions.find(t => t.value === selectedStatus)?.label}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small text-secondary mb-2">Nota sobre este cambio (opcional):</label>
            <textarea
              className="form-control border bg-white"
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
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Procesando...
                </>
              ) : (
                'Confirmar'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};