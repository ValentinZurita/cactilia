import { useState, useRef, useEffect } from 'react';
import { getCollections } from '../../services/collectionsService';

/**
 * MediaUploader - Componente para subir archivos multimedia con soporte para colecciones
 *
 * Proporciona una interfaz intuitiva para cargar archivos con arrastrar y soltar,
 * personalización de nombre y selección de colección.
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

  // Referencias
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  // Cargar colecciones al iniciar
  useEffect(() => {
    loadCollections();
  }, []);

  /**
   * Carga las colecciones disponibles
   */
  const loadCollections = async () => {
    try {
      setCollectionsLoading(true);
      const result = await getCollections();

      if (result.ok && Array.isArray(result.data)) {
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

    // Generar nombre personalizado a partir del nombre original
    // Eliminar extensión y reemplazar guiones/underscores por espacios
    const baseName = file.name
      .replace(/\.[^/.]+$/, '') // Eliminar extensión
      .replace(/[_-]/g, ' '); // Reemplazar guiones y underscores con espacios

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
      // Si no se seleccionó ninguna colección, enviar null
      collectionId: metadata.collectionId || null
    };

    // Llamar a la función onUpload con archivo y metadatos
    await onUpload(selectedFile, metadataToUpload);

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
          <div className="row">
            <div className="col-md-4 mb-3">
              {/* Previsualización del archivo */}
              <div className="selected-file-preview">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Previsualización"
                  className="img-fluid rounded"
                />
                <div className="selected-file-info mt-2">
                  <p className="mb-1">
                    <strong>{selectedFile.name}</strong>
                  </p>
                  <p className="text-muted small">
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
                    Describe la imagen para lectores de pantalla
                  </div>
                </div>

                {/* Selector de colección */}
                <div className="mb-3">
                  <label htmlFor="collectionId" className="form-label">Colección</label>
                  <select
                    className="form-select"
                    id="collectionId"
                    name="collectionId"
                    value={metadata.collectionId}
                    onChange={handleInputChange}
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
                    placeholder="etiqueta1, etiqueta2, etiqueta3"
                  />
                  <div className="form-text">
                    Etiquetas separadas por comas para búsqueda
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="d-flex">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    onClick={() => setSelectedFile(null)}
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
                      'Subir Imagen'
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