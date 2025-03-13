import React from 'react';

/**
 * Barra de herramientas superior para editores de páginas
 * Proporciona funcionalidades comunes como previsualización y reordenamiento
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.previewUrl - URL para previsualizar la página
 * @param {boolean} [props.showReordering=false] - Muestra el botón de reordenamiento
 * @param {boolean} [props.isReordering=false] - Estado actual de reordenamiento
 * @param {Function} [props.onToggleReordering] - Función para alternar el modo de reordenamiento
 * @param {boolean} [props.hasChanges=false] - Indica si hay cambios sin guardar
 * @returns {JSX.Element}
 */
export const EditorToolbar = ({
                                previewUrl,
                                showReordering = false,
                                isReordering = false,
                                onToggleReordering,
                                hasChanges = false
                              }) => {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body p-3">
        <div className="row g-2">
          {/* Si se habilita el reordenamiento, mostrar botón de reordenar */}
          {showReordering && (
            <div className="col-12 col-sm-6 mb-2 mb-sm-0">
              <button
                className={`btn ${isReordering ? 'btn-primary' : 'btn-outline-primary'} w-100`}
                onClick={onToggleReordering}
              >
                <i className={`bi ${isReordering ? 'bi-check-lg' : 'bi-arrow-down-up'} me-2`}></i>
                {isReordering ? 'Finalizar orden' : 'Reordenar secciones'}
              </button>
            </div>
          )}

          {/* Botón de previsualización - siempre visible */}
          <div className={`col-12 ${showReordering ? 'col-sm-6' : ''}`}>
            <button
              className="btn btn-outline-primary w-100"
              onClick={() => window.open(previewUrl, '_blank')}
              title="Ver la página en una nueva ventana"
            >
              <i className="bi bi-eye me-2"></i>
              Previsualizar página
            </button>
          </div>
        </div>

        {/* Indicador de cambios pendientes */}
        {hasChanges && (
          <div className="mt-3 alert alert-warning py-2 mb-0">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Tienes cambios sin guardar
          </div>
        )}
      </div>
    </div>
  );
};