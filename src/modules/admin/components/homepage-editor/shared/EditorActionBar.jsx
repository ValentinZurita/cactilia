import React from 'react';

/**
 * Barra de acciones para editores de páginas
 * Proporciona botones para guardar, publicar y resetear
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onSave - Función para guardar
 * @param {Function} props.onPublish - Función para publicar
 * @param {Function} props.onReset - Función para resetear
 * @param {boolean} props.saving - Indica si está guardando
 * @param {boolean} props.publishing - Indica si está publicando
 * @param {boolean} props.hasChanges - Indica si hay cambios sin guardar
 * @param {boolean} props.hasSavedContent - Indica si hay contenido guardado para publicar
 * @returns {JSX.Element}
 */
export const EditorActionBar = ({
                                  onSave,
                                  onPublish,
                                  onReset,
                                  saving,
                                  publishing,
                                  hasChanges,
                                  hasSavedContent
                                }) => {
  return (
    <div className="sticky-action-bar card shadow-sm"
         style={{
           position: 'sticky',
           bottom: '0',
           zIndex: '1020',
           marginTop: '1rem',
           borderTop: '1px solid #dee2e6',
           borderRadius: '0'
         }}>
      <div className="card-body py-3">
        <div className="action-buttons">
          <div className="row g-3">
            {/* En móviles, botones de acción principal van primero */}
            <div className="col-12 col-md-6 order-md-2">
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-md-end">
                {/* Botón de guardar borrador */}
                <button
                  type="button"
                  className="btn btn-outline-primary w-100"
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
                  className="btn btn-primary w-100"
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

            {/* En móviles, este botón va al final */}
            <div className="col-12 col-md-6 order-md-1">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={onReset}
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Restaurar predeterminado
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};