/**
 * Componente de botones de acción para la gestión de contenido
 * Versión mejorada con responsividad completa
 */
export const ActionButtons = ({ onSave, onPublish, onReset, saving, publishing, hasChanges, hasSavedContent }) => {
  return (
    <div className="action-buttons bg-light p-3 rounded shadow-sm">
      <div className="row g-3">
        {/* En móviles, este botón ocupa todo el ancho */}
        <div className="col-12 col-md-6 mb-2 mb-md-0">
          <button
            type="button"
            className="btn btn-outline-secondary w-100 w-md-auto"
            onClick={onReset}
          >
            <i className="bi bi-arrow-counterclockwise me-2"></i>
            Restaurar predeterminado
          </button>
        </div>

        <div className="col-12 col-md-6">
          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-md-end">
            {/* Botón de guardar borrador */}
            <button
              type="button"
              className="btn btn-outline-primary w-100 w-sm-auto"
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

            {/* Botón de publicar */}
            <button
              type="button"
              className="btn btn-primary w-100 w-sm-auto"
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
    </div>
  );
};