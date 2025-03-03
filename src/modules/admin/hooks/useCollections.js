import { useState, useCallback, useEffect } from 'react';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getMediaByCollection
} from '../services/collectionsService';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice';

/**
 * Hook personalizado para gestionar colecciones de media
 *
 * @param {Object} options - Opciones de configuración
 * @param {string} options.initialSelectedId - ID de colección inicialmente seleccionada
 * @returns {Object} - Estado y métodos para gestionar colecciones
 */
export const useCollections = ({ initialSelectedId = null } = {}) => {

  // Estado para colecciones y operaciones
  const [collections, setCollections] = useState([]);
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Conteo de archivos por colección
  const [mediaCounts, setMediaCounts] = useState({});

  // Redux dispatch
  const dispatch = useDispatch();

  /**
   * Carga la lista de colecciones
   */
  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getCollections();

      if (!result.ok) {
        throw new Error(result.error || 'Error cargando colecciones');
      }

      setCollections(result.data);

      // También cargar conteo de archivos
      loadMediaCounts(result.data);

    } catch (err) {
      console.error('Error cargando colecciones:', err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error cargando colecciones: ${err.message}`
      }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  /**
   * Carga el conteo de archivos por colección
   * @param {Array} collectionsArray - Lista de colecciones para contar
   */
  const loadMediaCounts = async (collectionsArray) => {
    const counts = {};

    try {
      const collectionsToProcess = collectionsArray || collections;

      for (const collection of collectionsToProcess) {
        try {
          const result = await getMediaByCollection(collection.id);
          if (result.ok) {
            counts[collection.id] = result.data.length;
          }
        } catch (err) {
          console.error(`Error obteniendo media para colección ${collection.id}:`, err);
        }
      }

      setMediaCounts(counts);

    } catch (err) {
      console.error('Error cargando conteo de archivos:', err);
    }
  };

  /**
   * Crea una nueva colección
   * @param {Object} collectionData - Datos de la colección
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const createNewCollection = useCallback(async (collectionData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await createCollection(collectionData);

      if (!result.ok) {
        throw new Error(result.error || 'Error creando colección');
      }

      dispatch(addMessage({
        type: 'success',
        text: 'Colección creada con éxito'
      }));

      // Recargar colecciones
      await loadCollections();

      return { ok: true, id: result.id };

    } catch (err) {
      console.error('Error creando colección:', err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error creando colección: ${err.message}`
      }));

      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [dispatch, loadCollections]);

  /**
   * Actualiza una colección existente
   * @param {string} collectionId - ID de la colección a actualizar
   * @param {Object} updatedData - Nuevos datos para la colección
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const updateExistingCollection = useCallback(async (collectionId, updatedData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await updateCollection(collectionId, updatedData);

      if (!result.ok) {
        throw new Error(result.error || 'Error actualizando colección');
      }

      dispatch(addMessage({
        type: 'success',
        text: 'Colección actualizada con éxito'
      }));

      // Recargar colecciones
      await loadCollections();

      return { ok: true };

    } catch (err) {
      console.error('Error actualizando colección:', err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error actualizando colección: ${err.message}`
      }));

      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [dispatch, loadCollections]);

  /**
   * Elimina una colección
   * @param {string} collectionId - ID de la colección a eliminar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const deleteExistingCollection = useCallback(async (collectionId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await deleteCollection(collectionId);

      if (!result.ok) {
        throw new Error(result.error || 'Error eliminando colección');
      }

      dispatch(addMessage({
        type: 'success',
        text: 'Colección eliminada con éxito'
      }));

      // Si la colección eliminada era la seleccionada, resetear selección
      if (selectedId === collectionId) {
        setSelectedId(null);
      }

      // Recargar colecciones
      await loadCollections();

      return { ok: true };

    } catch (err) {
      console.error('Error eliminando colección:', err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: `Error eliminando colección: ${err.message}`
      }));

      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [dispatch, loadCollections, selectedId]);

  /**
   * Selecciona una colección
   * @param {string} collectionId - ID de la colección a seleccionar
   */
  const selectCollection = useCallback((collectionId) => {
    setSelectedId(collectionId);
  }, []);

  /**
   * Obtiene una colección por su ID
   * @param {string} collectionId - ID de la colección
   * @returns {Object|null} - Datos de la colección o null si no se encuentra
   */
  const getCollectionById = useCallback((collectionId) => {
    return collections.find(c => c.id === collectionId) || null;
  }, [collections]);

  // Cargar colecciones al montar el componente
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // Retornar estado y métodos
  return {
    collections,
    selectedId,
    loading,
    error,
    mediaCounts,
    selectCollection,
    createCollection: createNewCollection,
    updateCollection: updateExistingCollection,
    deleteCollection: deleteExistingCollection,
    getCollectionById,
    loadCollections
  };
};