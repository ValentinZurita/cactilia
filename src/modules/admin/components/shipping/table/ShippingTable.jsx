import React from 'react';

/**
 * Componente de tabla para mostrar reglas de envío.
 * Diseño renovado para coincidir con el estilo de OrderList
 */
export const ShippingTable = ({
                                rules,
                                loading,
                                error,
                                onEdit,
                                onDelete,
                                onSearch,
                                searchTerm,
                                onCreateNew,
                                onImport
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
              placeholder="Buscar por código postal o zona..."
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

        {/* Botones de acción */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary rounded-3"
            onClick={onImport}
          >
            <i className="bi bi-file-earmark-arrow-up me-2"></i>
            Importar CSV
          </button>
          <button
            className="btn btn-outline-dark rounded-3"
            onClick={onCreateNew}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Nueva Regla
          </button>
        </div>
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
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-5 text-center">
            <i className="bi bi-search fs-1 text-secondary opacity-50 d-block mb-3"></i>
            <h5 className="text-secondary fw-normal">No se encontraron reglas que coincidan</h5>
            <p className="text-muted">Intenta con otros términos de búsqueda</p>
          </div>
        </div>
      )}

      {/* Tabla de reglas */}
      {!loading && rules.length > 0 && !showEmptySearchResults && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
              <tr>
                <th scope="col" className="px-4 py-3 border-0 text-secondary fw-medium">Código Postal</th>
                <th scope="col" className="px-3 py-3 border-0 text-secondary fw-medium">Zona</th>
                <th scope="col" className="px-3 py-3 border-0 text-secondary fw-medium">Precio Base</th>
                <th scope="col" className="px-3 py-3 border-0 text-secondary fw-medium">Servicios</th>
                <th scope="col" className="px-3 py-3 border-0 text-secondary fw-medium">Estado</th>
                <th scope="col" className="px-3 py-3 border-0 text-secondary fw-medium text-end">Acciones</th>
              </tr>
              </thead>
              <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="shipping-rule-row" style={{ cursor: 'pointer' }}>
                  <td className="px-4 py-3 align-middle fw-medium" onClick={() => onEdit(rule.id)}>
                    {rule.zipcode}
                    {rule.envio_gratis && (
                      <span className="badge bg-success ms-2">Envío Gratis</span>
                    )}
                  </td>
                  <td className="px-3 py-3 align-middle" onClick={() => onEdit(rule.id)}>
                    {rule.zona}
                  </td>
                  <td className="px-3 py-3 align-middle" onClick={() => onEdit(rule.id)}>
                    ${rule.precio_base.toFixed(2)} MXN
                  </td>
                  <td className="px-3 py-3 align-middle" onClick={() => onEdit(rule.id)}>
                    {rule.opciones_mensajeria?.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1">
                        {rule.opciones_mensajeria.slice(0, 2).map((opcion, idx) => (
                          <span
                            key={idx}
                            className="badge bg-secondary bg-opacity-10 text-secondary"
                            title={`${opcion.tiempo} - $${opcion.precio} MXN`}
                          >
                              {opcion.nombre}
                            </span>
                        ))}
                        {rule.opciones_mensajeria.length > 2 && (
                          <span className="badge bg-secondary bg-opacity-10 text-secondary">
                              +{rule.opciones_mensajeria.length - 2}
                            </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted small">No disponible</span>
                    )}
                  </td>
                  <td className="px-3 py-3 align-middle" onClick={() => onEdit(rule.id)}>
                    {rule.activo ? (
                      <span className="badge bg-success bg-opacity-10 text-success">
                          <i className="bi bi-check-circle me-1"></i>
                          Activo
                        </span>
                    ) : (
                      <span className="badge bg-secondary bg-opacity-10 text-secondary">
                          <i className="bi bi-dash-circle me-1"></i>
                          Inactivo
                        </span>
                    )}
                  </td>
                  <td className="px-3 py-3 align-middle text-end">
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        className="btn btn-sm btn-outline-secondary hover-dark rounded-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(rule.id);
                        }}
                        title="Editar regla"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`¿Estás seguro de eliminar la regla para ${rule.zipcode}?`)) {
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
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay reglas */}
      {!loading && rules.length === 0 && !searchTerm && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-5 text-center">
            <i className="bi bi-geo-alt fs-1 text-secondary opacity-50 d-block mb-3"></i>
            <h5 className="text-secondary fw-normal">No hay reglas de envío configuradas</h5>
            <p className="text-muted mb-4">Añade tu primera regla o importa desde un archivo CSV.</p>
            <div className="d-flex gap-3 justify-content-center">
              <button
                className="btn btn-outline-secondary"
                onClick={onImport}
              >
                <i className="bi bi-file-earmark-arrow-up me-2"></i>
                Importar CSV
              </button>
              <button
                className="btn btn-outline-dark"
                onClick={onCreateNew}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Nueva Regla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};