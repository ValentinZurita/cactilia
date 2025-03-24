import React, { useState } from 'react';

/**
 * Componente para mostrar y añadir notas administrativas a un pedido
 * Con diseño mejorado y mejor interacción
 *
 * @param {Object} props
 * @param {Array} props.notes - Notas existentes
 * @param {Function} props.onAddNote - Función para añadir nueva nota
 * @param {Function} props.formatDate - Función para formatear fechas
 * @param {boolean} props.isProcessing - Indica si hay una operación en proceso
 */
export const OrderNotes = ({
                             notes = [],
                             onAddNote,
                             formatDate,
                             isProcessing = false
                           }) => {
  const [newNote, setNewNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Manejador para enviar nueva nota
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newNote.trim() && !isProcessing) {
      onAddNote(newNote);
      setNewNote('');
      setIsExpanded(false);
    }
  };

  return (
    <div className="order-notes">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-light py-3 border-0 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 d-flex align-items-center">
            <i className="bi bi-journal-text me-2 text-primary"></i>
            Notas Administrativas
          </h5>
          <button
            className={`btn btn-sm ${isExpanded ? 'btn-light' : 'btn-primary'} rounded-pill`}
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={isProcessing}
          >
            <i className={`bi bi-${isExpanded ? 'dash' : 'plus'}-lg me-1`}></i>
            {isExpanded ? 'Cancelar' : 'Añadir Nota'}
          </button>
        </div>

        <div className="card-body">
          {/* Formulario para nueva nota */}
          {isExpanded && (
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="mb-3">
                <textarea
                  className="form-control border rounded-3"
                  placeholder="Escribe una nota administrativa sobre este pedido..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  required
                  disabled={isProcessing}
                  autoFocus
                ></textarea>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary rounded-3 px-4"
                  disabled={!newNote.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-2"></i>
                      Guardar Nota
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Lista de notas existentes */}
          {notes && notes.length > 0 ? (
            <div className="note-list">
              {notes.map((note, index) => (
                <div key={index} className={`card mb-3 rounded-3 border-0 shadow-sm ${index === 0 ? 'border-start border-4 border-primary' : ''}`}>
                  <div className="card-body p-3">
                    <p className="card-text mb-3">{note.text}</p>
                    <div className="d-flex justify-content-between align-items-center text-muted small">
                      <span className="d-flex align-items-center">
                        <i className="bi bi-person-circle me-1"></i>
                        Admin {note.createdBy.substring(0, 8)}...
                      </span>
                      <span className="d-flex align-items-center">
                        <i className="bi bi-clock me-1"></i>
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="bg-light rounded-4 p-4">
                <i className="bi bi-journal d-block mb-3 fs-1 text-muted"></i>
                <p className="mb-0 text-muted">Aún no hay notas para este pedido.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};