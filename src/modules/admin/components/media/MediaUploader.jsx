import { useState, useRef } from 'react';

/**
 * MediaUploader - Component for uploading media files with drag and drop
 *
 * Provides an intuitive interface for file upload with preview and metadata
 *
 * @param {Object} props - Component props
 * @param {Function} props.onUpload - Handler for file upload
 * @param {boolean} props.loading - Loading state indicator
 * @returns {JSX.Element}
 *
 * @example
 * <MediaUploader onUpload={handleUpload} loading={isUploading} />
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
   * Handle drag events
   * @param {Event} e - Drag event
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
   * Handle drop event
   * @param {Event} e - Drop event
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
   * Handle file selection from input
   * @param {Event} e - Change event
   */
  const handleChange = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  /**
   * Process selected file
   * @param {File} file - The selected file
   */
  const handleFiles = (file) => {
    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Only image files are allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Set the selected file
    setSelectedFile(file);

    // Generate alt text from filename (removing extension)
    setMetadata(prev => ({
      ...prev,
      alt: file.name.replace(/\.[^/.]+$/, '') // Remove extension
    }));
  };

  /**
   * Handle metadata field changes
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle upload button click
   */
  const handleUploadClick = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    // Convert tags string to array
    const tagsArray = metadata.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    // Call the onUpload function with file and metadata
    await onUpload(selectedFile, {
      ...metadata,
      tags: tagsArray
    });

    // Reset form after upload
    setSelectedFile(null);
    setMetadata({
      alt: '',
      category: '',
      tags: ''
    });
  };

  /**
   * Trigger file input click
   */
  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="media-uploader">
      {!selectedFile ? (
        // Upload area for drag & drop or file selection
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
            <h5 className="mt-3">Drag and drop an image here</h5>
            <p className="text-muted">or</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onButtonClick}
            >
              Browse Files
            </button>
            <p className="mt-3 text-muted small">
              Supported formats: JPG, PNG, GIF, SVG, WebP (Max. 5MB)
            </p>
          </div>
        </div>
      ) : (
        // Form for metadata and upload confirmation
        <div className="selected-file-form">
          <div className="row">
            <div className="col-md-4 mb-3">
              {/* File preview */}
              <div className="selected-file-preview">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
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
              {/* Metadata form */}
              <form>
                {/* Alt text field */}
                <div className="mb-3">
                  <label htmlFor="alt" className="form-label">Alt Text</label>
                  <input
                    type="text"
                    className="form-control"
                    id="alt"
                    name="alt"
                    value={metadata.alt}
                    onChange={handleInputChange}
                    placeholder="Description for accessibility"
                  />
                  <div className="form-text">
                    Describes the image for screen readers
                  </div>
                </div>

                {/* Category field */}
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={metadata.category}
                    onChange={handleInputChange}
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

                {/* Tags field */}
                <div className="mb-3">
                  <label htmlFor="tags" className="form-label">Tags</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tags"
                    name="tags"
                    value={metadata.tags}
                    onChange={handleInputChange}
                    placeholder="tag1, tag2, tag3"
                  />
                  <div className="form-text">
                    Comma-separated tags for search
                  </div>
                </div>

                {/* Action buttons */}
                <div className="d-flex">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    onClick={() => setSelectedFile(null)}
                    disabled={loading}
                  >
                    Cancel
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
                        Uploading...
                      </>
                    ) : (
                      'Upload Image'
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