// ===============================
// src/modules/admin/components/orders/OrderNotes.jsx - Rediseñado
// ===============================
import React, { useState } from 'react';

/**
 * Componente para mostrar y añadir notas administrativas a un pedido
 * Versión minimalista y elegante
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
      {/* Lista de notas existentes - Estilo minimalista */}
      {notes && notes.length > 0 ? (
        <div className="notes-list mb-3">
          {notes.map((note, index) => (
            <div key={index} className="d-flex mb-3">
              <div className="flex-shrink-0 me-2">
                <div className="rounded-circle bg-light p-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                  <i className="bi bi-person text-secondary small"></i>
                </div>
              </div>
              <div className="flex-grow-1 bg-light p-2 rounded">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary small">Admin {note.createdBy.substring(0, 6)}...</span>
                  <span className="text-secondary small">{formatDate(note.createdAt)}</span>
                </div>
                <p className="mb-0 small">{note.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-3 mb-3">
          <i className="bi bi-sticky text-secondary opacity-50 d-block mb-2"></i>
          <p className="text-muted small mb-0">No hay notas administrativas</p>
        </div>
      )}

      {/* Botón minimalista para mostrar/ocultar formulario de notas */}
      {!isExpanded ? (
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-flex align-items-center"
          onClick={() => setIsExpanded(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Añadir nota
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-light rounded p-3">
          <div className="mb-3">
            <textarea
              className="form-control form-control-sm border bg-white"
              placeholder="Escribe una nota administrativa..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
              disabled={isProcessing}
              autoFocus
            ></textarea>
          </div>
          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-sm btn-link text-muted"
              onClick={() => setIsExpanded(false)}
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-primary"
              disabled={!newNote.trim() || isProcessing}
            >
              {isProcessing ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-check-lg me-1"></i>
              )}
              Guardar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};