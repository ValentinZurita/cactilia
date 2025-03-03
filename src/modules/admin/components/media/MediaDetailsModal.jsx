import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * MediaDetailsModal - Modal for viewing and editing media details
 *
 * Displays a modal with media preview and editable metadata fields
 *
 * @param {Object} props - Component props
 * @param {Object} props.media - Media item to display
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Handler for modal close
 * @param {Function} props.onUpdate - Handler for metadata updates
 * @returns {JSX.Element|null}
 *
 * @example
 * <MediaDetailsModal
 *   media={selectedItem}
 *   isOpen={showDetails}
 *   onClose={handleCloseDetails}
 *   onUpdate={handleUpdate}
 * />
 */
export const MediaDetailsModal = ({ media, isOpen, onClose, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [mediaData, setMediaData] = useState({
    alt: '',
    category: '',
    tags: []
  });
  const [isVisible, setIsVisible] = useState(false);

  // Initialize form data when media item changes
  useEffect(() => {
    if (media) {
      setMediaData({
        alt: media.alt || '',
        category: media.category || '',
        tags: media.tags || []
      });
    }
  }, [media]);

  // Handle modal animation
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

  // Don't render if modal is closed or no media selected
  if (!isOpen || !media) return null;

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMediaData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle tags field changes (comma-separated)
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(media.id, mediaData);
    setEditMode(false);
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
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

  // Stop propagation for modal content
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return ReactDOM.createPortal(
    <div
      className={`modal-backdrop ${isVisible ? 'visible' : ''}`}
      onClick={onClose}
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className="modal-content"
        onClick={stopPropagation}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
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
        <div className="modal-body">
          <div className="row">
            {/* Media Preview */}
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="media-preview-modal">
                <img
                  src={media.url}
                  alt={media.alt || media.filename}
                  className="img-fluid rounded"
                />
              </div>

              {/* File Details */}
              <div className="mt-3">
                <h6 className="fw-bold mb-2">File Details</h6>
                <table className="table table-sm metadata-table">
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

            {/* Edit Form or Details View */}
            <div className="col-md-6">
              {editMode ? (
                <form onSubmit={handleSubmit}>
                  {/* Alt Text */}
                  <div className="mb-3">
                    <label htmlFor="alt" className="form-label">Alt Text</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="alt"
                      name="alt"
                      value={mediaData.alt}
                      onChange={handleChange}
                      placeholder="Description for accessibility"
                    />
                    <div className="form-text">
                      Describes the image for screen readers
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                      className="form-select form-select-sm"
                      id="category"
                      name="category"
                      value={mediaData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select category</option>
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
                      className="form-control form-control-sm"
                      id="tags"
                      name="tags"
                      value={formatTags(mediaData.tags)}
                      onChange={handleTagsChange}
                      placeholder="tag1, tag2, tag3"
                    />
                    <div className="form-text">
                      Comma-separated tags for search
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm me-2"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h6 className="fw-bold mb-2">Media Information</h6>
                  <div className="mb-3">
                    <p className="fw-semibold mb-1 small text-muted">Alt Text</p>
                    <p>{media.alt || 'No alt text provided'}</p>
                  </div>

                  <div className="mb-3">
                    <p className="fw-semibold mb-1 small text-muted">Category</p>
                    <p>
                      {media.category ? (
                        <span className="badge bg-primary">
                          {media.category}
                        </span>
                      ) : (
                        'No category'
                      )}
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="fw-semibold mb-1 small text-muted">Tags</p>
                    <div>
                      {media.tags && media.tags.length > 0 ? (
                        media.tags.map((tag, index) => (
                          <span key={index} className="badge bg-secondary me-1 mb-1">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">No tags</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="fw-semibold mb-1 small text-muted">URL</p>
                    <div className="input-group input-group-sm">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={media.url}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-secondary"
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
                      className="btn btn-primary btn-sm"
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