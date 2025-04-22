import React, { memo, useCallback } from 'react';

/**
 * Componente para editar un único item de Pregunta/Respuesta (FAQ).
 * Permite modificar la pregunta, la respuesta, eliminar el item o cambiar su orden.
 *
 * @param {object} props
 * @param {object} props.item - El objeto del item FAQ { id, question, answer }.
 * @param {number} props.index - El índice del item en la lista.
 * @param {function} props.onUpdate - Callback para actualizar el item (index, field, value).
 * @param {function} props.onRemove - Callback para eliminar el item (index).
 * @param {function} props.onMoveUp - Callback para mover el item hacia arriba (index).
 * @param {function} props.onMoveDown - Callback para mover el item hacia abajo (index).
 * @param {boolean} props.isFirst - Indica si es el primer item de la lista (para deshabilitar botón subir).
 * @param {boolean} props.isLast - Indica si es el último item de la lista (para deshabilitar botón bajar).
 * @returns {JSX.Element}
 */
export const FaqItemEditor = memo(({ 
  item, 
  index, 
  onUpdate, 
  onRemove, 
  onMoveUp, 
  onMoveDown, 
  isFirst, 
  isLast 
}) => {

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    onUpdate(index, name, value);
  }, [index, onUpdate]);

  const handleRemoveClick = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  const handleMoveUpClick = useCallback(() => {
    onMoveUp(index);
  }, [index, onMoveUp]);

  const handleMoveDownClick = useCallback(() => {
    onMoveDown(index);
  }, [index, onMoveDown]);

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Pregunta #{index + 1}</h5>
          <div className="btn-group btn-group-sm" role="group" aria-label="Acciones de item">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleMoveUpClick}
              disabled={isFirst}
              title="Mover hacia arriba"
            >
              <i className="bi bi-arrow-up"></i>
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleMoveDownClick}
              disabled={isLast}
              title="Mover hacia abajo"
            >
              <i className="bi bi-arrow-down"></i>
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleRemoveClick}
              title="Eliminar pregunta"
              aria-label={`Eliminar pregunta ${index + 1}`}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor={`faq-question-${index}`} className="form-label visually-hidden">Pregunta</label>
          <input
            type="text"
            className="form-control"
            id={`faq-question-${index}`}
            name="question"
            value={item.question || ''}
            onChange={handleInputChange}
            placeholder="Escribe la pregunta aquí"
            required
            aria-label={`Pregunta ${index + 1}`}
          />
        </div>

        <div className="mb-0">
          <label htmlFor={`faq-answer-${index}`} className="form-label visually-hidden">Respuesta</label>
          <textarea
            className="form-control"
            id={`faq-answer-${index}`}
            name="answer"
            rows="4"
            value={item.answer || ''}
            onChange={handleInputChange}
            placeholder="Escribe la respuesta aquí"
            required
            aria-label={`Respuesta a la pregunta ${index + 1}`}
          ></textarea>
        </div>
      </div>
    </div>
  );
});

// Opcional: Añadir displayName para mejorar debugging en React DevTools
FaqItemEditor.displayName = 'FaqItemEditor'; 