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
  const [showNewCollectionOption, setShowNewCollectionOption] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Estado para procesar actualizaciones
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (name === 'collectionId' && value === 'new') {
      setShowNewCollectionOption(true);
      return;
    }

    setMediaData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Maneja la creación de una nueva colección
   */
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      alert('Por favor ingresa un nombre para la colección');
      return;
    }

    try {
      setCollectionsLoading(true);

      // Importar el servicio para crear colecciones
      const { createCollection } = await import('../../services/collectionsService');

      // Crear nueva colección
      const result = await createCollection({
        name: newCollectionName.trim(),
        description: 'Creado desde detalles de media'
      });

      if (!result.ok) {
        throw new Error(result.error || 'Error al crear colección');
      }

      // Recargar colecciones
      await loadCollections();

      // Seleccionar la nueva colección
      setMediaData(prev => ({
        ...prev,
        collectionId: result.id
      }));

      // Resetear estado
      setNewCollectionName('');
      setShowNewCollectionOption(false);

    } catch (error) {
      console.error('Error creando colección:', error);
      alert('Error al crear la colección: ' + error.message);
    } finally {
      setCollectionsLoading(false);
    }
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onUpdate(media.id, mediaData);
      setEditMode(false);
    } catch (error) {
      console.error('Error actualizando media:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  // Obtener color de colección
  const getCollectionColor = (collectionId) => {
    if (!collectionId) return '#e2e8f0';
    const collection = collections.find(c => c.id === collectionId);
    return collection?.color || '#3b82f6';
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        padding: '1rem'
      }}
    >
      <div
        className="modal-content media-details-modal"
        onClick={stopPropagation}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflow: 'hidden',
          transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Cabecera del Modal */}
        <div className="modal-header d-flex align-items-center">
          <h5 className="modal-title d-flex align-items-center">
            {media.collectionId && (
              <span
                className="color-dot me-2"
                style={{ backgroundColor: getCollectionColor(media.collectionId) }}
              ></span>
            )}
            {editMode ? 'Editar Imagen' : 'Detalles de Imagen'}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar"
          ></button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="modal-body">
          <div className="row g-4">
            {/* Previsualización de la Imagen */}
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="media-preview-modal">
                <img
                  src={media.url}
                  alt={media.alt || media.name || media.filename}
                  className="img-fluid rounded shadow-sm"
                />
              </div>

              {/* Detalles del archivo */}
              <div className="mt-3">
                <h6 className="fw-bold mb-2">Detalles del Archivo</h6>
                <div className="card border-0 bg-light rounded-3">
                  <div className="card-body p-3">
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="detail-item">
                          <small className="text-muted d-block">Nombre original</small>
                          <p className="mb-2 fw-medium small text-truncate" title={media.filename}>
                            {media.filename}
                          </p>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="detail-item">
                          <small className="text-muted d-block">Tipo</small>
                          <p className="mb-2 small">
                            {media.type}
                          </p>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="detail-item">
                          <small className="text-muted d-block">Tamaño</small>
                          <p className="mb-2 small">
                            {formatFileSize(media.size)}
                          </p>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="detail-item">
                          <small className="text-muted d-block">Subido</small>
                          <p className="mb-2 small">
                            {formatDate(media.uploadedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* URL de la imagen */}
              <div className="mt-3">
                <label className="form-label small fw-medium">URL de la imagen</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={media.url}
                    readOnly
                  />
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(media.url);
                      // Mostrar una pequeña indicación de copiado (puedes implementar un toast aquí)
                    }}
                    title="Copiar al portapapeles"
                  >
                    <i className="bi bi-clipboard"></i>
                  </button>
                </div>
                <div className="form-text">
                  Usa esta URL para insertar la imagen en tu contenido
                </div>
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
                      className="form-control"
                      id="name"
                      name="name"
                      value={mediaData.name}
                      onChange={handleChange}
                      placeholder="Nombre descriptivo para la imagen"
                      disabled={isSubmitting}
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
                      className="form-control"
                      id="alt"
                      name="alt"
                      value={mediaData.alt}
                      onChange={handleChange}
                      placeholder="Descripción para accesibilidad"
                      disabled={isSubmitting}
                    />
                    <div className="form-text">
                      Texto para usuarios con lectores de pantalla y SEO
                    </div>
                  </div>

                  {/* Selector de colección mejorado */}
                  <div className="mb-3">
                    <label htmlFor="collectionId" className="form-label">Colección</label>
                    {showNewCollectionOption ? (
                      <div className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nombre de la nueva colección"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                          disabled={collectionsLoading || isSubmitting}
                        />
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={handleCreateCollection}
                          disabled={collectionsLoading || !newCollectionName.trim() || isSubmitting}
                        >
                          {collectionsLoading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="bi bi-plus"></i>
                          )}
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => {
                            setShowNewCollectionOption(false);
                            setNewCollectionName('');
                          }}
                          disabled={collectionsLoading || isSubmitting}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ) : (
                      <select
                        className="form-select"
                        id="collectionId"
                        name="collectionId"
                        value={mediaData.collectionId || ''}
                        onChange={handleChange}
                        disabled={collectionsLoading || isSubmitting}
                      >
                        <option value="">Sin colección</option>
                        <option value="new" className="fw-bold text-primary">+ Crear nueva colección</option>
                        {collections.length > 0 && (
                          <optgroup label="Colecciones existentes">
                            {collections.map(collection => (
                              <option key={collection.id} value={collection.id}>
                                {collection.name}
                                {collection.description ? ` - ${collection.description}` : ''}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    )}
                    <div className="form-text">
                      Asigna esta imagen a una colección para organizar tu biblioteca
                    </div>
                  </div>

                  {/* Campo de etiquetas */}
                  <div className="mb-3">
                    <label htmlFor="tags" className="form-label">Etiquetas</label>
                    <input
                      type="text"
                      className="form-control"
                      id="tags"
                      name="tags"
                      value={formatTags(mediaData.tags)}
                      onChange={handleTagsChange}
                      placeholder="verano, destacado, producto (separadas por comas)"
                      disabled={isSubmitting}
                    />
                    <div className="form-text">
                      Etiquetas separadas por comas para facilitar búsquedas
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="d-flex justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={() => setEditMode(false)}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Guardando...
                        </>
                      ) : (
                        <>Guardar Cambios</>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h6 className="fw-bold mb-3">Información de la Imagen</h6>

                  {/* Nombre personalizado */}
                  <div className="info-group mb-3">
                    <label className="text-muted small d-block mb-1">Nombre personalizado</label>
                    <p className="mb-0 fw-medium">{mediaData.name || 'Sin nombre personalizado'}</p>
                  </div>

                  {/* Colección con visual mejorado */}
                  <div className="info-group mb-3">
                    <label className="text-muted small d-block mb-1">Colección</label>
                    {mediaData.collectionId ? (
                      <div className="d-inline-flex align-items-center px-3 py-2 bg-light rounded-3">
                        <span
                          className="color-dot me-2"
                          style={{ backgroundColor: getCollectionColor(mediaData.collectionId) }}
                        ></span>
                        <span>{getCollectionName(mediaData.collectionId)}</span>
                      </div>
                    ) : (
                      <p className="mb-0 fst-italic text-muted">Sin colección</p>
                    )}
                  </div>

                  {/* Texto alternativo */}
                  <div className="info-group mb-3">
                    <label className="text-muted small d-block mb-1">Texto Alternativo</label>
                    <p className="mb-0">
                      {mediaData.alt || <span className="fst-italic text-muted">Sin texto alternativo</span>}
                    </p>
                  </div>

                  {/* Etiquetas */}
                  <div className="info-group mb-4">
                    <label className="text-muted small d-block mb-1">Etiquetas</label>
                    <div>
                      {mediaData.tags && mediaData.tags.length > 0 ? (
                        <div className="tags-container">
                          {mediaData.tags.map((tag, index) => (
                            <span key={index} className="badge bg-light text-dark me-1 mb-1 px-2 py-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mb-0 fst-italic text-muted">Sin etiquetas</p>
                      )}
                    </div>
                  </div>

                  {/* Botón para editar */}
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setEditMode(true)}
                    >
                      <i className="bi bi-pencil me-2"></i>
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