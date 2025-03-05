import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getCollections } from '../../services/collectionsService';

/**
 * MediaDetailsModal - Modal minimalista para ver y editar detalles de archivos multimedia
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
      className="modal-backdrop"
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
          borderRadius: '1rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflow: 'hidden',
          transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Cabecera minimalista */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="m-0 d-flex align-items-center">
            {editMode ? (
              <>
                <i className="bi bi-pencil me-2 text-primary"></i>
                Editar imagen
              </>
            ) : (
              <>
                <i className="bi bi-image me-2 text-primary"></i>
                Detalles de imagen
              </>
            )}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Cerrar"
          ></button>
        </div>

        {/* Cuerpo del modal con diseño mejorado */}
        <div className="p-0" style={{ overflow: 'auto', maxHeight: 'calc(90vh - 110px)' }}>
          <div className="row g-0">
            {/* Panel lateral con la imagen */}
            <div className="col-md-5 border-end position-relative" style={{ minHeight: '400px' }}>
              <div className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center bg-light">
                <img
                  src={media.url}
                  alt={media.alt || media.name || 'Imagen'}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    padding: '1rem'
                  }}
                />
              </div>
            </div>

            {/* Panel de información/edición */}
            <div className="col-md-7">
              <div className="p-4">
                {editMode ? (
                  /* FORMULARIO DE EDICIÓN */
                  <form onSubmit={handleSubmit}>
                    {/* Campo de nombre */}
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label small fw-bold text-muted">
                        NOMBRE
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control form-control-lg"
                        value={mediaData.name}
                        onChange={handleChange}
                        placeholder="Nombre descriptivo"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Campo de texto alternativo */}
                    <div className="mb-3">
                      <label htmlFor="alt" className="form-label small fw-bold text-muted">
                        TEXTO ALTERNATIVO
                      </label>
                      <input
                        type="text"
                        id="alt"
                        name="alt"
                        className="form-control"
                        value={mediaData.alt}
                        onChange={handleChange}
                        placeholder="Descripción para accesibilidad"
                        disabled={isSubmitting}
                      />
                      <div className="form-text">
                        Útil para SEO y usuarios con lectores de pantalla
                      </div>
                    </div>

                    {/* Selector de colección */}
                    <div className="mb-3">
                      <label htmlFor="collectionId" className="form-label small fw-bold text-muted">
                        COLECCIÓN
                      </label>
                      <select
                        id="collectionId"
                        name="collectionId"
                        className="form-select"
                        value={mediaData.collectionId || ''}
                        onChange={handleChange}
                        disabled={collectionsLoading || isSubmitting}
                      >
                        <option value="">Sin colección</option>
                        {collections.map(collection => (
                          <option key={collection.id} value={collection.id}>
                            {collection.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Campo de etiquetas */}
                    <div className="mb-4">
                      <label htmlFor="tags" className="form-label small fw-bold text-muted">
                        ETIQUETAS
                      </label>
                      <input
                        type="text"
                        id="tags"
                        className="form-control"
                        value={formatTags(mediaData.tags)}
                        onChange={handleTagsChange}
                        placeholder="Separadas por comas (ej: verano, producto)"
                        disabled={isSubmitting}
                      />
                      <div className="form-text">
                        Ayudan a encontrar la imagen en búsquedas
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="d-flex justify-content-end mt-4 pt-2 border-top">
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
                        className="btn btn-primary px-4"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Guardando...
                          </>
                        ) : (
                          <>Guardar</>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* MODO VISUALIZACIÓN */
                  <div>
                    {/* Nombre del archivo */}
                    <h3 className="fw-bold mb-3 text-break">
                      {mediaData.name || 'Sin nombre'}
                    </h3>

                    {/* Colección con badge */}
                    {mediaData.collectionId ? (
                      <div className="mb-4">
                        <span
                          className="badge rounded-pill px-3 py-2"
                          style={{
                            backgroundColor: getCollectionColor(mediaData.collectionId),
                            color: 'white'
                          }}
                        >
                          {getCollectionName(mediaData.collectionId)}
                        </span>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <span className="badge bg-light text-muted border px-3 py-2">
                          Sin colección
                        </span>
                      </div>
                    )}

                    {/* Detalles del archivo */}
                    <div className="row mb-4">
                      <div className="col-sm-6 mb-3">
                        <h6 className="text-muted small fw-bold mb-2">DETALLES</h6>
                        <ul className="list-unstyled">
                          <li className="mb-2">
                            <small className="text-muted">Tipo:</small>
                            <span className="ms-2">{media.type || 'Desconocido'}</span>
                          </li>
                          <li className="mb-2">
                            <small className="text-muted">Tamaño:</small>
                            <span className="ms-2">{formatFileSize(media.size)}</span>
                          </li>
                          <li className="mb-2">
                            <small className="text-muted">Subido:</small>
                            <span className="ms-2">{formatDate(media.uploadedAt)}</span>
                          </li>
                        </ul>
                      </div>

                      <div className="col-sm-6 mb-3">
                        <h6 className="text-muted small fw-bold mb-2">TEXTO ALTERNATIVO</h6>
                        <p className="mb-0">
                          {mediaData.alt || <span className="text-muted fst-italic">Sin texto alternativo</span>}
                        </p>
                      </div>
                    </div>

                    {/* Etiquetas */}
                    <h6 className="text-muted small fw-bold mb-2">ETIQUETAS</h6>
                    <div className="mb-4">
                      {mediaData.tags && mediaData.tags.length > 0 ? (
                        <div>
                          {mediaData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="badge bg-light text-dark me-1 mb-1"
                              style={{ padding: '8px 12px' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted fst-italic mb-0">Sin etiquetas</p>
                      )}
                    </div>

                    {/* URL de la imagen */}
                    <h6 className="text-muted small fw-bold mb-2">URL DE LA IMAGEN</h6>
                    <div className="input-group mb-4">
                      <input
                        type="text"
                        className="form-control form-control-sm bg-light"
                        value={media.url}
                        readOnly
                        onClick={(e) => e.target.select()}
                      />
                      <button
                        className="btn btn-sm btn-outline-primary"
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(media.url);
                        }}
                        title="Copiar al portapapeles"
                      >
                        <i className="bi bi-clipboard"></i>
                      </button>
                    </div>

                    {/* Botones de acción */}
                    <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setEditMode(true)}
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Editar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};