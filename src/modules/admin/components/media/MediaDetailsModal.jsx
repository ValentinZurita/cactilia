import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getCollections } from '../../services/collectionsService';

/**
 * MediaDetailsModal - Modal para ver y editar detalles de archivos multimedia
 *
 * Muestra una vista detallada de un archivo multimedia con opciones
 * para editar sus metadatos, incluido el nombre y la colección.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.media - Elemento multimedia a mostrar
 * @param {boolean} props.isOpen - Controla visibilidad del modal
 * @param {Function} props.onClose - Manejador para cerrar el modal
 * @param {Function} props.onUpdate - Manejador para actualizar metadatos
 * @returns {JSX.Element|null}
 */
export const MediaDetailsModal = ({ media, isOpen, onClose, onUpdate }) => {
  // Estado para modo de edición
  const [editMode, setEditMode] = useState(false);

  // Estado para datos del archivo
  const [mediaData, setMediaData] = useState({
    name: '',
    alt: '',
    collectionId: '',
    tags: []
  });

  // Estado para la animación del modal
  const [isVisible, setIsVisible] = useState(false);

  // Estado para colecciones disponibles
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  // Inicializar datos cuando cambia el elemento multimedia
  useEffect(() => {
    if (media) {
      setMediaData({
        name: media.name || media.filename || '',
        alt: media.alt || '',
        collectionId: media.collectionId || '',
        tags: media.tags || []
      });
    }
  }, [media]);

  // Manejar animación del modal
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

  // Cargar colecciones al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadCollections();
    }
  }, [isOpen]);

  // Cargar las colecciones disponibles
  const loadCollections = async () => {
    try {
      setCollectionsLoading(true);
      const result = await getCollections();

      if (result.ok) {
        setCollections(result.data);
      } else {
        console.error('Error cargando colecciones:', result.error);
      }
    } catch (error) {
      console.error('Error cargando colecciones:', error);
    } finally {
      setCollectionsLoading(false);
    }
  };

  // No renderizar si el modal está cerrado o no hay elemento seleccionado
  if (!isOpen || !media) return null;

  // Manejar cambios en campos de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMediaData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en campo de etiquetas (separadas por comas)
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

  // Formatear array de etiquetas a string separado por comas
  const formatTags = (tags = []) => {
    return tags.join(', ');
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(media.id, mediaData);
    setEditMode(false);
  };

  // Formatear tamaño de archivo para mostrar
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
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

  // Obtener nombre de colección
  const getCollectionName = (collectionId) => {
    if (!collectionId) return 'Sin colección';
    const collection = collections.find(c => c.id === collectionId);
    return collection ? collection.name : 'Colección desconocida';
  };

  // Evitar propagación de clics en el contenido del modal
  const stopPropagation = (e) => {
    e.stopPropagation();
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
        onClick={stopPropagation}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
        }}
      >
        {/* Cabecera del Modal */}
        <div className="modal-header">
          <h5 className="modal-title">
            {editMode ? 'Editar Detalles de Imagen' : 'Detalles de Imagen'}
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
            {/* Previsualización de la Imagen */}
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="media-preview-modal">
                <img
                  src={media.url}
                  alt={media.alt || media.name || media.filename}
                  className="img-fluid rounded"
                />
              </div>

              {/* Detalles del archivo */}
              <div className="mt-3">
                <h6 className="fw-bold mb-2">Detalles del Archivo</h6>
                <table className="table table-sm metadata-table">
                  <tbody>
                  <tr>
                    <th scope="row">Nombre original</th>
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
                  {/* Campo nombre personalizado */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nombre personalizado</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="name"
                      name="name"
                      value={mediaData.name}
                      onChange={handleChange}
                      placeholder="Nombre descriptivo para la imagen"
                    />
                    <div className="form-text">
                      Este nombre identifica la imagen en el sistema
                    </div>
                  </div>

                  {/* Campo texto alternativo */}
                  <div className="mb-3">
                    <label htmlFor="alt" className="form-label">Texto Alternativo</label>
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
                      Texto para usuarios con lectores de pantalla
                    </div>
                  </div>

                  {/* Selector de colección */}
                  <div className="mb-3">
                    <label htmlFor="collectionId" className="form-label">Colección</label>
                    <select
                      className="form-select form-select-sm"
                      id="collectionId"
                      name="collectionId"
                      value={mediaData.collectionId || ''}
                      onChange={handleChange}
                      disabled={collectionsLoading}
                    >
                      <option value="">Sin colección</option>
                      {collections.map(collection => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      Asigna esta imagen a una colección para organizar tu biblioteca
                    </div>
                  </div>

                  {/* Campo de etiquetas */}
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

                  {/* Botones de acción */}
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm me-2"
                      onClick={() => setEditMode(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h6 className="fw-bold mb-2">Información de la Imagen</h6>

                  {/* Nombre personalizado */}
                  <div className="mb-3">
                    <p className="fw-semibold mb-1 small text-muted">Nombre personalizado</p>
                    <p>{mediaData.name || 'Sin nombre personalizado'}</p>
                  </div>

                  {/* Colección */}
                  <div className="mb-3">
                    <p className="fw-semibold mb-1 small text-muted">Colección</p>
                    <p>
                      {mediaData.collectionId ? (
                        <span className="badge bg-primary">
                          {getCollectionName(mediaData.collectionId)}
                        </span>
                      ) : (
                        'Sin colección'
                      )}
                    </p>
                  </div>

                  {/* Texto alternativo */}
                  <div className="mb-3">
                    <p className="fw-semibold mb-1 small text-muted">Texto Alternativo</p>
                    <p>{mediaData.alt || 'Sin texto alternativo'}</p>
                  </div>

                  {/* Etiquetas */}
                  <div className="mb-3">
                    <p className="fw-semibold mb-1 small text-muted">Etiquetas</p>
                    <div>
                      {mediaData.tags && mediaData.tags.length > 0 ? (
                        mediaData.tags.map((tag, index) => (
                          <span key={index} className="badge bg-secondary me-1 mb-1">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">Sin etiquetas</span>
                      )}
                    </div>
                  </div>

                  {/* URL de la imagen */}
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

                  {/* Botón para editar */}
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setEditMode(true)}
                    >
                      Editar Detalles
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
};