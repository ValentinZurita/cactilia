import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ContentService } from '../services/contentService';
import { addMessage } from '../../../store/messages/messageSlice';
import { CacheService } from '../../../utils/cacheService';
import { createDefaultBlocks } from '../utilis/blockHelpers.js';

/**
 * Hook personalizado para gestionar el contenido de páginas
 * Proporciona funcionalidad para cargar, guardar y manipular bloques de contenido
 *
 * @param {string} pageId - Identificador de la página
 * @returns {Object} - Estado y métodos para gestionar el contenido
 */
export const usePageContent = (pageId) => {
  // Estado para los datos de la página
  const [pageData, setPageData] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [originalBlocks, setOriginalBlocks] = useState(null); // Para comparar y detectar cambios
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  // Redux para mensajes globales
  const dispatch = useDispatch();

  /**
   * Carga los datos de la página desde Firebase
   * Si no hay datos, crea bloques predeterminados
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

      // Actualizar el estado con los datos obtenidos o mostrar error
      if (result.ok) {
        setPageData(result.data);

        // Si no hay bloques o está vacío, crear bloques predeterminados
        let currentBlocks;
        if (!result.data.blocks || result.data.blocks.length === 0) {
          currentBlocks = createDefaultBlocks(pageId);
        } else {
          currentBlocks = result.data.blocks || [];
        }

        setBlocks(currentBlocks);
        setOriginalBlocks(JSON.parse(JSON.stringify(currentBlocks))); // Copia profunda para comparación
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
   * Guarda los cambios del contenido de la página en Firebase
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

      // Guardar en Firebase y obtener el resultado
      const result = await ContentService.savePageContent(pageId, updatedPageData);

      // Mostrar mensajes de error o éxito según el resultado
      if (result.ok) {
        dispatch(addMessage({
          type: 'success',
          text: 'Contenido guardado correctamente'
        }));

        // Actualizar original blocks para reflejar los cambios guardados
        setOriginalBlocks(JSON.parse(JSON.stringify(blocks)));

        // Invalidar caché
        CacheService.remove(`page_${pageId}`);

        // Recargar contenido para obtener timestamps actualizados
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

      throw err; // Re-lanzar para que el componente pueda manejar el error
    } finally {
      setLoading(false);
    }
  }, [pageId, pageData, blocks, dispatch, loadPageContent]);

  // Cargar contenido al montar el componente o cambiar pageId
  useEffect(() => {
    loadPageContent();
  }, [loadPageContent]);

  // Retornar todos los métodos y estados
  return {
    // Estados
    pageData,
    blocks,
    originalBlocks,
    setBlocks,
    loading,
    error,
    selectedBlockId,
    setSelectedBlockId,

    // Métodos
    loadPageContent,
    savePageContent
  };
};

export default usePageContent;