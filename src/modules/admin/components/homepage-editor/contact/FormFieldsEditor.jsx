import React, { useState } from 'react';

/**
 * Opciones por defecto para el campo “Asunto” en el formulario
 * (puedes moverlo a un archivo de constantes si lo prefieres).
 */
const DEFAULT_SUBJECT_OPTIONS = [
  "Consulta general",
  "Soporte técnico",
  "Ventas",
  "Otro"
];

/**
 * Editor para las opciones de campo "Asunto" en el formulario.
 *
 * @param {Object} props
 * @param {Object} [props.data={}]  - Datos actuales de configuración.
 * @param {Function} props.onUpdate - Función de callback para actualizar el estado.
 */
export function FormFieldsEditor({ data = {}, onUpdate }) {
  const [newSubjectOption, setNewSubjectOption] = useState('');

  // Usa las opciones existentes en data, o bien el array por defecto.
  const subjectOptions = data.subjectOptions || DEFAULT_SUBJECT_OPTIONS;

  /** Agrega una nueva opción al array */
  function handleAddSubjectOption() {
    if (!newSubjectOption.trim()) return;
    const updatedOptions = [...subjectOptions, newSubjectOption.trim()];
    onUpdate({ subjectOptions: updatedOptions });
    setNewSubjectOption('');
  }

  /** Elimina la opción por índice */
  function handleRemoveSubjectOption(index) {
    const updatedOptions = subjectOptions.filter((_, i) => i !== index);
    onUpdate({ subjectOptions: updatedOptions });
  }

  /** Sube o baja una opción dentro del array */
  function handleMoveOption(index, direction) {
    if ((direction < 0 && index === 0) ||
      (direction > 0 && index === subjectOptions.length - 1)) {
      return; // Evita moverse fuera de los límites
    }
    const updatedOptions = [...subjectOptions];
    const newIndex = index + direction;
    [updatedOptions[index], updatedOptions[newIndex]] =
      [updatedOptions[newIndex], updatedOptions[index]];
    onUpdate({ subjectOptions: updatedOptions });
  }

  /** Permite añadir con Enter */
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubjectOption();
    }
  }

  return (
    <div className="form-fields-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Opciones del Campo Asunto</h6>
        <p className="text-muted mb-3">
          Define las opciones disponibles en el menú desplegable de asunto.
        </p>

        {/* Lista de opciones actuales */}
        <div className="card mb-3">
          <div className="card-header bg-light py-2">
            <strong>Opciones actuales</strong>
          </div>
          <div className="card-body p-0">
            {subjectOptions.length > 0 ? (
              <div className="list-group list-group-flush">
                {subjectOptions.map((option, index) => (
                  <div
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>{option}</span>
                    <div className="btn-group">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleMoveOption(index, -1)}
                        disabled={index === 0}
                        title="Mover arriba"
                      >
                        <i className="bi bi-arrow-up"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleMoveOption(index, 1)}
                        disabled={index === subjectOptions.length - 1}
                        title="Mover abajo"
                      >
                        <i className="bi bi-arrow-down"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveSubjectOption(index)}
                        title="Eliminar opción"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center text-muted">
                No hay opciones configuradas. Añade al menos una opción.
              </div>
            )}
          </div>
        </div>

        {/* Agregar nueva opción */}
        <div className="mb-3">
          <label className="form-label">Añadir nueva opción</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Escribe una nueva opción..."
              value={newSubjectOption}
              onChange={(e) => setNewSubjectOption(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleAddSubjectOption}
              disabled={!newSubjectOption.trim()}
            >
              <i className="bi bi-plus-lg me-1"></i>
              Añadir
            </button>
          </div>
          <div className="form-text">
            Presiona Enter o haz clic en Añadir para agregar una nueva opción.
          </div>
        </div>
      </div>
    </div>
  );
}
