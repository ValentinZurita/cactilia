import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './../../styles/mediaLibrary.css';

/**
 * MediaDetailsModal - Component for viewing and editing media details
 *
 * @param {Object} props
 * @param {Object} props.media - Media item to display
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Handler for closing the modal
 * @param {Function} props.onUpdate - Handler for updating media metadata
 * @returns {JSX.Element|null}
 */
export const MediaDetailsModal = ({ media, isOpen, onClose, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [mediaData, setMediaData] = useState({
    alt: '',
    category: '',
    tags: []
  });
  const [isVisible, setIsVisible] = useState(false);

  // Initialize form data when media changes
  useEffect(() => {
    if (media) {
      setMediaData({
        alt: media.alt || '',
        category: media.category || '',
        tags: media.tags || []
      });
    }
  }, [media]);

  // Animation for modal entrance/exit
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

  // If modal is not open or no media is provided, return null
  if (!isOpen || !media) return null;

  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMediaData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler for tag input (comma-separated)
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

  // Format tags array to comma-separated string
  const formatTags = (tags = []) => {
    return tags.join(', ');
  };

  // Handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(media.id, mediaData);
    setEditMode(false);
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
          transition: 'transform 0.3s ease',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <h5 className="modal-title">
            {editMode ? 'Edit Media Details' : 'Media Details'}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ overflow: 'auto' }}>
          <div className="row">
            {/* Media Preview */}
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="media-preview-container">
                <img
                  src={media.url}
                  alt={media.alt || media.filename}
                  className="img-fluid rounded"
                  style={{
                    maxHeight: '400px',
                    objectFit: 'contain',
                    width: '100%'
                  }}
                />
              </div>

              {/* File Details */}
              <div className="mt-3">
                <h6>File Details</h6>
                <table className="table table-sm">
                  <tbody>
                  <tr>
                    <th scope="row">Filename</th>
                    <td>{media.filename}</td>
                  </tr>
                  <tr>
                    <th scope="row">Type</th>
                    <td>{media.type}</td>
                  </tr>
                  <tr>
                    <th scope="row">Size</th>
                    <td>{formatFileSize(media.size)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Uploaded</th>
                    <td>{formatDate(media.uploadedAt)}</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Media Details Form */}
            <div className="col-md-6">
              {editMode ? (
                <form onSubmit={handleSubmit}>
                  {/* Alt Text */}
                  <div className="mb-3">
                    <label htmlFor="alt" className="form-label">Alt Text</label>
                    <input
                      type="text"
                      className="form-control"
                      id="alt"
                      name="alt"
                      value={mediaData.alt}
                      onChange={handleChange}
                      placeholder="Description for accessibility"
                    />
                    <div className="form-text">
                      Describe the image for screen readers
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                      className="form-select"
                      id="category"
                      name="category"
                      value={mediaData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      <option value="hero">Hero</option>
                      <option value="product">Product</option>
                      <option value="background">Background</option>
                      <option value="banner">Banner</option>
                      <option value="icon">Icon</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div className="mb-3">
                    <label htmlFor="tags" className="form-label">Tags</label>
                    <input
                      type="text"
                      className="form-control"
                      id="tags"
                      name="tags"
                      value={formatTags(mediaData.tags)}
                      onChange={handleTagsChange}
                      placeholder="tag1, tag2, tag3"
                    />
                    <div className="form-text">
                      Comma-separated tags for searching
                    </div>
                  </div>

                  {/* Submit/Cancel Buttons */}
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h6>Media Information</h6>
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Alt Text</h6>
                    <p>{media.alt || 'No alt text provided'}</p>
                  </div>

                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Category</h6>
                    <p>
                      {media.category ? (
                        <span className="badge bg-primary">
                          {media.category}
                        </span>
                      ) : (
                        'Uncategorized'
                      )}
                    </p>
                  </div>

                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Tags</h6>
                    <div>
                      {media.tags && media.tags.length > 0 ? (
                        media.tags.map((tag, index) => (
                          <span key={index} className="badge bg-secondary me-1">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">No tags</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="text-muted mb-1">URL</h6>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={media.url}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        type="button"
                        onClick={() => navigator.clipboard.writeText(media.url)}
                        title="Copy to clipboard"
                      >
                        <i className="bi bi-clipboard"></i>
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setEditMode(true)}
                    >
                      Edit Details
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