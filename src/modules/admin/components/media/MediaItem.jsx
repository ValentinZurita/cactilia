/**
 * MediaItem - Componente para mostrar un elemento multimedia individual en la cuadrícula
 *
 * Muestra una previsualización con información básica del archivo y
 * proporciona acciones para ver detalles o eliminar.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.item - Datos del elemento multimedia
 * @param {Function} props.onSelect - Manejador para la selección del elemento
 * @param {Function} [props.onDelete] - Manejador para la eliminación del elemento (opcional)
 * @param {boolean} [props.isSelected] - Indica si el elemento está seleccionado
 * @returns {JSX.Element}
 */
export const MediaItem = ({ item, onSelect, onDelete, isSelected = false }) => {
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

  // Determinar nombre a mostrar (priorizar nombre personalizado)
  const displayName = item.name || item.filename || 'Sin nombre';

  return (
    <div className={`media-item-card ${isSelected ? 'selected-media-item' : ''}`}>
      {/* Previsualización de la imagen */}
      <div className="media-item-preview">
        <img
          src={item.url}
          alt={item.alt || displayName}
          onClick={() => onSelect(item)}
        />

        {/* Badge de selección */}
        {isSelected && (
          <div className="selected-badge">
            <i className="bi bi-check-circle-fill"></i>
          </div>
        )}

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

          {/* Botón de eliminar (opcional) */}
          {onDelete && (
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id, item.url);
              }}
              title="Eliminar archivo"
            >
              <i className="bi bi-trash"></i>
            </button>
          )}
        </div>
      </div>

      {/* Información del elemento */}
      <div className="media-item-info">
        <h6 className="media-item-title" title={displayName}>
          {displayName}
        </h6>
        <div className="d-flex justify-content-between align-items-center mt-1">
          <span className="badge bg-light text-dark">
            {formatFileSize(item.size)}
          </span>
          <small className="text-muted">
            {formatDate(item.uploadedAt)}
          </small>
        </div>

        {/* Colección (si existe) */}
        {item.collectionId && (
          <div className="mt-1">
            <span className="badge bg-primary">
              <i className="bi bi-collection me-1"></i>
              En colección
            </span>
          </div>
        )}
      </div>
    </div>
  );
};