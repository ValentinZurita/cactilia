import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * MediaDetailsModal - Modal para ver y editar detalles de un elemento multimedia
 *
 * Permite visualizar la imagen a tamaño completo y modificar sus metadatos
 * como texto alternativo, categoría y etiquetas.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.media - Elemento multimedia a mostrar
 * @param {boolean} props.isOpen - Indicador si el modal está abierto
 * @param {Function} props.onClose - Manejador para cerrar el modal
 * @param {Function} props.onUpdate - Manejador para actualizar metadatos
 * @returns {JSX.Element|null}
 */
export const MediaDetailsModal = ({ media, isOpen, onClose, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [mediaData, setMediaData] = useState({
    alt: '',
    category: '',
    tags: []
  });
  const [isVisible, setIsVisible] = useState(false);

  // Inicializar datos del formulario cuando cambia el elemento
  useEffect(() => {
    if (media) {
      setMediaData({
        alt: media.alt || '',
        category: media.category || '',
        tags: media.tags || []
      });
    }
  }, [media]);

  // Animación para entrada/salida del modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        setIsVisible(true);
      }, 50);
    } else {
      setIsVisible(false);
      setTimeout(() => {
        document.body.style.overflow = '';
      }, 300);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Si el modal no está abierto o no hay elemento seleccionado, no renderizar
  if (!isOpen || !media) return null;

  // Manejador para cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMediaData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejador para campo de etiquetas (separadas por coma)
  const handleTagsChange = (e) => {
    const tagsValue = e.target.value;
    const tagsArray = tagsValue.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    setMediaData(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };

  // Convertir array de etiquetas a string separado por comas
  const formatTags = (tags = []) => {
    return tags.join(', ');
  };

  // Manejador para envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(media.id, mediaData);
    setEditMode(false);
  };

  // Formatear tamaño de archivo para mostrar
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Formatear fecha para mostrar
  const formatDate = (date) => {
    if (!date) return 'Desconocido';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return ReactDOM.createPortal(
    <div
      className={`modal-backdrop ${isVisible ? 'visible' : ''}`}
      onClick={onClose}
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
        }}
      >
        {/* Cabecera del Modal */}
        <div className="modal-header">
          <h5 className="modal-title">
            {editMode ? 'Editar detalles' : 'Detalles del archivo'}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Cerrar"
          ></button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="modal-body">
          <div className="row">
            {/* Previsualización del archivo */}
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="media-preview-modal">
                <img
                  src={media.url}
                  alt={media.alt || media.filename}
                  className="img-fluid rounded"
                />
              </div>

              {/* Detalles del archivo */}
              <div className="mt-3">
                <h6 className="fw-bold mb-2">Detalles del archivo</h6>
                <table className="table table-sm metadata-table">
                  <tbody>
                  <tr>
                    <th scope="row">Nombre</th>
                    <td>{media.filename}</td>
                  </tr>
                  <tr>
                    <th scope="row">Tipo</th>
                    <td>{media.type}</td>
                  </tr>
                  <tr>
                    <th scope="row">Tamaño</th>
                    <td>{formatFileSize(media.size)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Subido</th>
                    <td>{formatDate(media.uploadedAt)}</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Formulario de edición o vista de detalles */}
            <div className="col-md-6">
              {editMode ? (
                <form onSubmit={handleSubmit}>
                  {/* Texto alternativo */}
                  <div className="mb-3">
                    <label htmlFor="alt" className="form-label">Texto alternativo</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="alt"
                      name="alt"
                      value={mediaData.alt}
                      onChange={handleChange}
                      placeholder="Descripción para accesibilidad"
                    />
                    <div className="form-text">
                      Describe la imagen para lectores de pantalla
                    </div>
                  </div>

                  {/* Categoría */}
                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">Categoría</label>
                    <select
                      className="form-select form-select-sm"
                      id="category"
                      name="category"
                      value={mediaData.category}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="hero">Hero</option>
                      <option value="product">Producto</option>
                      <option value="background">Fondo</option>
                      <option value="banner">Banner</option>
                      <option value="icon">Icono</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  {/* Etiquetas */}
                  <div className="mb-3">
                    <label htmlFor="tags" className="form-label">Etiquetas</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="tags"
                      name="tags"
                      value={formatTags(mediaData.tags)}
                      onChange={handleTagsChange}
                      placeholder="etiqueta1, etiqueta2, etiqueta3"
                    />
                    <div className="form-text">
                      Etiquetas separadas por comas para búsqueda
                    </div>
                  </div>

                  {/* Botones de guardar/cancelar */}
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm me-2"
                      onClick={() => setEditMode(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Guardar cambios
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h6 className="fw-bold mb-2">Información del archivo</h6>
                  <div className="mb-3">
                    <p className="fw-semibold mb-1 small text-muted">Texto alternativo</p>
                    <p>{media.alt || 'No se ha proporcionado texto alternativo'}</p>
                  </div>

                  <div className="mb-3">
                    <p className="fw-semibold mb-1 small text-muted">Categoría</p>
                    <p>
                      {media.category ? (
                        <span className="badge bg-primary">
                          {media.category}
                        </span>
                      ) : (
                        'Sin categoría'
                      )}
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="fw-semibold mb-1 small text-muted">Etiquetas</p>
                    <div>
                      {media.tags && media.tags.length > 0 ? (
                        media.tags.map((tag, index) => (
                          <span key={index} className="badge bg-secondary me-1 mb-1">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">Sin etiquetas</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="fw-semibold mb-1 small text-muted">URL</p>
                    <div className="input-group input-group-sm">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={media.url}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => navigator.clipboard.writeText(media.url)}
                        title="Copiar al portapapeles"
                      >
                        <i className="bi bi-clipboard"></i>
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setEditMode(true)}
                    >
                      Editar detalles
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}