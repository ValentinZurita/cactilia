import { useState, useCallback, useEffect } from 'react';
import { getMediaItems, uploadMedia, updateMediaItem, deleteMediaItem } from '../services/mediaService';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice';

/**
 * Custom hook for managing media library
 * Provides state and methods for retrieving, uploading, updating, and deleting media
 *
 * @param {Object} initialFilters - Initial filter options
 * @returns {Object} - Media library state and methods
 *
 * @example
 * const {
 *   mediaItems, loading, error, filters,
 *   selectedItem, setSelectedItem,
 *   loadMediaItems, handleUpload, handleUpdate, handleDelete,
 *   setFilters
 * } = useMediaLibrary({ category: 'product' });
 */
export const useMediaLibrary = (initialFilters = {}) => {
  // State for media items and UI state
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  // Redux dispatch for global messages
  const dispatch = useDispatch();

  /**
   * Load media items with current filters
   * @returns {Promise<void>}
   */
  const loadMediaItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { ok, data, error } = await getMediaItems(filters);

      if (!ok) {
        throw new Error(error || "Failed to load media items");
      }

      setMediaItems(data);
    } catch (err) {
      console.error("Error loading media:", err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error loading media: ${err.message}`
      }));
    } finally {
      setLoading(false);
    }
  }, [filters, dispatch]);

  // Load media on mount and when filters change
  useEffect(() => {
    loadMediaItems();
  }, [loadMediaItems]);

  /**
   * Upload new media file with metadata
   * @param {File} file - The file to upload
   * @param {Object} metadata - Additional metadata (alt, category, tags)
   * @returns {Promise<Object>} - Upload result
   */
  const handleUpload = useCallback(async (file, metadata) => {
    setLoading(true);

    try {
      // Validate file
      if (!file) {
        throw new Error("No file selected for upload");
      }

      // Process file upload
      const result = await uploadMedia(file, metadata);

      if (!result.ok) {
        throw new Error(result.error || "Failed to upload media");
      }

      // Refresh the media items list
      await loadMediaItems();

      // Show success message
      dispatch(addMessage({
        type: 'success',
        text: 'Media uploaded successfully'
      }));

      return result;
    } catch (err) {
      console.error("Error uploading media:", err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error uploading media: ${err.message}`
      }));
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadMediaItems, dispatch]);

  /**
   * Update media metadata
   * @param {string} mediaId - The ID of the media to update
   * @param {Object} updatedData - Updated metadata
   * @returns {Promise<Object>} - Update result
   */
  const handleUpdate = useCallback(async (mediaId, updatedData) => {
    setLoading(true);

    try {
      // Validate input
      if (!mediaId) {
        throw new Error("Media ID is required for updating");
      }

      // Process update
      const result = await updateMediaItem(mediaId, updatedData);

      if (!result.ok) {
        throw new Error(result.error || "Failed to update media");
      }

      // Refresh the media items list
      await loadMediaItems();

      // Update selected item if it's the one being edited
      if (selectedItem && selectedItem.id === mediaId) {
        const updatedItem = { ...selectedItem, ...updatedData };
        setSelectedItem(updatedItem);
      }

      // Show success message
      dispatch(addMessage({
        type: 'success',
        text: 'Media updated successfully'
      }));

      return result;
    } catch (err) {
      console.error("Error updating media:", err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error updating media: ${err.message}`
      }));
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadMediaItems, selectedItem, dispatch]);

  /**
   * Delete media item
   * @param {string} mediaId - The ID of the media to delete
   * @param {string} url - The URL of the media (for storage deletion)
   * @returns {Promise<Object>} - Deletion result
   */
  const handleDelete = useCallback(async (mediaId, url) => {
    // Ask for confirmation
    if (!window.confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
      return { ok: false, cancelled: true };
    }

    setLoading(true);

    try {
      // Validate input
      if (!mediaId) {
        throw new Error("Media ID is required for deletion");
      }

      // Process deletion
      const result = await deleteMediaItem(mediaId, url);

      if (!result.ok) {
        throw new Error(result.error || "Failed to delete media");
      }

      // Refresh the media items list
      await loadMediaItems();

      // Clear selected item if it was deleted
      if (selectedItem && selectedItem.id === mediaId) {
        setSelectedItem(null);
      }

      // Show success message
      dispatch(addMessage({
        type: 'success',
        text: 'Media deleted successfully'
      }));

      return result;
    } catch (err) {
      console.error("Error deleting media:", err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error deleting media: ${err.message}`
      }));
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadMediaItems, selectedItem, dispatch]);

  /**
   * Update filters and reload media
   * @param {Object} newFilters - New filter values to apply
   */
  const setFilterAndLoad = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // loadMediaItems will be called automatically via the effect
  }, []);

  // Return all the state and methods
  return {
    mediaItems,
    loading,
    error,
    filters,
    selectedItem,
    setSelectedItem,
    loadMediaItems,
    handleUpload,
    handleUpdate,
    handleDelete,
    setFilters: setFilterAndLoad
  };
};