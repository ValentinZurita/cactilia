/**
 * Componente de botones de acción para la gestión de contenido
 * Versión actualizada con enfoque mobile-first
 */
export const ActionButtons = ({ onSave, onPublish, onReset, saving, publishing, hasChanges, hasSavedContent }) => {
  return (
    <div className="action-buttons bg-light p-3 rounded shadow-sm">
      <div className="row g-2">
        <div className="col-12 col-sm-6 d-grid d-sm-block">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onReset}
          >
            <i className="bi bi-arrow-counterclockwise me-2"></i>
            Restaurar predeterminado
          </button>
        </div>

        <div className="col-12 col-sm-6 d-flex flex-column flex-sm-row justify-content-sm-end gap-2">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={onSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                Guardar borrador
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onPublish}
            disabled={publishing || (!hasChanges && !hasSavedContent)}
          >
            {publishing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Publicando...
              </>
            ) : (
              <>
                <i className="bi bi-globe me-2"></i>
                Publicar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};