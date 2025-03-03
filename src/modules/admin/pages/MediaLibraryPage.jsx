import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { MediaGrid, MediaFilters, MediaDetailsModal } from '../components/media';
import '../styles/mediaLibrary.css';

/**
 * MediaLibraryPage - Main component for the media management page
 *
 * This page provides an interface to browse, filter, and manage media assets
 * with a clean, minimalist design
 *
 * @returns {JSX.Element}
 */
export const MediaLibraryPage = () => {
  // Navigation hook
  const navigate = useNavigate();

  // Available categories for filter dropdown
  const [categories, setCategories] = useState([
    'hero', 'product', 'background', 'banner', 'icon', 'other'
  ]);

  // Controls the details modal visibility
  const [showDetails, setShowDetails] = useState(false);

  // Get data and methods from the media library hook
  const {
    mediaItems,
    loading,
    error,
    filters,
    selectedItem,
    setSelectedItem,
    handleDelete,
    handleUpdate,
    setFilters
  } = useMediaLibrary();

  // Extract unique categories from loaded media items
  useEffect(() => {
    if (mediaItems.length > 0) {
      const uniqueCategories = [...new Set(
        mediaItems
          .map(item => item.category)
          .filter(Boolean)
      )];

      if (uniqueCategories.length > 0) {
        setCategories(prevCategories => {
          // Combine default categories with those found in media items
          const allCategories = [...new Set([...prevCategories, ...uniqueCategories])];
          return allCategories;
        });
      }
    }
  }, [mediaItems]);

  // Handler for selecting an item to view/edit details
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  // Handler for closing the details modal
  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  return (
    <div className="media-library-container">
      {/* Header with title and upload button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Media Library</h2>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/admin/media/upload')}
        >
          <i className="bi bi-upload me-2"></i>
          Upload New File
        </button>
      </div>

      {/* Error message if applicable */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Filters component */}
      <MediaFilters
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
      />

      {/* Media grid with items */}
      <MediaGrid
        items={mediaItems}
        loading={loading}
        onSelectItem={handleSelectItem}
        onDeleteItem={handleDelete}
      />

      {/* Details modal (shown when an item is selected) */}
      <MediaDetailsModal
        media={selectedItem}
        isOpen={showDetails}
        onClose={handleCloseDetails}
        onUpdate={handleUpdate}
      />
    </div>
  );
};