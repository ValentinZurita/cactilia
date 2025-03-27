// =============================================
// OrderNotes.jsx (Con botón añadir centrado y botón guardar oscuro)
// =============================================
import React, { useState } from 'react';

/**
 * Componente para gestionar notas administrativas
 * Con botón "Añadir nota" centrado y botón guardar oscuro para mantener
 * la consistencia visual con el resto del módulo
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
    <>
      {/* Título de la sección */}
      <h6 className="border-bottom pb-2 mb-3 fw-normal text-secondary">Notas administrativas</h6>

      {/* Lista de notas existentes */}
      {notes && notes.length > 0 ? (
        <div className="notes-list mb-3">
          {notes.map((note, index) => (
            <div key={index} className="mb-3 pb-3 border-bottom">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small">Admin {note.createdBy.substring(0, 6)}...</span>
                <span className="text-secondary small">{formatDate(note.createdAt)}</span>
              </div>
              <p className="mb-0">{note.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-3 mb-3">
          <p className="text-secondary mb-0">No hay notas administrativas</p>
        </div>
      )}

      {/* Botón para mostrar/ocultar formulario de notas - CENTRADO */}
      {!isExpanded ? (
        <div className="text-center">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setIsExpanded(true)}
          >
            <i className="bi bi-plus me-1"></i>
            Añadir nota
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pt-2">
          {/* Campo de texto para nueva nota */}
          <div className="mb-3">
            <textarea
              className="form-control border"
              placeholder="Escribe una nota administrativa..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
              disabled={isProcessing}
              autoFocus
            ></textarea>
          </div>

          {/* Botones para guardar o cancelar */}
          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-sm btn-link text-secondary"
              onClick={() => setIsExpanded(false)}
              disabled={isProcessing}
            >
              Cancelar
            </button>
            {/* Botón GUARDAR con color OSCURO en lugar de azul */}
            <button
              type="submit"
              className="btn btn-sm btn-dark"
              disabled={!newNote.trim() || isProcessing}
            >
              {isProcessing ? (
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              ) : null}
              Guardar
            </button>
          </div>
        </form>
      )}
    </>
  );
};