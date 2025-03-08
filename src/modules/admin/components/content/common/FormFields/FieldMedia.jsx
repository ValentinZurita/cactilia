/**
 * Campo para seleccionar medios/imágenes
 * @param {Object} props - Propiedades del componente
 * @param {string} props.name - Nombre del campo
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.value - URL o ID del medio seleccionado
 * @param {Function} props.onChange - Función a llamar cuando cambia el valor
 * @param {Function} props.onBrowse - Función para abrir el selector de medios
 * @param {boolean} [props.isCollection=false] - Si es una colección en lugar de una imagen individual
 * @param {string} [props.help] - Texto de ayuda
 * @returns {JSX.Element}
 */
export const FieldMedia = ({
                             name,
                             label,
                             value = '',
                             onChange,
                             onBrowse,
                             isCollection = false,
                             help = '',
                             disabled = false
                           }) => {

  // Si es una imagen individual y tenemos una URL
  const isImage = !isCollection && value && typeof value === 'string' &&
    (value.startsWith('http') || value.startsWith('/'));

  return (
    <div className="mb-4">

      {/* Etiqueta del campo */}
      <label className="form-label">
        {label}
      </label>

      {/* Vista previa de la imagen (si aplica) */}
      {isImage && (
        <div className="media-preview mb-2">
          <img
            src={value}
            alt="Vista previa"
            className="img-thumbnail"
            style={{ maxHeight: '150px', maxWidth: '100%' }}
          />
        </div>
      )}

      {/* Si es una colección, mostrar el ID o nombre */}
      {isCollection && value && (
        <div className="mb-2 p-2 bg-light rounded">
          <span className="badge bg-info me-2">Colección</span>
          <span>{value}</span>
        </div>
      )}

      {/* Si no hay valor seleccionado */}
      {!value && (
        <div className="no-media-placeholder mb-2 p-3 bg-light text-center rounded">
          <i className="bi bi-image text-muted fs-3 d-block"></i>
          <small className="text-muted">
            {isCollection ? 'No hay colección seleccionada' : 'No hay imagen seleccionada'}
          </small>
        </div>
      )}

      {/* Botones de acción */}
      <div className="d-flex gap-2">

        {/* Botón para seleccionar imagen */}
        <button
          className="btn btn-outline-primary"
          type="button"
          onClick={onBrowse}
          disabled={disabled}
        >

          {/* Icono de colección o imagen */}
          <i className={`bi ${isCollection ? 'bi-collection' : 'bi-images'} me-2`}></i>
          {value ? 'Cambiar' : 'Seleccionar'} {isCollection ? 'colección' : 'imagen'}

        </button>

        {/* Botón para quitar la selección */}
        {value && (
          <button
            className="btn btn-outline-danger"
            type="button"
            onClick={() => onChange('')}
            disabled={disabled}
            title="Quitar selección"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>

      {/* Texto de ayuda */}
      {help && <div className="form-text text-muted small mt-2">{help}</div>}
    </div>
  );
};