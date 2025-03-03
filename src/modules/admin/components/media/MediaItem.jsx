/**
 * MediaItem - Componente para mostrar un elemento multimedia individual en la cuadrícula
 *
 * Muestra una previsualización con información básica del archivo y
 * proporciona acciones para ver detalles o eliminar.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.item - Datos del elemento multimedia
 * @param {Function} props.onSelect - Manejador para la selección del elemento
 * @param {Function} props.onDelete - Manejador para la eliminación del elemento
 * @returns {JSX.Element}
 */
export const MediaItem = ({ item, onSelect, onDelete }) => {
  /**
   * Formatea el tamaño del archivo a una cadena legible
   * @param {number} bytes - Tamaño en bytes
   * @returns {string} - Tamaño formateado
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  /**
   * Formatea la fecha a una cadena legible
   * @param {Date|string} date - Fecha a formatear
   * @returns {string} - Fecha formateada
   */
  const formatDate = (date) => {
    if (!date) return 'Desconocido';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="media-item-card">
      {/* Previsualización de la imagen */}
      <div className="media-item-preview">
        <img
          src={item.url}
          alt={item.alt || item.filename}
          onClick={() => onSelect(item)}
        />

        {/* Acciones en hover */}
        <div className="media-item-actions">
          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={() => onSelect(item)}
            title="Ver detalles"
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={() => onDelete(item.id, item.url)}
            title="Eliminar archivo"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>

      {/* Información del elemento */}
      <div className="media-item-info">
        <h6 className="media-item-title" title={item.filename}>
          {item.filename}
        </h6>
        <div className="d-flex justify-content-between align-items-center mt-1">
          <span className="badge bg-light text-dark">
            {formatFileSize(item.size)}
          </span>
          <small className="text-muted">
            {formatDate(item.uploadedAt)}
          </small>
        </div>
        {item.category && (
          <div className="mt-1">
            <span className="badge bg-primary">
              {item.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};