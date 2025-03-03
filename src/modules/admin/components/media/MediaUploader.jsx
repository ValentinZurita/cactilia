import React, { useState, useRef } from 'react';

/**
 * MediaUploader - Component for uploading media files with drag and drop support
 *
 * @param {Object} props
 * @param {Function} props.onUpload - Handler for file upload
 * @param {boolean} props.loading - Loading state during upload
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

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // At least one file has been dropped
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection from input
  const handleChange = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  // Process the selected file
  const handleFiles = (file) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Only image files are supported');
      return;
    }

    // Set the selected file and generate default alt text
    setSelectedFile(file);
    setMetadata(prev => ({
      ...prev,
      alt: file.name.replace(/\.[^/.]+$/, '') // Remove file extension for alt text
    }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle upload button click
  const handleUploadClick = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    // Parse tags into array
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

  // Trigger file input click
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

          <div className="upload-prompt text-center p-5">
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
              Supported formats: JPG, PNG, GIF, SVG, WebP (Max 5MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="selected-file-form">
          <div className="row">
            <div className="col-md-4 mb-3">
              {/* File Preview */}
              <div className="selected-file-preview">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Selected file preview"
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
              {/* Metadata Form */}
              <form>
                {/* Alt Text */}
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
                    value={metadata.category}
                    onChange={handleInputChange}
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
                    value={metadata.tags}
                    onChange={handleInputChange}
                    placeholder="tag1, tag2, tag3"
                  />
                  <div className="form-text">
                    Comma-separated tags for searching
                  </div>
                </div>

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