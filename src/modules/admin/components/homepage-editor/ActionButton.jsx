/**
 * Componente de botones de acción para la gestión de contenido
 */
export const ActionButtons = ({ onSave, onReset, onPreview, saving, hasChanges }) => {
  return (
    <div className="action-buttons d-flex justify-content-between mt-4">
      <div>
        <button
          type="button"
          className="btn btn-outline-secondary me-2"
          onClick={onReset}
        >
          <i className="bi bi-arrow-counterclockwise me-2"></i>
          Restaurar predeterminado
        </button>

        {onPreview && (
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={onPreview}
          >
            <i className="bi bi-eye me-2"></i>
            Vista previa
          </button>
        )}
      </div>

      <div>
        <button
          type="button"
          className="btn btn-primary px-4"
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
              Guardar cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
};