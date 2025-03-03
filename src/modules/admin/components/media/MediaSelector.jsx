import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MediaGrid } from './MediaGrid';
import { MediaFilters } from './MediaFilters';
import { getMediaItems } from '../../services/mediaService';

/**
 * MediaSelector - Modal component for selecting media from the library
 *
 * Provides an interface to browse and select existing media files
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Handler for modal close
 * @param {Function} props.onSelect - Handler for media selection
 * @returns {JSX.Element|null}
 *
 * @example
 * <MediaSelector
 *   isOpen={showSelector}
 *   onClose={handleCloseSelector}
 *   onSelect={handleSelectMedia}
 * />
 */
export const MediaSelector = ({ isOpen, onClose, onSelect }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: null,
    searchTerm: '',
  });
  const [categories, setCategories] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);

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

  // Load media items and extract categories
  useEffect(() => {
    if (!isOpen) return;

    const loadMedia = async () => {
      setLoading(true);
      setError(null);

      try {
        const { ok, data, error } = await getMediaItems(filters);

        if (!ok) {
          throw new Error(error || "Failed to load media files");
        }

        setMediaItems(data);

        // Extract unique categories
        const uniqueCategories = [...new Set(
          data
            .map(item => item.category)
            .filter(Boolean)
        )];

        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error loading media for selector:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [isOpen, filters]);

  // Don't render if modal is closed
  if (!isOpen) return null;

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
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
        onClick={e => e.stopPropagation()}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
        }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <h5 className="modal-title">Select Media</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Error message if applicable */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          {/* Filters */}
          <MediaFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
          />

          {/* Media Grid */}
          <MediaGrid
            items={mediaItems}
            loading={loading}
            onSelectItem={(item) => {
              onSelect(item);
              onClose();
            }}
          />
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};