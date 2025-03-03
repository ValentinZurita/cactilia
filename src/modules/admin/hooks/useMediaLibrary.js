import { useState, useCallback, useEffect } from 'react';
import { getMediaItems, uploadMedia, updateMediaItem, deleteMediaItem } from '../services/mediaService';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice';

/**
 * Custom hook para gestionar la biblioteca multimedia
 * Proporciona estado y métodos para recuperar, subir, actualizar y eliminar archivos
 *
 * @param {Object} initialFilters - Opciones iniciales de filtrado
 * @returns {Object} - Estado y métodos de la biblioteca multimedia
 *
 * @example
 * const {
 *   mediaItems, loading, error, filters,
 *   selectedItem, setSelectedItem,
 *   loadMediaItems, handleUpload, handleUpdate, handleDelete,
 *   setFilters
 * } = useMediaLibrary({ collectionId: 'coleccion1' });
 */
export const useMediaLibrary = (initialFilters = {}) => {
  // Estado para elementos multimedia y UI
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  // Redux dispatch para mensajes globales
  const dispatch = useDispatch();

  /**
   * Carga elementos multimedia con los filtros actuales
   * @returns {Promise<void>}
   */
  const loadMediaItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { ok, data, error } = await getMediaItems(filters);

      if (!ok) {
        throw new Error(error || "Error al cargar elementos multimedia");
      }

      setMediaItems(data);
    } catch (err) {
      console.error("Error cargando multimedia:", err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error cargando multimedia: ${err.message}`
      }));
    } finally {
      setLoading(false);
    }
  }, [filters, dispatch]);

  // Cargar multimedia al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadMediaItems();
  }, [loadMediaItems]);

  /**
   * Sube un nuevo archivo multimedia con metadatos
   * @param {File} file - El archivo a subir
   * @param {Object} metadata - Metadatos adicionales (name, alt, collectionId, tags)
   * @returns {Promise<Object>} - Resultado de la subida
   */
  const handleUpload = useCallback(async (file, metadata) => {
    setLoading(true);

    try {
      // Validar archivo
      if (!file) {
        throw new Error("No se seleccionó ningún archivo para subir");
      }

      // Procesar subida de archivo
      const result = await uploadMedia(file, metadata);

      if (!result.ok) {
        throw new Error(result.error || "Error al subir archivo");
      }

      // Actualizar lista de elementos multimedia
      await loadMediaItems();

      // Mostrar mensaje de éxito
      dispatch(addMessage({
        type: 'success',
        text: 'Archivo subido con éxito'
      }));

      return result;
    } catch (err) {
      console.error("Error subiendo archivo:", err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error subiendo archivo: ${err.message}`
      }));
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadMediaItems, dispatch]);

  /**
   * Actualiza los metadatos de un elemento multimedia
   * @param {string} mediaId - ID del elemento a actualizar
   * @param {Object} updatedData - Metadatos actualizados
   * @returns {Promise<Object>} - Resultado de la actualización
   */
  const handleUpdate = useCallback(async (mediaId, updatedData) => {
    setLoading(true);

    try {
      // Validar entrada
      if (!mediaId) {
        throw new Error("Se requiere ID del medio para actualizar");
      }

      // Procesar actualización
      const result = await updateMediaItem(mediaId, updatedData);

      if (!result.ok) {
        throw new Error(result.error || "Error al actualizar archivo");
      }

      // Actualizar lista de elementos multimedia
      await loadMediaItems();

      // Actualizar elemento seleccionado si es el que se está editando
      if (selectedItem && selectedItem.id === mediaId) {
        const updatedItem = { ...selectedItem, ...updatedData };
        setSelectedItem(updatedItem);
      }

      // Mostrar mensaje de éxito
      dispatch(addMessage({
        type: 'success',
        text: 'Archivo actualizado con éxito'
      }));

      return result;
    } catch (err) {
      console.error("Error actualizando archivo:", err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error actualizando archivo: ${err.message}`
      }));
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadMediaItems, selectedItem, dispatch]);

  /**
   * Elimina un elemento multimedia
   * @param {string} mediaId - ID del elemento a eliminar
   * @param {string} url - URL del archivo en Storage
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  const handleDelete = useCallback(async (mediaId, url) => {
    // Pedir confirmación
    if (!window.confirm('¿Estás seguro de eliminar este archivo? Esta acción no se puede deshacer.')) {
      return { ok: false, cancelled: true };
    }

    setLoading(true);

    try {
      // Validar entrada
      if (!mediaId) {
        throw new Error("Se requiere ID del medio para eliminar");
      }

      // Procesar eliminación
      const result = await deleteMediaItem(mediaId, url);

      if (!result.ok) {
        throw new Error(result.error || "Error al eliminar archivo");
      }

      // Actualizar lista de elementos multimedia
      await loadMediaItems();

      // Limpiar elemento seleccionado si fue eliminado
      if (selectedItem && selectedItem.id === mediaId) {
        setSelectedItem(null);
      }

      // Mostrar mensaje de éxito
      dispatch(addMessage({
        type: 'success',
        text: 'Archivo eliminado con éxito'
      }));

      return result;
    } catch (err) {
      console.error("Error eliminando archivo:", err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error eliminando archivo: ${err.message}`
      }));
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadMediaItems, selectedItem, dispatch]);

  /**
   * Actualiza filtros y recarga medios
   * @param {Object} newFilters - Nuevos valores de filtros
   */
  const setFilterAndLoad = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // loadMediaItems se llamará automáticamente a través del efecto
  }, []);

  // Retorna todos los estados y métodos
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