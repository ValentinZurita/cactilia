import React, { useState } from 'react';

/**
 * Editor para la lista de redes sociales.
 *
 * @param {Object}   props
 * @param {Object}   [props.data={}]  - Datos actuales de la sección (items, etc.).
 * @param {Function} props.onUpdate   - Actualiza el estado de la sección.
 */
export function SocialMediaEditor({ data = {}, onUpdate }) {
  // =========================================================================
  // 1. Estados locales
  // =========================================================================
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({
    label: '',
    icon: '',
    url: '',
    visible: true
  });
  const [newSocialForm, setNewSocialForm] = useState({
    label: '',
    icon: '',
    url: '',
    visible: true
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // =========================================================================
  // 2. Obtención de items de redes sociales (con fallback si no hay datos)
  // =========================================================================
  const socialItems = data.items || [];

  // =========================================================================
  // 3. Handlers de acciones: editar, guardar, añadir, etc.
  // =========================================================================

  /**
   * Inicia la edición de una red social dada por su índice.
   */
  function startEditing(index) {
    setEditingIndex(index);
    setEditForm(socialItems[index]);
  }

  /**
   * Guarda los cambios de la red social en edición y sale de modo edición.
   */
  function saveEdit() {
    if (editingIndex === null) return;
    const updatedItems = [...socialItems];
    updatedItems[editingIndex] = { ...editForm };
    onUpdate({ items: updatedItems });
    setEditingIndex(null);
  }

  /**
   * Cancela la edición, regresando al modo de visualización.
   */
  function cancelEdit() {
    setEditingIndex(null);
  }

  /**
   * Alterna la visibilidad de la red social (mostrar/ocultar).
   */
  function toggleVisibility(index) {
    const updatedItems = [...socialItems];
    updatedItems[index] = {
      ...updatedItems[index],
      visible: !updatedItems[index].visible
    };
    onUpdate({ items: updatedItems });
  }

  /**
   * Añade una nueva red social con los datos del formulario.
   */
  function addNewSocialMedia() {
    if (!newSocialForm.label || !newSocialForm.icon || !newSocialForm.url) {
      alert("Por favor completa todos los campos");
      return;
    }
    const updatedItems = [...socialItems, { ...newSocialForm }];
    onUpdate({ items: updatedItems });
    setNewSocialForm({ label: '', icon: '', url: '', visible: true });
    setShowAddForm(false);
  }

  /**
   * Elimina una red social tras confirmación.
   */
  function removeSocialMedia(index) {
    const itemLabel = socialItems[index]?.label || 'la red social';
    if (window.confirm(`¿Estás seguro de eliminar ${itemLabel}?`)) {
      const updatedItems = socialItems.filter((_, i) => i !== index);
      onUpdate({ items: updatedItems });
    }
  }

  // =========================================================================
  // 4. Render principal, dividiéndolo en helpers para mayor legibilidad
  // =========================================================================
  return (
    <div className="social-media-editor">
      {renderHeader()}
      {renderAddButtonAndInstructions()}
      {renderAddForm()}
      {renderSocialMediaList()}
    </div>
  );

  // =========================================================================
  // 5. Funciones locales de render (helpers)
  // =========================================================================

  /**
   * Renderiza el encabezado principal de la sección.
   */
  function renderHeader() {
    return (
      <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">
        Redes Sociales
      </h6>
    );
  }

  /**
   * Renderiza el bloque con el botón para "Añadir Red Social" y la pequeña instrucción.
   */
  function renderAddButtonAndInstructions() {
    return (
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="mb-0">Configura los enlaces a tus redes sociales:</p>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <i className="bi bi-plus-lg me-1" /> Añadir Red Social
        </button>
      </div>
    );
  }

  /**
   * Renderiza el formulario para añadir una nueva red social (si showAddForm es true).
   */
  function renderAddForm() {
    if (!showAddForm) return null;

    return (
      <div className="add-social-form mb-4 p-3 border rounded bg-light">
        <h6 className="mb-3 border-bottom pb-2">Añadir Nueva Red Social</h6>

        {renderAddFormFields()}
        {renderAddFormButtons()}
      </div>
    );
  }

  /**
   * Campos del formulario para añadir (Nombre, Ícono, URL).
   */
  function renderAddFormFields() {
    return (
      <>
        <div className="mb-2">
          <label className="form-label">Red Social</label>
          <input
            type="text"
            className="form-control"
            value={newSocialForm.label}
            onChange={(e) =>
              setNewSocialForm({ ...newSocialForm, label: e.target.value })
            }
            placeholder="Ej: Facebook"
          />
        </div>

        <div className="mb-2">
          <label className="form-label">Ícono</label>
          <input
            type="text"
            className="form-control"
            value={newSocialForm.icon}
            onChange={(e) =>
              setNewSocialForm({ ...newSocialForm, icon: e.target.value })
            }
            placeholder="Ej: bi-facebook"
          />
          <div className="form-text">
            Usa clases de{' '}
            <a
              href="https://icons.getbootstrap.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bootstrap Icons
            </a>{' '}
            (ej. <code>bi-facebook</code>, <code>bi-instagram</code>).
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">URL</label>
          <input
            type="url"
            className="form-control"
            value={newSocialForm.url}
            onChange={(e) =>
              setNewSocialForm({ ...newSocialForm, url: e.target.value })
            }
            placeholder="https://..."
          />
        </div>
      </>
    );
  }

  /**
   * Botones "Cancelar" y "Añadir" para el formulario de nueva red social.
   */
  function renderAddFormButtons() {
    return (
      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => setShowAddForm(false)}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={addNewSocialMedia}
        >
          Añadir
        </button>
      </div>
    );
  }

  /**
   * Lista principal con las redes sociales configuradas
   * o un mensaje en caso de no haber ninguna.
   */
  function renderSocialMediaList() {
    if (socialItems.length === 0) {
      return (
        <div className="alert alert-info">
          No hay redes sociales configuradas. Añade una haciendo clic en el botón.
        </div>
      );
    }

    // Renderiza cada item de red social
    return socialItems.map((socialItem, index) => renderSocialItem(socialItem, index));
  }

  /**
   * Renderiza un item individual (red social), en modo edición o visualización.
   */
  function renderSocialItem(socialItem, index) {
    const isHidden = socialItem.visible === false;
    const isEditing = editingIndex === index;

    return (
      <div
        key={index}
        className={`social-media-item mb-3 p-3 rounded border ${
          isHidden ? 'bg-light' : 'bg-white'
        }`}
      >
        {isEditing
          ? renderEditForm(index)
          : renderViewMode(socialItem, index, isHidden)}
      </div>
    );
  }

  /**
   * Modo edición: muestra inputs para modificar la red social.
   */
  function renderEditForm(index) {
    return (
      <div className="edit-form">
        {/* Campo: Red Social */}
        <div className="mb-2">
          <label className="form-label">Red Social</label>
          <input
            type="text"
            className="form-control"
            value={editForm.label}
            onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
            placeholder="Ej: Facebook"
          />
        </div>

        {/* Campo: Ícono */}
        <div className="mb-2">
          <label className="form-label">Ícono</label>
          <input
            type="text"
            className="form-control"
            value={editForm.icon}
            onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
            placeholder="Ej: bi-facebook"
          />
          <div className="form-text">
            Usa clases de{' '}
            <a
              href="https://icons.getbootstrap.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bootstrap Icons
            </a>.
          </div>
        </div>

        {/* Campo: URL */}
        <div className="mb-3">
          <label className="form-label">URL</label>
          <input
            type="url"
            className="form-control"
            value={editForm.url}
            onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
            placeholder="https://..."
          />
        </div>

        {/* Botones de acción (Cancelar/Guardar) */}
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={cancelEdit}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={saveEdit}
          >
            Guardar
          </button>
        </div>
      </div>
    );
  }

  /**
   * Modo visualización: muestra ícono, texto y botones de acciones (ocultar, editar, eliminar).
   */
  function renderViewMode(socialItem, index, isHidden) {
    return (
      <div>
        <div className="d-flex align-items-center mb-2">
          <i
            className={`bi ${socialItem.icon} me-2 fs-4 ${
              isHidden ? 'text-muted' : ''
            }`}
          />
          <span className={`fw-medium ${isHidden ? 'text-muted' : ''}`}>
            {socialItem.label}
          </span>

          <div className="ms-auto d-flex">
            {/* Botón de visibilidad */}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary me-1"
              onClick={() => toggleVisibility(index)}
              title={isHidden ? 'Mostrar' : 'Ocultar'}
            >
              <i className={`bi ${isHidden ? 'bi-eye' : 'bi-eye-slash'}`} />
            </button>

            {/* Botón de edición */}
            <button
              type="button"
              className="btn btn-sm btn-outline-primary me-1"
              onClick={() => startEditing(index)}
            >
              <i className="bi bi-pencil" />
            </button>

            {/* Botón de eliminación */}
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => removeSocialMedia(index)}
            >
              <i className="bi bi-trash" />
            </button>
          </div>
        </div>

        {/* Muestra la URL con un botón para abrir en pestaña nueva */}
        {renderItemUrl(socialItem, isHidden)}
      </div>
    );
  }

  /**
   * Muestra la URL de la red social y un botón para abrirla.
   */
  function renderItemUrl(socialItem, isHidden) {
    return (
      <>
        <div className="input-group">
          <input
            type="text"
            className={`form-control ${isHidden ? 'bg-light text-muted' : 'bg-white'}`}
            value={socialItem.url}
            readOnly
          />
          <a
            href={socialItem.url}
            className="btn btn-outline-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-box-arrow-up-right" />
          </a>
        </div>

        {/* Mensaje adicional si está oculto */}
        {isHidden && (
          <div className="mt-2 small text-muted">
            <i className="bi bi-info-circle me-1" />
            Esta red social está oculta en la página
          </div>
        )}
      </>
    );
  }
}
