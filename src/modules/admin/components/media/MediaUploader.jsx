import { useState, useRef } from 'react';

/**
 * MediaUploader - Componente para subir archivos multimedia con arrastrar y soltar
 *
 * Proporciona una interfaz intuitiva para subir archivos con previsualización,
 * soporte para arrastrar y soltar, y campos para metadatos.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onUpload - Manejador para la subida de archivos
 * @param {boolean} props.loading - Estado de carga durante la subida
 * @returns {JSX.Element}
 */
export const MediaUploader = ({ onUpload, loading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [metadata, setMetadata] = useState({
    alt: '',
    category: '',
    tags: ''
  });
  const fileInputRef = useRef(null);

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
      // Al menos se ha soltado un archivo
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  /**
   * Maneja la selección de archivo desde el input
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
    // Comprobar si el archivo es una imagen
    if (!file.type.match('image.*')) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    // Establecer el archivo seleccionado y generar texto alternativo por defecto
    setSelectedFile(file);
    setMetadata(prev => ({
      ...prev,
      alt: file.name.replace(/\.[^/.]+$/, '') // Eliminar extensión para texto alternativo
    }));
  };

  /**
   * Maneja cambios en los campos del formulario
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
   * Maneja el clic en el botón de subida
   */
  const handleUploadClick = async () => {
    if (!selectedFile) {
      alert('Por favor selecciona un archivo para subir');
      return;
    }

    // Convertir etiquetas en array
    const tagsArray = metadata.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    // Llamar a la función onUpload con el archivo y metadatos
    await onUpload(selectedFile, {
      ...metadata,
      tags: tagsArray
    });

    // Reiniciar formulario después de la subida
    setSelectedFile(null);
    setMetadata({
      alt: '',
      category: '',
      tags: ''
    });
  };

  /**
   * Activa el diálogo de selección de archivo
   */
  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="media-uploader">
      {!selectedFile ? (
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
            <h5 className="mt-3">Arrastra y suelta una imagen aquí</h5>
            <p className="text-muted">o</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onButtonClick}
            >
              Explorar archivos
            </button>
            <p className="mt-3 text-muted small">
              Formatos soportados: JPG, PNG, GIF, SVG, WebP (Máx. 5MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="selected-file-form">
          <div className="row">
            <div className="col-md-4 mb-3">
              {/* Previsualización del archivo */}
              <div className="selected-file-preview">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Vista previa"
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
                {/* Texto alternativo */}
                <div className="mb-3">
                  <label htmlFor="alt" className="form-label">Texto alternativo</label>
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

                {/* Categoría */}
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Categoría</label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={metadata.category}
                    onChange={handleInputChange}
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

                {/* Botones */}
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
                      'Subir imagen'
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