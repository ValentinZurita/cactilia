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
 * @param {Object}   props
 * @param {Object}   [props.data={}]   - Datos actuales de configuración (contiene subjectOptions).
 * @param {Function} props.onUpdate    - Función de callback para actualizar el estado.
 */
export function FormFieldsEditor({ data = {}, onUpdate }) {
  // =========================================================================
  // 1. Estado local: Texto de la nueva opción a añadir
  // =========================================================================
  const [newSubjectOption, setNewSubjectOption] = useState('');

  // =========================================================================
  // 2. Lógica para obtener subjectOptions (usa defaults si no existen en data)
  // =========================================================================
  const subjectOptions = data.subjectOptions || DEFAULT_SUBJECT_OPTIONS;

  // =========================================================================
  // 3. Handlers de acciones (añadir, mover, eliminar)
  // =========================================================================

  /**
   * Añade una nueva opción al array de asuntos
   * si el campo no está vacío.
   */
  function handleAddSubjectOption() {
    if (!newSubjectOption.trim()) return;

    const updatedOptions = [
      ...subjectOptions,
      newSubjectOption.trim()
    ];
    onUpdate({ subjectOptions: updatedOptions });
    setNewSubjectOption('');
  }

  /**
   * Elimina la opción de asunto según su índice.
   *
   * @param {number} index - Índice de la opción a remover
   */
  function handleRemoveSubjectOption(index) {
    const updatedOptions = subjectOptions.filter((_, i) => i !== index);
    onUpdate({ subjectOptions: updatedOptions });
  }

  /**
   * Mueve una opción hacia arriba o abajo.
   *
   * @param {number} index     - Índice actual de la opción
   * @param {number} direction - 1 para bajar, -1 para subir
   */
  function handleMoveOption(index, direction) {
    // Verificar límites (no subir la primera, no bajar la última)
    if ((direction < 0 && index === 0) ||
      (direction > 0 && index === subjectOptions.length - 1)) {
      return;
    }
    const updatedOptions = [...subjectOptions];
    const newIndex = index + direction;

    // Intercambiar elementos
    [updatedOptions[index], updatedOptions[newIndex]] =
      [updatedOptions[newIndex], updatedOptions[index]];
    onUpdate({ subjectOptions: updatedOptions });
  }

  /**
   * Permite añadir la opción pulsando Enter en el input de texto.
   */
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubjectOption();
    }
  }

  // =========================================================================
  // 4. Render principal: seccionamos en helpers para mantenerlo más claro
  // =========================================================================

  return (
    <div className="form-fields-editor">
      <div className="mb-4">
        {renderHeader()}
        {renderSubjectOptionsList()}
        {renderAddOptionForm()}
      </div>
    </div>
  );

  // =========================================================================
  // 5. Funciones locales de render (helpers)
  // =========================================================================

  /**
   * Renderiza el encabezado de la sección: título y descripción.
   */
  function renderHeader() {
    return (
      <>
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">
          Opciones del Campo Asunto
        </h6>
        <p className="text-muted mb-3">
          Define las opciones disponibles en el menú desplegable de asunto.
        </p>
      </>
    );
  }

  /**
   * Muestra la lista de opciones actuales (si las hay)
   * o un mensaje si está vacía.
   */
  function renderSubjectOptionsList() {
    return (
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
                  {renderOptionButtons(index)}
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
    );
  }

  /**
   * Muestra los botones para mover o eliminar una opción específica.
   */
  function renderOptionButtons(index) {
    return (
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
    );
  }

  /**
   * Renderiza el formulario para añadir una nueva opción.
   */
  function renderAddOptionForm() {
    return (
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
          Presiona Enter o haz clic en <strong>Añadir</strong> para agregar una nueva opción.
        </div>
      </div>
    );
  }
}
