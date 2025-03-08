export const ContentManagementHeader = ({
                                          onViewPage,
                                          onResetBlocks,
                                          loading,
                                          onSave,
                                          isSaving,
                                          hasUnsavedChanges,
                                          onPublish,
                                          isPublishing
                                        }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="mb-0">
        <i className="bi bi-layout-text-window me-2 text-primary"></i>
        Editor de Contenido
      </h2>
      <div className="d-flex gap-2">
        {/* Botón: Ver página */}
        <button
          className="btn btn-outline-primary"
          onClick={onViewPage}
          title="Ver esta página en el sitio"
        >
          <i className="bi bi-eye me-2"></i>
          Ver página
        </button>

        {/* Botón: Restaurar */}
        <button
          className="btn btn-outline-secondary"
          onClick={onResetBlocks}
          disabled={loading}
          title="Restaurar al diseño original"
        >
          <i className="bi bi-arrow-counterclockwise me-2"></i>
          Restaurar
        </button>

        {/* Botón: Guardar */}
        <button
          className="btn btn-primary"
          onClick={onSave}
          disabled={loading || isSaving || !hasUnsavedChanges}
          title={!hasUnsavedChanges ? "No hay cambios para guardar" : "Guardar cambios"}
        >
          {isSaving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Guardando
            </>
          ) : (
            <>
              <i className="bi bi-save me-2"></i>
              Guardar
            </>
          )}
        </button>

        {/* Botón: Publicar */}
        <button
          className="btn btn-success"
          onClick={onPublish}
          disabled={loading || isPublishing}
          title="Publicar cambios en el sitio"
        >
          {isPublishing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Publicando
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
  );
};