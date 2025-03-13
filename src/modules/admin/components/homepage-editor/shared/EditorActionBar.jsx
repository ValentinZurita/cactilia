/**
 * Barra de acciones para editores de páginas.
 * Proporciona botones para guardar, publicar y resetear la configuración.
 *
 * @param {Object}   props
 * @param {Function} props.onSave        - Función para guardar (borrador).
 * @param {Function} props.onPublish     - Función para publicar.
 * @param {Function} props.onReset       - Función para resetear.
 * @param {boolean}  props.saving        - Indica si se está guardando.
 * @param {boolean}  props.publishing    - Indica si se está publicando.
 * @param {boolean}  props.hasChanges    - Indica si hay cambios sin guardar.
 * @param {boolean}  props.hasSavedContent - Indica si existe contenido guardado para publicar.
 */
export function EditorActionBar({
                                  onSave,
                                  onPublish,
                                  onReset,
                                  saving,
                                  publishing,
                                  hasChanges,
                                  hasSavedContent
                                }) {
  // Estilos en línea para la barra fija
  const stickyBarStyle = {
    position: 'sticky',
    bottom: '0',
    zIndex: '1020',
    marginTop: '1rem',
    borderTop: '1px solid #dee2e6',
    borderRadius: '0'
  };

  return (
    <div className="sticky-action-bar card shadow-sm" style={stickyBarStyle}>
      <div className="card-body py-3">
        <div className="action-buttons">
          <div className="row g-3">
            {/*
              En pantallas pequeñas (móviles), los botones principales
              aparecerán a la derecha (order-md-2).
            */}
            <div className="col-12 col-md-6 order-md-2">
              {renderPrimaryActions()}
            </div>

            {/*
              En pantallas pequeñas, este botón (Restaurar) irá al final (order-md-1),
              para que en desktop quede a la izquierda.
            */}
            <div className="col-12 col-md-6 order-md-1">
              {renderResetButton()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // FUNCIONES DE RENDER LOCALES
  // =========================================================================

  /**
   * Botones principales de la barra: Guardar y Publicar.
   */
  function renderPrimaryActions() {
    return (
      <div className="d-flex flex-column flex-sm-row gap-2 justify-content-md-end">
        {renderSaveButton()}
        {renderPublishButton()}
      </div>
    );
  }

  /**
   * Botón de "Guardar Borrador".
   */
  function renderSaveButton() {
    const isDisabled = saving || !hasChanges;

    return (
      <button
        type="button"
        className="btn btn-outline-primary w-100"
        onClick={onSave}
        disabled={isDisabled}
      >
        {saving ? renderSavingSpinner('Guardando...') : renderIconText('bi-save', 'Guardar borrador')}
      </button>
    );
  }

  /**
   * Botón de "Publicar".
   */
  function renderPublishButton() {
    const isDisabled = publishing || (!hasChanges && !hasSavedContent);

    return (
      <button
        type="button"
        className="btn btn-primary w-100"
        onClick={onPublish}
        disabled={isDisabled}
      >
        {publishing ? renderSavingSpinner('Publicando...') : renderIconText('bi-globe', 'Publicar')}
      </button>
    );
  }

  /**
   * Botón de "Restaurar" (resetea la configuración a la predeterminada).
   */
  function renderResetButton() {
    return (
      <button
        type="button"
        className="btn btn-outline-secondary w-100"
        onClick={onReset}
      >
        <i className="bi bi-arrow-counterclockwise me-2"></i>
        Restaurar predeterminado
      </button>
    );
  }

  /**
   * Renderiza el spinner de carga con el texto dado (por ejemplo, "Guardando...").
   *
   * @param {string} text - Texto a mostrar junto al spinner
   */
  function renderSavingSpinner(text) {
    return (
      <>
        <span className="spinner-border spinner-border-sm me-2" role="status" />
        {text}
      </>
    );
  }

  /**
   * Renderiza un ícono de Bootstrap Icons y texto a su lado.
   *
   * @param {string} iconClass - Clase de ícono (p.ej. "bi-save")
   * @param {string} text      - Texto a mostrar
   */
  function renderIconText(iconClass, text) {
    return (
      <>
        <i className={`${iconClass} me-2`} />
        {text}
      </>
    );
  }
}
