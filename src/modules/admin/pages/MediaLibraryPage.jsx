import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { MediaGrid, MediaFilters, MediaDetailsModal } from '../components/media';
import { useState } from 'react'
import './../styles/mediaLibrary.css';

/**
 * MediaLibraryPage - Main page for browsing and managing media library
 */
export const MediaLibraryPage = () => {
  const [categories, setCategories] = useState(['hero', 'product', 'background', 'banner', 'icon', 'other']);
  const [showDetails, setShowDetails] = useState(false);

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

  // Handle selecting an item to view details
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  // Handle closing the details modal
  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  return (
    <div className="media-library-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Media Library</h2>

        <button
          className="btn btn-primary"
          onClick={() => window.location.href = '/admin/media/upload'}
        >
          <i className="bi bi-upload me-2"></i>
          Upload New Media
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <MediaFilters
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
      />

      <MediaGrid
        items={mediaItems}
        loading={loading}
        onSelectItem={handleSelectItem}
        onDeleteItem={handleDelete}
      />

      <MediaDetailsModal
        media={selectedItem}
        isOpen={showDetails}
        onClose={handleCloseDetails}
        onUpdate={handleUpdate}
      />
    </div>
  );
};