import React, { useState } from 'react';

/**
 * Componente para mostrar y añadir notas administrativas a un pedido
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
      <h5 className="d-flex align-items-center justify-content-between mb-3">
        <span>
          <i className="bi bi-journal-text me-2"></i>
          Notas Administrativas
        </span>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={isProcessing}
        >
          <i className={`bi bi-${isExpanded ? 'dash' : 'plus'}-lg me-1`}></i>
          {isExpanded ? 'Cancelar' : 'Añadir Nota'}
        </button>
      </h5>

      {/* Formulario para nueva nota */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <textarea
                className="form-control mb-3"
                placeholder="Escribe una nota sobre este pedido..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                required
                disabled={isProcessing}
              ></textarea>
              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary"
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
            </div>
          </div>
        </form>
      )}

      {/* Lista de notas existentes */}
      {notes && notes.length > 0 ? (
        <div className="note-list">
          {notes.map((note, index) => (
            <div key={index} className="card mb-3 border-0 shadow-sm">
              <div className="card-body">
                <p className="card-text">{note.text}</p>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">
                    Admin {note.createdBy.substring(0, 8)}...
                  </small>
                  <small className="text-muted">
                    {formatDate(note.createdAt)}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-light text-center">
          <i className="bi bi-journal me-2"></i>
          Aún no hay notas para este pedido.
        </div>
      )}
    </div>
  );
};