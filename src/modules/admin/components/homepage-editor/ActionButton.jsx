/**
 * Componente de botones de acción para la gestión de contenido
 */
export const ActionButtons = ({ onSave, onPublish, onReset, saving, publishing, hasChanges, hasSavedContent }) => {
  return (
    <div className="action-buttons d-flex justify-content-between bg-light p-4 rounded">
      <div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onReset}
        >
          <i className="bi bi-arrow-counterclockwise me-2"></i>
          Restaurar predeterminado
        </button>
      </div>

      <div className="d-flex gap-3">
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
          className="btn btn-primary px-4"
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
              Publicar cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
};