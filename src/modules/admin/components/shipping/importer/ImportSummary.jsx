import React from 'react';

/**
 * Componente para mostrar el resumen de una importación.
 * Versión renovada con diseño más limpio y minimalista
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
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4">
        {/* Encabezado */}
        <div className="text-center mb-4">
          {isSuccess ? (
            <div className="mb-3">
              <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center p-4">
                <i className="bi bi-check-lg fs-1 text-success"></i>
              </div>
              <h5 className="mt-3 mb-1">Importación Completada</h5>
              <p className="text-muted">Las reglas de envío se han importado correctamente</p>
            </div>
          ) : (
            <div className="mb-3">
              <div className="rounded-circle bg-warning bg-opacity-10 d-inline-flex align-items-center justify-content-center p-4">
                <i className="bi bi-exclamation-triangle fs-1 text-warning"></i>
              </div>
              <h5 className="mt-3 mb-1">Importación con Advertencias</h5>
              <p className="text-muted">La importación se completó pero con algunos errores</p>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Resumen de Importación</h6>

        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card h-100 border-0 bg-light rounded-4">
              <div className="card-body p-3 text-center">
                <div className="fs-4 mb-1 fw-normal">{total}</div>
                <div className="text-secondary small">Total</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card h-100 border-0 bg-success bg-opacity-10 rounded-4">
              <div className="card-body p-3 text-center">
                <div className="fs-4 mb-1 fw-normal text-success">{created}</div>
                <div className="text-secondary small">Creadas</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card h-100 border-0 bg-primary bg-opacity-10 rounded-4">
              <div className="card-body p-3 text-center">
                <div className="fs-4 mb-1 fw-normal text-primary">{updated}</div>
                <div className="text-secondary small">Actualizadas</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card h-100 border-0 bg-secondary bg-opacity-10 rounded-4">
              <div className="card-body p-3 text-center">
                <div className="fs-4 mb-1 fw-normal text-secondary">{skipped}</div>
                <div className="text-secondary small">Omitidas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Errores si existen */}
        {errors.length > 0 && (
          <div className="mb-4">
            <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">
              Errores ({errors.length})
            </h6>
            <div className="alert alert-danger py-2">
              <ul className="mb-0 ps-3 small">
                {errors.map((error, index) => (
                  <li key={index} className="mb-1">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="d-flex justify-content-center gap-3 mt-4 pt-3 border-top">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-3"
            onClick={onReset}
          >
            <i className="bi bi-arrow-repeat me-2"></i>
            Importar Otro Archivo
          </button>
          <button
            type="button"
            className="btn btn-outline-dark rounded-3"
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