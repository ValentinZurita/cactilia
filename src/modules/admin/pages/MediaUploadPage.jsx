import { useNavigate } from 'react-router-dom';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { MediaUploader } from '../components/media';
import '../styles/mediaLibrary.css';

/**
 * MediaUploadPage - Component for the media upload interface
 *
 * This page provides an interface for uploading new media files
 * with drag-and-drop capability and metadata entry
 *
 * @returns {JSX.Element}
 */
export const MediaUploadPage = () => {
  const navigate = useNavigate();
  const { handleUpload, loading, error } = useMediaLibrary();

  /**
   * Handles the successful upload of a file and redirects
   * back to the media library
   *
   * @param {File} file - The uploaded file
   * @param {Object} metadata - The metadata for the file
   * @returns {Promise<void>}
   */
  const handleSuccessfulUpload = async (file, metadata) => {
    try {
      const result = await handleUpload(file, metadata);

      if (result.ok) {
        // Navigate back to the library after successful upload
        navigate('/admin/media/browse');
      }
    } catch (err) {
      console.error('Error during upload:', err);
      // Error handling is managed by the hook
    }
  };

  return (
    <div className="media-upload-container">
      {/* Header with title and back button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Upload Media</h2>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/admin/media/browse')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Library
        </button>
      </div>

      {/* Error message if applicable */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Main content card with uploader */}
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