import { useState, useEffect, useRef } from 'react';
import { getCollections } from '../../services/collectionsService';

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
  const [showNewCollectionOption, setShowNewCollectionOption] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Referencias
  const fileInputRef = useRef(null);

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
        console.log('Colecciones cargadas:', result.data); // Debugging
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
      alert('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño de archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El tamaño del archivo debe ser menor a 5MB');
      return;
    }

    // Guardar archivo seleccionado
    setSelectedFile(file);

    // Generar URL para previsualización
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Generar nombre personalizado a partir del nombre original
    // Eliminar extensión y reemplazar guiones/underscores por espacios
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

    if (name === 'collectionId' && value === 'new') {
      setShowNewCollectionOption(true);
      return;
    }

    // Si cambia la colección, verificar que existe
    if (name === 'collectionId' && value) {
      const collectionExists = collections.some(c => c.id === value);
      if (!collectionExists && value !== 'new' && value !== '') {
        console.warn('Se seleccionó una colección que no existe:', value);
      }
    }

    setMetadata(prev => ({
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
        description: 'Creado desde carga de imágenes',
        color: '#3b82f6' // Añadir un color por defecto para mejor visualización
      });

      if (!result.ok) {
        throw new Error(result.error || 'Error al crear colección');
      }

      console.log('Colección creada:', result); // Debugging

      // Recargar colecciones
      await loadCollections();

      // Actualizar el estado para seleccionar la nueva colección
      setMetadata(prev => ({
        ...prev,
        collectionId: result.id // Este es el ID devuelto por la operación
      }));

      // Resetear estado
      setNewCollectionName('');
      setShowNewCollectionOption(false);

      // Mostrar confirmación al usuario
      alert(`Colección "${newCollectionName.trim()}" creada con éxito.`);

    } catch (error) {
      console.error('Error creando colección:', error);
      alert('Error al crear la colección: ' + error.message);
    } finally {
      setCollectionsLoading(false);
    }
  };

  /**
   * Maneja el envío del formulario para subir la imagen
   */
  const handleUploadClick = async () => {
    if (!selectedFile) {
      alert('Por favor selecciona un archivo para subir');
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
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
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
            <i className="bi bi-cloud-arrow-up fs-1 text-muted"></i>
            <h5 className="mt-3">Arrastra una imagen aquí</h5>
            <p className="text-muted">o</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onButtonClick}
            >
              Seleccionar Archivo
            </button>
            <p className="mt-3 text-muted small">
              Formatos soportados: JPG, PNG, GIF, SVG, WebP (Máx. 5MB)
            </p>
          </div>
        </div>
      ) : (
        // Formulario para metadatos y confirmación de subida
        <div className="selected-file-form">
          <div className="row g-4">
            <div className="col-md-4 mb-3">
              {/* Previsualización del archivo */}
              <div className="selected-file-preview">
                <img
                  src={previewUrl}
                  alt="Previsualización"
                  className="img-fluid rounded"
                />
                <div className="selected-file-info mt-2">
                  <p className="mb-1">
                    <strong>{selectedFile.name}</strong>
                  </p>
                  <p className="text-muted small mb-0">
                    {selectedFile.type} - {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              {/* Formulario de metadatos */}
              <form>
                {/* Campo nombre personalizado */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Nombre personalizado</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={metadata.name}
                    onChange={handleInputChange}
                    placeholder="Asigna un nombre descriptivo a la imagen"
                  />
                  <div className="form-text">
                    Este nombre se usará para identificar la imagen en el sistema
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
                    value={metadata.alt}
                    onChange={handleInputChange}
                    placeholder="Descripción para accesibilidad"
                  />
                  <div className="form-text">
                    Describe la imagen para lectores de pantalla y SEO
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
                        disabled={collectionsLoading}
                      />
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={handleCreateCollection}
                        disabled={collectionsLoading || !newCollectionName.trim()}
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
                        disabled={collectionsLoading}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      id="collectionId"
                      name="collectionId"
                      value={metadata.collectionId}
                      onChange={handleInputChange}
                      disabled={collectionsLoading}
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
                    placeholder="verano, destacado, producto (separadas por comas)"
                  />
                  <div className="form-text">
                    Etiquetas separadas por comas para facilitar búsquedas
                  </div>
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
                    className="btn btn-primary"
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
    </div>
  );
};