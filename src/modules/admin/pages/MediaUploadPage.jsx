import { useNavigate } from 'react-router-dom';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { MediaUploader } from '../components/media';
import '../styles/mediaLibrary.css';

/**
 * MediaUploadPage - Página para subir nuevos archivos multimedia
 *
 * Esta página proporciona una interfaz para subir nuevos archivos a la biblioteca
 * de medios con soporte para arrastrar y soltar, previsualización y metadatos.
 *
 * @returns {JSX.Element}
 */
export const MediaUploadPage = () => {
  const navigate = useNavigate();
  const { handleUpload, loading } = useMediaLibrary();

  /**
   * Maneja la subida exitosa de un archivo
   * @param {File} file - Archivo subido
   * @param {Object} metadata - Metadatos del archivo
   * @returns {Promise<void>}
   */
  const handleSuccessfulUpload = async (file, metadata) => {
    const result = await handleUpload(file, metadata);
    if (result.ok) {
      // Navegar de vuelta a la biblioteca después de una subida exitosa
      navigate('/admin/media/browse');
    }
  };

  return (
    <div className="media-upload-container">
      {/* Encabezado con título y botón de regreso */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Subir Archivo</h2>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/admin/media/browse')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Volver a la Biblioteca
        </button>
      </div>

      {/* Contenedor principal con borde y sombra suave */}
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-4">
          <MediaUploader
            onUpload={handleSuccessfulUpload}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};