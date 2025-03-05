import { useNavigate } from 'react-router-dom';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { MediaUploader } from '../components/media';
import '../styles/mediaLibrary.css';

/**
 * MediaUploadPage - Página simplificada para carga de archivos multimedia
 *
 * @returns {JSX.Element}
 */
export const MediaUploadPage = () => {
  const navigate = useNavigate();
  const { handleUpload, loading, error } = useMediaLibrary();

  /**
   * Maneja la carga completa del archivo y redirecciona
   */
  const handleSuccessfulUpload = async (file, metadata) => {
    try {
      const result = await handleUpload(file, metadata);

      if (result.ok) {
        // Navegar de vuelta a la biblioteca después de una carga exitosa
        navigate('/admin/media/browse');
      }
    } catch (err) {
      console.error('Error durante la carga:', err);
    }
  };

  return (
    <div className="media-upload-container">
      {/* Cabecera minimalista */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-icon btn-outline-secondary me-3 rounded-circle"
            onClick={() => navigate('/admin/media/browse')}
            style={{ width: '40px', height: '40px' }}
          >
            <i className="bi bi-arrow-left"></i>
          </button>
          <h2 className="page-title mb-0">Subir archivo</h2>
        </div>
      </div>

      {/* Mensaje de error si aplica */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Uploader directamente sin card contenedor */}
      <MediaUploader
        onUpload={handleSuccessfulUpload}
        loading={loading}
      />
    </div>
  );
};