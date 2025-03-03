import { MediaItem } from './MediaItem';

/**
 * MediaGrid - Component for displaying a collection of media items in a grid layout
 *
 * Renders a responsive grid of media items with support for loading states
 * and empty state messaging
 *
 * @param {Object} props - Component props
 * @param {Array} props.items - Media items to display
 * @param {Function} props.onSelectItem - Handler for item selection
 * @param {Function} props.onDeleteItem - Handler for item deletion
 * @param {boolean} props.loading - Loading state indicator
 * @returns {JSX.Element}
 *
 * @example
 * <MediaGrid
 *   items={mediaItems}
 *   loading={loading}
 *   onSelectItem={handleSelectItem}
 *   onDeleteItem={handleDeleteItem}
 * />
 */
export const MediaGrid = ({ items = [], onSelectItem, onDeleteItem, loading = false }) => {
  // Show loading skeleton when items are being fetched
  if (loading) {
    return (
      <div className="row g-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="col-6 col-md-4 col-lg-3">
            <div className="media-item-card p-2 h-100">
              <div className="placeholder-glow mb-2" style={{ height: '150px' }}>
                <div
                  className="placeholder w-100 h-100"
                  style={{ borderRadius: '6px' }}
                />
              </div>
              <div className="p-2">
                <p className="placeholder-glow mb-1">
                  <span className="placeholder col-7"></span>
                </p>
                <p className="placeholder-glow mb-0">
                  <span className="placeholder col-4"></span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show empty state message when no items are available
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <i className="bi bi-images"></i>
        <h5>No media files found</h5>
        <p className="text-muted">
          Upload new files or adjust your filters to see more results.
        </p>
      </div>
    );
  }

  // Render the grid of media items
  return (
    <div className="row g-3">
      {items.map((item) => (
        <div key={item.id} className="col-6 col-md-4 col-lg-3">
          <MediaItem
            item={item}
            onSelect={onSelectItem}
            onDelete={onDeleteItem}
          />
        </div>
      ))}
    </div>
  );
};