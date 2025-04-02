import React from 'react';

/**
 * Componente de tabla para mostrar reglas de envío.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.rules - Lista de reglas de envío
 * @param {boolean} props.loading - Indicador de carga
 * @param {string} props.error - Mensaje de error si existe
 * @param {Function} props.onEdit - Función a llamar para editar una regla
 * @param {Function} props.onDelete - Función a llamar para eliminar una regla
 */
export const ShippingTable = ({ rules, loading, error, onEdit, onDelete }) => {
  // Si está cargando, mostrar indicador de carga
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-muted">Cargando reglas de envío...</p>
      </div>
    );
  }

  // Si no hay reglas, mostrar mensaje
  if (!rules || rules.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-4 text-center p-5">
        <div className="py-5">
          <i className="bi bi-geo-alt fs-1 text-secondary opacity-50 mb-3 d-block"></i>
          <h5 className="fw-normal">No se encontraron reglas de envío</h5>
          <p className="text-muted">
            Agrega una nueva regla de envío o importa reglas desde un archivo CSV.
          </p>
        </div>
      </div>
    );
  }

  // Mostrar tabla con reglas
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover border shadow-sm">
        <thead className="table-dark">
        <tr>
          <th>Código Postal</th>
          <th>Zona</th>
          <th>Precio Base</th>
          <th>Servicios</th>
          <th>Estado</th>
          <th>Envío Gratis</th>
          <th>Acciones</th>
        </tr>
        </thead>
        <tbody>
        {rules.map((rule) => (
          <tr key={rule.id}>
            <td><span className="fw-bold">{rule.zipcode}</span></td>
            <td>{rule.zona}</td>
            <td>${rule.precio_base.toFixed(2)} MXN</td>
            <td>
              {rule.opciones_mensajeria?.length > 0 ? (
                <div className="d-flex flex-wrap gap-1">
                  {rule.opciones_mensajeria.map((opcion, idx) => (
                    <span
                      key={idx}
                      className="badge bg-info text-dark"
                      title={`${opcion.tiempo} - $${opcion.precio} MXN`}
                    >
                        {opcion.nombre}
                      </span>
                  ))}
                </div>
              ) : (
                <span className="text-muted small">No disponible</span>
              )}
            </td>
            <td>
              {rule.activo ? (
                <span className="badge bg-success">Activo</span>
              ) : (
                <span className="badge bg-secondary">Inactivo</span>
              )}
            </td>
            <td>
              {rule.envio_gratis ? (
                <span className="badge bg-success">Sí</span>
              ) : rule.envio_variable?.aplica && rule.envio_variable?.envio_gratis_monto_minimo ? (
                <span className="badge bg-warning text-dark">
                    A partir de ${rule.envio_variable.envio_gratis_monto_minimo} MXN
                  </span>
              ) : (
                <span className="badge bg-secondary">No</span>
              )}
            </td>
            <td>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onEdit(rule.id)}
                  title="Editar regla"
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de eliminar la regla para el CP ${rule.zipcode}?`)) {
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
  );
};