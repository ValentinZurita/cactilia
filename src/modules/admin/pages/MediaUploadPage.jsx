import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { MediaUploader } from '../components/media';

/**
 * MediaUploadPage - Page for uploading new media to the library
 */
export const MediaUploadPage = () => {
  const navigate = useNavigate();
  const { handleUpload, loading } = useMediaLibrary();

  // Handle successful upload
  const handleSuccessfulUpload = async (file, metadata) => {
    const result = await handleUpload(file, metadata);
    if (result.ok) {
      // Navigate back to the media library after successful upload
      navigate('/admin/media/browse');
    }
  };

  return (
    <div className="media-upload-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Upload Media</h2>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/admin/media/browse')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Library
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <MediaUploader
            onUpload={handleSuccessfulUpload}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};