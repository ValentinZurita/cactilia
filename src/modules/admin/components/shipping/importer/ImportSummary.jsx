import React from 'react';

/**
 * Componente para mostrar el resumen de una importación.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.result - Resultado de la importación
 * @param {Function} props.onReset - Función para reiniciar el proceso
 * @param {Function} props.onComplete - Función para terminar el proceso
 */
export const ImportSummary = ({ result, onReset, onComplete }) => {
  const {
    total,
    created,
    updated,
    skipped,
    errors
  } = result;

  // Determinar si la importación fue exitosa
  const isSuccess = errors.length === 0;

  return (
    <div className="import-summary card border-0 shadow-sm rounded-4">
      <div className="card-body p-4">
        <div className="text-center mb-4">
          {isSuccess ? (
            <>
              <div className="bg-success text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-check-lg fs-1"></i>
              </div>
              <h4 className="mb-2">Importación Completada</h4>
              <p className="text-muted">Las reglas de envío se han importado correctamente.</p>
            </>
          ) : (
            <>
              <div className="bg-warning text-dark rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-exclamation-triangle fs-1"></i>
              </div>
              <h4 className="mb-2">Importación con Advertencias</h4>
              <p className="text-muted">La importación se completó pero con algunos errores.</p>
            </>
          )}
        </div>

        {/* Estadísticas generales */}
        <div className="row row-cols-2 row-cols-md-4 g-3 mb-4">
          <div className="col">
            <div className="card bg-light border-0 h-100">
              <div className="card-body text-center p-3">
                <h5 className="mb-0">{total}</h5>
                <div className="text-muted small">Total</div>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card bg-success bg-opacity-10 border-0 h-100">
              <div className="card-body text-center p-3">
                <h5 className="mb-0 text-success">{created}</h5>
                <div className="text-muted small">Creadas</div>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card bg-info bg-opacity-10 border-0 h-100">
              <div className="card-body text-center p-3">
                <h5 className="mb-0 text-primary">{updated}</h5>
                <div className="text-muted small">Actualizadas</div>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card bg-secondary bg-opacity-10 border-0 h-100">
              <div className="card-body text-center p-3">
                <h5 className="mb-0 text-secondary">{skipped}</h5>
                <div className="text-muted small">Omitidas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Errores si existen */}
        {errors.length > 0 && (
          <div className="mb-4">
            <h6 className="mb-3">Errores ({errors.length})</h6>
            <div className="alert alert-danger" role="alert">
              <ul className="mb-0 ps-3">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="d-flex justify-content-center gap-3 mt-4 pt-3 border-top">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onReset}
          >
            <i className="bi bi-arrow-repeat me-2"></i>
            Importar Otro Archivo
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onComplete}
          >
            <i className="bi bi-check-lg me-2"></i>
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};