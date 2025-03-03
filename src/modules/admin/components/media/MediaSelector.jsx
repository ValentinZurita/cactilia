import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MediaGrid } from './MediaGrid';
import { MediaFilters } from './MediaFilters';
import { getMediaItems } from '../../services/mediaService';

/**
 * MediaSelector - Modal component for selecting media from the library
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Handler for closing the modal
 * @param {Function} props.onSelect - Handler for selecting media
 * @returns {JSX.Element|null}
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

  // Load media items and extract categories
  useEffect(() => {
    if (!isOpen) return;

    const loadMedia = async () => {
      setLoading(true);

      try {
        const { ok, data, error } = await getMediaItems(filters);

        if (!ok) {
          throw new Error(error || "Failed to load media items");
        }

        setMediaItems(data);

        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error loading media for selector:", err);
        alert('Error loading media. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [isOpen, filters]);

  // Filter media items by search term
  const filteredItems = mediaItems.filter(item => {
    if (!filters.searchTerm) return true;

    const searchLower = filters.searchTerm.toLowerCase();
    return (
      item.filename.toLowerCase().includes(searchLower) ||
      (item.alt && item.alt.toLowerCase().includes(searchLower)) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  });

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // If modal is not open, return null
  if (!isOpen) return null;

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
          maxWidth: '1200px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
          transition: 'transform 0.3s ease'
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
        <div className="modal-body" style={{ overflow: 'auto' }}>
          {/* Filters */}
          <MediaFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
          />

          {/* Media Grid */}
          <MediaGrid
            items={filteredItems}
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