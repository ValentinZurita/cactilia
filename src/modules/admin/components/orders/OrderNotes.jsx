import React, { useState } from 'react';

/**
 * Componente para mostrar y añadir notas administrativas a un pedido
 * Con diseño mejorado y simplificado
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

  // Manejador para enviar nueva nota
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newNote.trim() && !isProcessing) {
      onAddNote(newNote);
      setNewNote('');
    }
  };

  return (
    <div className="order-notes">
      {/* Formulario simple para añadir nota */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <textarea
            className="form-control"
            placeholder="Escribe una nota administrativa..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={2}
            disabled={isProcessing}
          ></textarea>
        </div>
        <div className="text-end">
          <button
            type="submit"
            className="btn btn-outline-secondary"
            disabled={!newNote.trim() || isProcessing}
          >
            {isProcessing ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-plus-lg me-1"></i>
            )}
            Añadir nota
          </button>
        </div>
      </form>

      {/* Lista de notas existentes */}
      <div className="notes-list">
        {notes && notes.length > 0 ? (
          <div>
            {notes.map((note, index) => (
              <div key={index} className="bg-light p-3 rounded mb-3">
                <p className="mb-2">{note.text}</p>
                <div className="d-flex justify-content-between text-secondary small">
                  <span>Admin {note.createdBy.substring(0, 8)}...</span>
                  <span>{formatDate(note.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-secondary py-3">
            <i className="bi bi-journal opacity-50 d-block mb-2"></i>
            <p className="mb-0 small">No hay notas administrativas</p>
          </div>
        )}
      </div>
    </div>
  );
};