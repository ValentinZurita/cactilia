import { useState, useEffect, useRef } from 'react';
import { getCollections } from '../../services/collectionsService';
import { CollectionsModal } from './CollectionsModal';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../../../store/messages/messageSlice';

/**
 * MediaUploader - Componente mejorado para subir archivos multimedia con soporte para colecciones
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onUpload - Función para manejar la carga de archivos
 * @param {boolean} props.loading - Indicador de estado de carga
 * @returns {JSX.Element}
 */
export const MediaUploader = ({ onUpload, loading = false }) => {
  // Estados para gestión de archivos
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Estado para metadatos
  const [metadata, setMetadata] = useState({
    name: '',
    alt: '',
    collectionId: '',
    tags: ''
  });

  // Estado para opciones de colección
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // Referencias
  const fileInputRef = useRef(null);

  // Dispatch para mensajes
  const dispatch = useDispatch();

  // Cargar colecciones al iniciar
  useEffect(() => {
    loadCollections();
  }, []);

  // Limpiar URL de previsualización al desmontar
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /**
   * Carga las colecciones disponibles
   */
  const loadCollections = async () => {
    try {
      setCollectionsLoading(true);
      const result = await getCollections();

      if (result.ok && Array.isArray(result.data)) {
        console.log('Colecciones cargadas:', result.data);
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

  /**
   * Maneja eventos de arrastrar
   * @param {Event} e - Evento de arrastrar
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Maneja el evento de soltar archivo
   * @param {Event} e - Evento de soltar
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  /**
   * Maneja la selección de archivo desde input
   * @param {Event} e - Evento de cambio
   */
  const handleChange = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  /**
   * Procesa el archivo seleccionado
   * @param {File} file - Archivo seleccionado
   */
  const handleFiles = (file) => {
    // Validar tipo de archivo
    if (!file.type.match('image.*')) {
      dispatch(addMessage({
        type: 'error',
        text: 'Solo se permiten archivos de imagen'
      }));
      return;
    }

    // Validar tamaño de archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      dispatch(addMessage({
        type: 'error',
        text: 'El tamaño del archivo debe ser menor a 5MB'
      }));
      return;
    }

    // Guardar archivo seleccionado
    setSelectedFile(file);

    // Generar URL para previsualización
    try {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } catch (error) {
      console.error('Error creando URL de previsualización:', error);
      // No impedir que continúe si falla la previsualización
    }

    // Generar nombre personalizado a partir del nombre original
    const baseName = file.name
      .replace(/\.[^/.]+$/, '') // Eliminar extensión
      .replace(/[_-]/g, ' ') // Reemplazar guiones y underscores con espacios
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize each word

    // Actualizar metadatos
    setMetadata(prev => ({
      ...prev,
      name: baseName, // Nombre mejorado como sugerencia
      alt: baseName // Alt text igual al nombre por defecto
    }));
  };

  /**
   * Maneja cambios en campos de metadatos
   * @param {Event} e - Evento de cambio
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Si selecciona "new" (crear nueva colección), mostrar el modal
    if (name === 'collectionId' && value === 'new') {
      setShowCollectionModal(true);
      return; // No actualizar el valor del select aún
    }

    setMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Maneja el envío del formulario para subir la imagen
   */
  const handleUploadClick = async () => {
    if (!selectedFile) {
      dispatch(addMessage({
        type: 'error',
        text: 'Por favor selecciona un archivo para subir'
      }));
      return;
    }

    // Convertir tags de string a array
    const tagsArray = metadata.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    // Preparar metadatos para subir
    const metadataToUpload = {
      ...metadata,
      tags: tagsArray,
      name: metadata.name.trim() || selectedFile.name, // Asegurar que hay un nombre
      // Si no se seleccionó ninguna colección, enviar null
      collectionId: metadata.collectionId || null
    };

    console.log('Subiendo archivo con metadatos:', metadataToUpload); // Debugging

    // Llamar a la función onUpload con archivo y metadatos
    await onUpload(selectedFile, metadataToUpload);

    // Limpiar previsualización
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    // Resetear formulario después de subir
    setSelectedFile(null);
    setMetadata({
      name: '',
      alt: '',
      collectionId: '',
      tags: ''
    });
  };

  /**
   * Activa el selector de archivos
   */
  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // Cancelar la selección de archivo
  const handleCancelSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  };

  return (
    <div className="media-uploader">
      {!selectedFile ? (
        // Área de subida para arrastrar y soltar o seleccionar archivo
        <div
          className={`upload-area upload-area-minimal ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload"
            multiple={false}
            onChange={handleChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <div className="upload-prompt">
            <i className="bi bi-cloud-arrow-up fs-1 text-primary mb-3"></i>
            <h5 className="mb-3">Arrastra una imagen aquí</h5>
            <p className="text-muted mb-4">o</p>
            <button
              type="button"
              className="btn btn-primary px-4 py-2"
              onClick={onButtonClick}
            >
              Seleccionar Archivo
            </button>
            <p className="mt-4 text-muted small">
              JPG, PNG, GIF, SVG, WebP (Máx. 5MB)
            </p>
          </div>
        </div>
      ) : (
        // Formulario para metadatos y confirmación de subida
        <div className="selected-file-form p-4">
          <div className="row g-4">
            <div className="col-md-4 mb-3">
              {/* Previsualización del archivo */}
              <div className="selected-file-preview text-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Previsualización"
                    className="img-fluid rounded"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                ) : (
                  <div className="preview-placeholder p-5 bg-light rounded d-flex justify-content-center align-items-center">
                    <span className="text-muted">{selectedFile.name}</span>
                  </div>
                )}
                <div className="selected-file-info mt-2">
                  <p className="mb-1">
                    <strong>{selectedFile.name}</strong>
                  </p>
                  <p className="text-muted small mb-0">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              {/* Formulario de metadatos simplificado */}
              <form>
                {/* Campo nombre personalizado */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={metadata.name}
                    onChange={handleInputChange}
                    placeholder="Nombre de la imagen"
                  />
                </div>

                {/* Selector de colección con opción para crear nueva */}
                <div className="mb-3">
                  <label htmlFor="collectionId" className="form-label">Colección</label>
                  <select
                    className="form-select"
                    id="collectionId"
                    name="collectionId"
                    value={metadata.collectionId}
                    onChange={handleInputChange}
                    disabled={collectionsLoading || loading}
                  >
                    <option value="">Sin colección</option>
                    <option value="new" className="fw-bold text-primary">+ Crear nueva colección</option>
                    {collections.length > 0 && (
                      <optgroup label="Colecciones existentes">
                        {collections.map(collection => (
                          <option key={collection.id} value={collection.id}>
                            {collection.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Campo texto alternativo */}
                <div className="mb-3">
                  <label htmlFor="alt" className="form-label">Texto Alternativo</label>
                  <input
                    type="text"
                    className="form-control"
                    id="alt"
                    name="alt"
                    value={metadata.alt}
                    onChange={handleInputChange}
                    placeholder="Descripción para accesibilidad"
                  />
                </div>

                {/* Campo etiquetas */}
                <div className="mb-3">
                  <label htmlFor="tags" className="form-label">Etiquetas</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tags"
                    name="tags"
                    value={metadata.tags}
                    onChange={handleInputChange}
                    placeholder="Separadas por comas (ej: verano, producto)"
                  />
                </div>

                {/* Botones de acción */}
                <div className="d-flex mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    onClick={handleCancelSelection}
                    disabled={loading}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary flex-grow-1"
                    onClick={handleUploadClick}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-arrow-up me-2"></i>
                        Subir Imagen
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear colección */}
      <CollectionsModal
        isOpen={showCollectionModal}
        collection={null}
        onClose={() => setShowCollectionModal(false)}
        onSave={async (_, collectionData) => {
          try {
            setCollectionsLoading(true);

            const { createCollection } = await import('../../services/collectionsService');
            const result = await createCollection(collectionData);

            if (!result.ok) {
              throw new Error(result.error || 'Error al crear colección');
            }

            // Obtener el ID de la colección recién creada
            const newCollectionId = result.id;
            console.log('Nueva colección creada con ID:', newCollectionId);

            // Recargar lista de colecciones
            await loadCollections();

            // Establecer la colección recién creada como seleccionada
            setMetadata(prev => ({
              ...prev,
              collectionId: newCollectionId
            }));

            setShowCollectionModal(false);

            dispatch(addMessage({
              type: 'success',
              text: `Colección "${collectionData.name}" creada con éxito`
            }));
          } catch (error) {
            console.error('Error creando colección:', error);
            dispatch(addMessage({
              type: 'error',
              text: `Error al crear colección: ${error.message}`
            }));
          } finally {
            setCollectionsLoading(false);
          }
        }}
      />
    </div>
  );
};