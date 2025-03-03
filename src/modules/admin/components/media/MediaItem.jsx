/**
 * MediaItem - Component for displaying a single media item in the grid
 *
 * @param {Object} props
 * @param {Object} props.item - Media item data
 * @param {Function} props.onSelect - Handler for item selection
 * @param {Function} props.onDelete - Handler for item deletion
 * @returns {JSX.Element}
 */
export const MediaItem = ({ item, onSelect, onDelete }) => {
  // Format the file size to a readable string
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Format the date to a readable string
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="media-item-card">
      <div className="media-item-preview">
        {/* Image Preview */}
        <img
          src={item.url}
          alt={item.alt || item.filename}
          className="img-fluid"
          onClick={() => onSelect(item)}
        />

        {/* Hover overlay with actions */}
        <div className="media-item-actions">
          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={() => onSelect(item)}
            title="View details"
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={() => onDelete(item.id, item.url)}
            title="Delete media"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>

      {/* Media Item Details */}
      <div className="media-item-info">
        <h6 className="media-item-title text-truncate" title={item.filename}>
          {item.filename}
        </h6>
        <div className="d-flex justify-content-between align-items-center mt-1">
          <span className="badge bg-light text-dark">
            {formatFileSize(item.size)}
          </span>
          <small className="text-muted">
            {formatDate(item.uploadedAt)}
          </small>
        </div>
        {item.category && (
          <div className="mt-1">
            <span className="badge bg-primary">
              {item.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};