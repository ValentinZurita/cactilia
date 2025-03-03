import { useState, useCallback, useEffect } from 'react';
import { getMediaItems, uploadMedia, updateMediaItem, deleteMediaItem } from '../services/mediaService';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice';

/**
 * Custom hook for managing media library
 *
 * @param {Object} initialFilters - Initial filter options
 * @returns {Object} - Media library state and methods
 */
export const useMediaLibrary = (initialFilters = {}) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const dispatch = useDispatch();

  // Load media items with current filters
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

  // Upload new media
  const handleUpload = useCallback(async (file, metadata) => {
    setLoading(true);

    try {
      const result = await uploadMedia(file, metadata);

      if (!result.ok) {
        throw new Error(result.error || "Failed to upload media");
      }

      // Refresh the media items list
      await loadMediaItems();

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

  // Update media metadata
  const handleUpdate = useCallback(async (mediaId, updatedData) => {
    setLoading(true);

    try {
      const result = await updateMediaItem(mediaId, updatedData);

      if (!result.ok) {
        throw new Error(result.error || "Failed to update media");
      }

      // Refresh the media items list
      await loadMediaItems();

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
  }, [loadMediaItems, dispatch]);

  // Delete media
  const handleDelete = useCallback(async (mediaId, url) => {
    if (!window.confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
      return { ok: false, cancelled: true };
    }

    setLoading(true);

    try {
      const result = await deleteMediaItem(mediaId, url);

      if (!result.ok) {
        throw new Error(result.error || "Failed to delete media");
      }

      // Refresh the media items list
      await loadMediaItems();

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
  }, [loadMediaItems, dispatch]);

  // Update filters and reload media
  const setFilterAndLoad = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // loadMediaItems will be called automatically via the effect
  }, []);

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