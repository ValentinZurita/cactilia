import React from 'react';

/**
 * Componente de tabla para mostrar reglas de envío.
 * Diseño minimalista con cabecera negra
 */
export const ShippingTable = ({
  rules,
  loading,
  error,
  onEdit,
  onDelete,
  onSearch,
  searchTerm,
  onCreateNew
}) => {
  // Manejar búsqueda
  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  // Si no hay reglas después de búsqueda
  const showEmptySearchResults = !loading && searchTerm && rules.length === 0;

  return (
    <div className="shipping-rules-list">
      {/* Barra de herramientas */}
      <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
        {/* Buscador */}
        <div className="search-container flex-grow-1" style={{ maxWidth: '500px' }}>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Buscar por zona..."
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Buscar reglas de envío"
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary border-start-0"
                type="button"
                onClick={() => onSearch('')}
                aria-label="Limpiar búsqueda"
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>

        {/* Botón de acción */}
        <button
          className="btn btn-dark rounded-3"
          onClick={onCreateNew}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nueva Regla
        </button>
      </div>

      {/* Mostrar indicador de carga */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando reglas de envío...</p>
        </div>
      )}

      {/* Sin resultados de búsqueda */}
      {showEmptySearchResults && (
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-body p-5 text-center">
            <i className="bi bi-search fs-1 text-secondary opacity-50 d-block mb-3"></i>
            <h5 className="text-secondary fw-normal">No se encontraron reglas que coincidan</h5>
            <p className="text-muted">Intenta con otros términos de búsqueda</p>
          </div>
        </div>
      )}

      {/* Tabla de reglas */}
      {!loading && rules.length > 0 && !showEmptySearchResults && (
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-dark text-white">
                <tr>
                  <th scope="col" className="px-3 py-3 border-0">Tipo</th>
                  <th scope="col" className="px-3 py-3 border-0">Zona</th>
                  <th scope="col" className="px-3 py-3 border-0">Métodos</th>
                  <th scope="col" className="px-3 py-3 border-0">Estado</th>
                  <th scope="col" className="px-3 py-3 border-0 text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => {
                  // Determinar tipo de cobertura
                  let coverageType = "CP";
                  
                  if (rule.zipcodes && rule.zipcodes.length > 0) {
                    if (rule.zipcodes.includes('nacional')) {
                      coverageType = "Nacional";
                    } else if (rule.zipcodes.some(z => z.startsWith('estado_'))) {
                      coverageType = "Regional";
                    }
                  }
                  
                  return (
                    <tr key={rule.id} className="shipping-rule-row">
                      <td className="px-3 py-3 align-middle">
                        {coverageType}
                      </td>
                      <td className="px-3 py-3 align-middle fw-medium">
                        {rule.zona}
                      </td>
                      <td className="px-3 py-3 align-middle">
                        {rule.opciones_mensajeria?.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {rule.opciones_mensajeria.slice(0, 2).map((opcion, idx) => (
                              <span
                                key={idx}
                                className="badge bg-light text-dark border"
                                title={`${opcion.tiempo} - $${opcion.precio} MXN`}
                              >
                                {opcion.nombre}
                              </span>
                            ))}
                            {rule.opciones_mensajeria.length > 2 && (
                              <span className="badge bg-light text-dark border">
                                +{rule.opciones_mensajeria.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted small">No disponible</span>
                        )}
                      </td>
                      <td className="px-3 py-3 align-middle">
                        {rule.activo ? (
                          <span className="badge bg-success bg-opacity-10 text-success">
                            Activo
                          </span>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-10 text-secondary">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 align-middle text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-dark rounded-3"
                            onClick={() => onEdit(rule.id)}
                            title="Editar regla"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-3"
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar la regla para ${rule.zona}?`)) {
                                onDelete(rule.id);
                              }
                            }}
                            title="Eliminar regla"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay reglas */}
      {!loading && rules.length === 0 && !searchTerm && (
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-body p-5 text-center">
            <i className="bi bi-geo-alt fs-1 text-secondary opacity-50 d-block mb-3"></i>
            <h5 className="text-secondary fw-normal">No hay reglas de envío configuradas</h5>
            <p className="text-muted mb-4">Añade tu primera regla para configurar los envíos.</p>
            <button
              className="btn btn-dark"
              onClick={onCreateNew}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Nueva Regla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};