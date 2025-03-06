import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ContentService, BLOCK_TYPES } from '../services/contentService';
import { addMessage } from '../../../store/messages/messageSlice';
import { CacheService } from '../../../utils/cacheService';

/**
 * Hook personalizado para gestionar el contenido de páginas
 *
 * @param {string} pageId - Identificador de la página (ej: "home", "about")
 * @returns {Object} - Métodos y estado para gestionar el contenido
 */
export const usePageContent = (pageId) => {
  // Estado para los datos de la página
  const [pageData, setPageData] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  // Redux para mensajes globales
  const dispatch = useDispatch();

  /**
   * Carga los datos de la página
   */
  const loadPageContent = useCallback(async () => {
    if (!pageId) {
      setError("Se requiere un ID de página");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Intentar obtener de caché primero
      const cacheKey = `page_${pageId}`;
      let result = CacheService.get(cacheKey);

      // Si no está en caché, obtener de Firebase
      if (!result) {
        result = await ContentService.getPageContent(pageId);

        // Si la operación fue exitosa, guardar en caché
        if (result.ok) {
          CacheService.set(cacheKey, result, 5); // Caché de 5 minutos
        }
      }

      if (result.ok) {
        setPageData(result.data);
        setBlocks(result.data.blocks || []);
      } else {
        throw new Error(result.error || "Error al cargar el contenido");
      }
    } catch (err) {
      console.error(`Error cargando contenido de página [${pageId}]:`, err);
      setError(err.message);

      dispatch(addMessage({
        type: 'error',
        text: `Error cargando contenido: ${err.message}`
      }));
    } finally {
      setLoading(false);
    }
  }, [pageId, dispatch]);

  /**
   * Guarda los cambios en la página completa
   */
  const savePageContent = useCallback(async () => {
    if (!pageId || !pageData) return;

    setLoading(true);

    try {
      // Actualizar el pageData con los bloques actuales
      const updatedPageData = {
        ...pageData,
        blocks
      };

      const result = await ContentService.savePageContent(pageId, updatedPageData);

      if (result.ok) {
        dispatch(addMessage({
          type: 'success',
          text: 'Contenido guardado correctamente'
        }));

        // Invalidar caché
        CacheService.remove(`page_${pageId}`);

        // Recargar contenido
        await loadPageContent();
      } else {
        throw new Error(result.error || "Error al guardar contenido");
      }
    } catch (err) {
      console.error(`Error guardando contenido de página [${pageId}]:`, err);
      setError(err.message);

      dispatch(addMessage({
        type: 'error',
        text: `Error guardando contenido: ${err.message}`
      }));
    } finally {
      setLoading(false);
    }
  }, [pageId, pageData, blocks, dispatch, loadPageContent]);

  /**
   * Añade un nuevo bloque al final de la página
   *
   * @param {string} blockType - Tipo de bloque (de BLOCK_TYPES)
   * @param {Object} initialData - Datos iniciales del bloque
   */
  const addBlock = useCallback(async (blockType, initialData = {}) => {
    try {
      // Crear un ID único para el bloque
      const blockId = `block_${Date.now()}`;

      // Crear el nuevo bloque con datos básicos
      const newBlock = {
        id: blockId,
        type: blockType,
        ...initialData,
        createdAt: new Date().toISOString()
      };

      // Añadir el bloque a la lista
      const updatedBlocks = [...blocks, newBlock];
      setBlocks(updatedBlocks);

      // Seleccionar el nuevo bloque para edición
      setSelectedBlockId(blockId);

      // Actualizar en Firebase
      const result = await ContentService.updateBlock(pageId, blockId, newBlock);

      if (result.ok) {
        dispatch(addMessage({
          type: 'success',
          text: 'Bloque añadido correctamente'
        }));

        // Invalidar caché
        CacheService.remove(`page_${pageId}`);
      } else {
        throw new Error(result.error || "Error al añadir bloque");
      }
    } catch (err) {
      console.error(`Error añadiendo bloque a página [${pageId}]:`, err);
      setError(err.message);

      dispatch(addMessage({
        type: 'error',
        text: `Error añadiendo bloque: ${err.message}`
      }));
    }
  }, [pageId, blocks, dispatch]);

  /**
   * Actualiza un bloque existente
   *
   * @param {string} blockId - ID del bloque a actualizar
   * @param {Object} updatedData - Nuevos datos para el bloque
   */
  const updateBlock = useCallback(async (blockId, updatedData) => {
    try {
      // Buscar el bloque en la lista
      const blockIndex = blocks.findIndex(b => b.id === blockId);

      if (blockIndex === -1) {
        throw new Error(`Bloque ${blockId} no encontrado`);
      }

      // Actualizar el bloque en la lista
      const updatedBlocks = [...blocks];
      updatedBlocks[blockIndex] = {
        ...updatedBlocks[blockIndex],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };

      setBlocks(updatedBlocks);

      // Actualizar en Firebase
      const result = await ContentService.updateBlock(pageId, blockId, updatedBlocks[blockIndex]);

      if (result.ok) {
        dispatch(addMessage({
          type: 'success',
          text: 'Bloque actualizado correctamente'
        }));

        // Invalidar caché
        CacheService.remove(`page_${pageId}`);
      } else {
        throw new Error(result.error || "Error al actualizar bloque");
      }
    } catch (err) {
      console.error(`Error actualizando bloque [${blockId}] en página [${pageId}]:`, err);
      setError(err.message);

      dispatch(addMessage({
        type: 'error',
        text: `Error actualizando bloque: ${err.message}`
      }));
    }
  }, [pageId, blocks, dispatch]);

  /**
   * Elimina un bloque
   *
   * @param {string} blockId - ID del bloque a eliminar
   */
  const deleteBlock = useCallback(async (blockId) => {
    try {
      // Confirmar eliminación
      if (!window.confirm("¿Estás seguro de eliminar este bloque?")) {
        return;
      }

      // Filtrar el bloque de la lista
      const updatedBlocks = blocks.filter(b => b.id !== blockId);
      setBlocks(updatedBlocks);

      // Si el bloque eliminado era el seleccionado, limpiar selección
      if (selectedBlockId === blockId) {
        setSelectedBlockId(null);
      }

      // Eliminar en Firebase
      const result = await ContentService.deleteBlock(pageId, blockId);

      if (result.ok) {
        dispatch(addMessage({
          type: 'success',
          text: 'Bloque eliminado correctamente'
        }));

        // Invalidar caché
        CacheService.remove(`page_${pageId}`);
      } else {
        throw new Error(result.error || "Error al eliminar bloque");
      }
    } catch (err) {
      console.error(`Error eliminando bloque [${blockId}] de página [${pageId}]:`, err);
      setError(err.message);

      dispatch(addMessage({
        type: 'error',
        text: `Error eliminando bloque: ${err.message}`
      }));
    }
  }, [pageId, blocks, selectedBlockId, dispatch]);

  /**
   * Reordena los bloques de la página
   *
   * @param {string[]} newOrder - Array de IDs en el nuevo orden
   */
  const reorderBlocks = useCallback(async (newOrder) => {
    try {
      // Crear un mapa para acceder rápidamente a los bloques por ID
      const blocksMap = blocks.reduce((map, block) => {
        map[block.id] = block;
        return map;
      }, {});

      // Crear nuevo array ordenado
      const reorderedBlocks = newOrder
        .filter(id => blocksMap[id]) // Solo incluir IDs válidos
        .map(id => blocksMap[id]);

      // Actualizar estado
      setBlocks(reorderedBlocks);

      // Actualizar en Firebase
      const result = await ContentService.reorderBlocks(pageId, newOrder);

      if (result.ok) {
        dispatch(addMessage({
          type: 'success',
          text: 'Bloques reordenados correctamente'
        }));

        // Invalidar caché
        CacheService.remove(`page_${pageId}`);
      } else {
        throw new Error(result.error || "Error al reordenar bloques");
      }
    } catch (err) {
      console.error(`Error reordenando bloques en página [${pageId}]:`, err);
      setError(err.message);

      dispatch(addMessage({
        type: 'error',
        text: `Error reordenando bloques: ${err.message}`
      }));
    }
  }, [pageId, blocks, dispatch]);

  // Cargar contenido al montar el componente
  useEffect(() => {
    loadPageContent();
  }, [loadPageContent]);

  // Retornar todos los métodos y estados
  return {
    pageData,
    blocks,
    loading,
    error,
    selectedBlockId,
    setSelectedBlockId,
    loadPageContent,
    savePageContent,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks
  };
};