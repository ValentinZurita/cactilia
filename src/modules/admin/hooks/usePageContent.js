import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ContentService, BLOCK_TYPES } from '../services/contentService';
import { addMessage } from '../../../store/messages/messageSlice';
import { CacheService } from '../../../utils/cacheService';

/**
 * Función para generar IDs consistentes para bloques
 * @param {string} type - Tipo de bloque (para fines de legibilidad)
 * @returns {string} - ID único para el bloque
 */
const generateBlockId = (type) => `block_${type.replace(/-/g, '_')}_${Date.now()}`;

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
   * Crea bloques predeterminados según el tipo de página
   * @param {string} pageType - Tipo de página ('home', 'about', etc.)
   * @returns {Array} - Bloques predeterminados
   */
  const createDefaultBlocks = (pageType) => {
    const timestamp = new Date().toISOString();

    // Bloques predeterminados para la página de inicio
    if (pageType === 'home') {
      return [
        {
          id: generateBlockId('hero'),
          type: BLOCK_TYPES.HERO_SLIDER,
          title: 'Bienvenido a Cactilia',
          subtitle: 'Productos frescos y naturales para una vida mejor',
          showButton: true,
          buttonText: 'Conoce Más',
          buttonLink: '#',
          height: '100vh',
          autoRotate: true,
          interval: 5000,
          createdAt: timestamp,
          mainImage: '/public/images/placeholder.jpg'
        },
        {
          id: generateBlockId('featured'),
          type: BLOCK_TYPES.FEATURED_PRODUCTS,
          title: 'Productos Destacados',
          subtitle: 'Explora nuestra selección especial.',
          icon: 'bi-star-fill',
          showBg: false,
          maxProducts: 6,
          filterByFeatured: true,
          createdAt: timestamp
        },
        {
          id: generateBlockId('farm'),
          type: BLOCK_TYPES.IMAGE_CAROUSEL,
          title: 'Nuestro Huerto',
          subtitle: 'Descubre la belleza y frescura de nuestra granja.',
          icon: 'bi-tree-fill',
          showBg: true,
          createdAt: timestamp
        },
        {
          id: generateBlockId('categories'),
          type: BLOCK_TYPES.PRODUCT_CATEGORIES,
          title: 'Descubre Nuestros Productos',
          subtitle: 'Productos orgánicos de alta calidad para una vida mejor.',
          icon: 'bi-box-seam',
          showBg: false,
          createdAt: timestamp
        }
      ];
    }

    // Bloques predeterminados para la página "Acerca de"
    if (pageType === 'about') {
      return [
        {
          id: generateBlockId('about_hero'),
          type: BLOCK_TYPES.HERO_SLIDER,
          title: 'Acerca de Nosotros',
          subtitle: 'Conozca nuestra historia y valores',
          showButton: false,
          height: '50vh',
          createdAt: timestamp
        },
        {
          id: generateBlockId('about_text'),
          type: BLOCK_TYPES.TEXT_BLOCK,
          title: 'Nuestra Historia',
          content: '<p>Aquí va la historia de la empresa...</p>',
          alignment: 'left',
          showBg: false,
          createdAt: timestamp
        },
        {
          id: generateBlockId('about_cta'),
          type: BLOCK_TYPES.CALL_TO_ACTION,
          title: '¿Quieres saber más?',
          subtitle: 'Contáctanos para conocer más sobre nuestros productos',
          buttonText: 'Contactar',
          buttonLink: '/contact',
          alignment: 'center',
          createdAt: timestamp
        }
      ];
    }

    // Bloques predeterminados para la página de contacto
    if (pageType === 'contact') {
      return [
        {
          id: generateBlockId('contact_hero'),
          type: BLOCK_TYPES.HERO_SLIDER,
          title: 'Contáctanos',
          subtitle: 'Estamos aquí para ayudarte',
          showButton: false,
          height: '40vh',
          createdAt: timestamp
        },
        {
          id: generateBlockId('contact_text'),
          type: BLOCK_TYPES.TEXT_BLOCK,
          title: 'Información de Contacto',
          content: '<p>Dirección: Calle Principal #123<br>Teléfono: (123) 456-7890<br>Email: info@ejemplo.com</p>',
          alignment: 'center',
          showBg: true,
          createdAt: timestamp
        }
      ];
    }

    // Para cualquier otra página, devolver un bloque de texto básico
    return [
      {
        id: generateBlockId('text'),
        type: BLOCK_TYPES.TEXT_BLOCK,
        title: 'Título de la página',
        content: '<p>Contenido de ejemplo para esta página.</p>',
        alignment: 'center',
        showBg: false,
        createdAt: timestamp
      }
    ];
  };

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

        // Si no hay bloques o está vacío, crear bloques predeterminados
        if (!result.data.blocks || result.data.blocks.length === 0) {
          const defaultBlocks = createDefaultBlocks(pageId);
          setBlocks(defaultBlocks);

          // Opcional: guardar automáticamente estos bloques predeterminados
          // await ContentService.savePageContent(pageId, { ...result.data, blocks: defaultBlocks });
        } else {
          setBlocks(result.data.blocks || []);
        }
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
      const blockId = generateBlockId(blockType);

      // Crear el nuevo bloque con datos básicos
      const newBlock = {
        id: blockId,
        type: blockType,
        ...initialData,
        createdAt: new Date().toISOString()
      };

      // Añadir el bloque a la lista (actualización inmediata del estado)
      setBlocks(prevBlocks => [...prevBlocks, newBlock]);

      // Seleccionar el nuevo bloque para edición
      setSelectedBlockId(blockId);

      // Actualizar en Firebase (puede ser asíncrono)
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
  }, [pageId, dispatch]);

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