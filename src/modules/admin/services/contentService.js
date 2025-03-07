import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { FirebaseDB } from "../../../firebase/firebaseConfig";

/**
 * Servicio para gestionar los bloques de contenido de las páginas
 * Permite crear, leer, actualizar y eliminar bloques de contenido configurables
 * Soporta gestión de borradores y publicación
 */
export const ContentService = {

  /**
   * Obtiene la configuración de una página por su identificador
   * @param {string} pageId - Identificador de la página (ej: "home", "about", "contact")
   * @param {string} [version='draft'] - Versión a cargar ('draft' o 'published')
   * @returns {Promise<{ok: boolean, data?: Object, error?: string}>}
   */
  getPageContent: async (pageId, version = 'draft') => {
    try {
      // Verificar parámetro
      if (!pageId) {
        throw new Error("Se requiere un ID de página");
      }

      // Determinar la colección según la versión
      const collectionName = version === 'published' ? "content_published" : "content";

      // Referencia al documento de la página
      const pageRef = doc(FirebaseDB, collectionName, pageId);
      const pageDoc = await getDoc(pageRef);

      // Si no existe, devolvemos un objeto vacío
      if (!pageDoc.exists()) {
        return {
          ok: true,
          data: {
            id: pageId,
            blocks: [],
            updatedAt: null,
            createdAt: null
          }
        };
      }

      // Devolvemos los datos
      return {
        ok: true,
        data: {
          id: pageDoc.id,
          ...pageDoc.data()
        }
      };
    } catch (error) {
      console.error(`Error obteniendo contenido de página [${pageId}]:`, error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Guarda la configuración completa de una página (borrador)
   * @param {string} pageId - Identificador de la página
   * @param {Object} pageData - Datos de la página y sus bloques
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  savePageContent: async (pageId, pageData) => {
    try {
      // Verificar parámetros
      if (!pageId) {
        throw new Error("Se requiere un ID de página");
      }

      // Referencia al documento
      const pageRef = doc(FirebaseDB, "content", pageId);

      // Verificar si ya existe
      const pageDoc = await getDoc(pageRef);

      // Preparar datos con timestamps
      const dataToSave = {
        ...pageData,
        updatedAt: serverTimestamp()
      };

      // Si no existe, añadir timestamp de creación
      if (!pageDoc.exists()) {
        dataToSave.createdAt = serverTimestamp();
      }

      // Guardar en Firestore
      await setDoc(pageRef, dataToSave, { merge: true });

      return { ok: true };
    } catch (error) {
      console.error(`Error guardando contenido de página [${pageId}]:`, error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Publica la configuración actual de la página
   * Copia el contenido de la colección "content" a "content_published"
   * @param {string} pageId - Identificador de la página
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  publishPageContent: async (pageId) => {
    try {
      // Verificar parámetros
      if (!pageId) {
        throw new Error("Se requiere un ID de página");
      }

      // Obtener el contenido actual (borrador)
      const { ok, data, error } = await ContentService.getPageContent(pageId, 'draft');
      if (!ok) {
        throw new Error(error || "Error obteniendo contenido para publicar");
      }

      // Referencia al documento publicado
      const publishedRef = doc(FirebaseDB, "content_published", pageId);

      // Preparar datos para publicar con timestamps
      const dataToPublish = {
        ...data,
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Si es la primera vez que se publica, añadir timestamp de creación
      const publishedDoc = await getDoc(publishedRef);
      if (!publishedDoc.exists()) {
        dataToPublish.createdAt = serverTimestamp();
      }

      // Guardar en Firestore como publicado
      await setDoc(publishedRef, dataToPublish, { merge: true });

      return { ok: true };
    } catch (error) {
      console.error(`Error publicando contenido de página [${pageId}]:`, error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Actualiza un bloque específico dentro de una página
   * @param {string} pageId - Identificador de la página
   * @param {string} blockId - Identificador del bloque
   * @param {Object} blockData - Nuevos datos del bloque
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  updateBlock: async (pageId, blockId, blockData) => {
    try {
      // Obtener la página actual
      const { ok, data, error } = await ContentService.getPageContent(pageId);

      if (!ok) {
        throw new Error(error);
      }

      // Si no hay bloques, inicializar array
      if (!data.blocks) {
        data.blocks = [];
      }

      // Buscar el índice del bloque a actualizar
      const blockIndex = data.blocks.findIndex(b => b.id === blockId);

      // Si no existe, agregarlo
      if (blockIndex === -1) {
        data.blocks.push({
          id: blockId,
          ...blockData,
          createdAt: new Date().toISOString()
        });
      } else {
        // Actualizar el bloque existente
        data.blocks[blockIndex] = {
          ...data.blocks[blockIndex],
          ...blockData,
          updatedAt: new Date().toISOString()
        };
      }

      // Guardar los cambios
      return await ContentService.savePageContent(pageId, data);
    } catch (error) {
      console.error(`Error actualizando bloque [${blockId}] en página [${pageId}]:`, error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Elimina un bloque específico de una página
   * @param {string} pageId - Identificador de la página
   * @param {string} blockId - Identificador del bloque a eliminar
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  deleteBlock: async (pageId, blockId) => {
    try {
      // Obtener la página actual
      const { ok, data, error } = await ContentService.getPageContent(pageId);

      if (!ok) {
        throw new Error(error);
      }

      // Si no hay bloques, no hay nada que eliminar
      if (!data.blocks || data.blocks.length === 0) {
        return { ok: true };
      }

      // Filtrar el bloque a eliminar
      data.blocks = data.blocks.filter(b => b.id !== blockId);

      // Guardar los cambios
      return await ContentService.savePageContent(pageId, data);
    } catch (error) {
      console.error(`Error eliminando bloque [${blockId}] de página [${pageId}]:`, error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Reordena los bloques de una página
   * @param {string} pageId - Identificador de la página
   * @param {string[]} blockOrder - Array con los IDs de los bloques en el nuevo orden
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  reorderBlocks: async (pageId, blockOrder) => {
    try {
      // Obtener la página actual
      const { ok, data, error } = await ContentService.getPageContent(pageId);

      if (!ok) {
        throw new Error(error);
      }

      // Si no hay bloques, no hay nada que reordenar
      if (!data.blocks || data.blocks.length === 0) {
        return { ok: true };
      }

      // Crear un mapa para acceder rápidamente a los bloques por ID
      const blocksMap = data.blocks.reduce((map, block) => {
        map[block.id] = block;
        return map;
      }, {});

      // Crear nuevo array ordenado
      const reorderedBlocks = blockOrder
        .filter(id => blocksMap[id]) // Solo incluir IDs válidos
        .map(id => blocksMap[id]);

      // Actualizar bloques
      data.blocks = reorderedBlocks;

      // Guardar los cambios
      return await ContentService.savePageContent(pageId, data);
    } catch (error) {
      console.error(`Error reordenando bloques en página [${pageId}]:`, error);
      return { ok: false, error: error.message };
    }
  }
};

// Tipos de bloques disponibles
export const BLOCK_TYPES = {
  HERO_SLIDER: 'hero-slider',
  FEATURED_PRODUCTS: 'featured-products',
  IMAGE_CAROUSEL: 'image-carousel',
  PRODUCT_CATEGORIES: 'product-categories',
  TEXT_BLOCK: 'text-block',
  CALL_TO_ACTION: 'call-to-action'
};

// Definiciones de estructura para cada tipo de bloque
export const BLOCK_SCHEMAS = {
  [BLOCK_TYPES.HERO_SLIDER]: {
    title: 'Slider Hero',
    fields: {
      title: { type: 'text', label: 'Título principal', required: true },
      subtitle: { type: 'text', label: 'Subtítulo' },
      buttonText: { type: 'text', label: 'Texto del botón',
        help: 'Texto que se mostrará en el botón de acción' },
      buttonLink: { type: 'text', label: 'Enlace del botón',
        help: 'URL a la que llevará el botón al hacer clic' },
      showButton: { type: 'boolean', label: 'Mostrar botón', defaultValue: true },
      showLogo: { type: 'boolean', label: 'Mostrar logo', defaultValue: true },
      showSubtitle: { type: 'boolean', label: 'Mostrar subtítulo', defaultValue: true },
      height: { type: 'select', label: 'Altura', options: ['25vh', '50vh', '75vh', '100vh'], defaultValue: '50vh' },
      collectionId: { type: 'collection', label: 'Colección de imágenes',
        help: 'Selecciona una colección de imágenes para el slider' },
      mainImage: { type: 'media', label: 'Imagen principal',
        help: 'Se usará si no hay colección seleccionada' },
      autoRotate: { type: 'boolean', label: 'Rotación automática', defaultValue: true },
      interval: { type: 'number', label: 'Intervalo (ms)', defaultValue: 5000,
        help: 'Tiempo entre cambios de imágenes en milisegundos' }
    }
  },
  [BLOCK_TYPES.FEATURED_PRODUCTS]: {
    title: 'Productos Destacados',
    fields: {
      title: { type: 'text', label: 'Título de sección' },
      subtitle: { type: 'text', label: 'Subtítulo' },
      icon: { type: 'text', label: 'Icono (clases Bootstrap)', defaultValue: 'bi-star-fill' },
      showBg: { type: 'boolean', label: 'Mostrar fondo' },
      maxProducts: { type: 'number', label: 'Cantidad de productos', defaultValue: 6 },
      filterByFeatured: { type: 'boolean', label: 'Usar productos destacados', defaultValue: true },
      useCollection: { type: 'boolean', label: 'Usar colección de imágenes', defaultValue: false },
      collectionId: {
        type: 'collection',
        label: 'Colección (si no usa productos destacados)',
        required: false,
        help: 'Solo se usa si "Usar colección de imágenes" está activado'
      }
    }
  },
  [BLOCK_TYPES.IMAGE_CAROUSEL]: {
    title: 'Carrusel de Imágenes',
    fields: {
      title: { type: 'text', label: 'Título de sección' },
      subtitle: { type: 'text', label: 'Subtítulo' },
      icon: { type: 'text', label: 'Icono (clases Bootstrap)', defaultValue: 'bi-images' },
      showBg: { type: 'boolean', label: 'Mostrar fondo' },
      collectionId: {
        type: 'collection',
        label: 'Colección de imágenes',
        required: true,
        help: 'Selecciona una colección de imágenes para el carrusel'
      }
    }
  },
  [BLOCK_TYPES.PRODUCT_CATEGORIES]: {
    title: 'Categorías de Productos',
    fields: {
      title: { type: 'text', label: 'Título de sección' },
      subtitle: { type: 'text', label: 'Subtítulo' },
      icon: { type: 'text', label: 'Icono (clases Bootstrap)', defaultValue: 'bi-grid-fill' },
      showBg: { type: 'boolean', label: 'Mostrar fondo' },
      useCollection: { type: 'boolean', label: 'Usar colección personalizada', defaultValue: false },
      collectionId: {
        type: 'collection',
        label: 'Colección (si no usa categorías reales)',
        required: false,
        help: 'Solo se usa si "Usar colección personalizada" está activado'
      }
    }
  },
  [BLOCK_TYPES.TEXT_BLOCK]: {
    title: 'Bloque de Texto',
    fields: {
      title: { type: 'text', label: 'Título' },
      content: { type: 'textarea', label: 'Contenido (soporta HTML)' },
      alignment: { type: 'select', label: 'Alineación', options: ['left', 'center', 'right'] },
      showBg: { type: 'boolean', label: 'Mostrar fondo' }
    }
  },
  [BLOCK_TYPES.CALL_TO_ACTION]: {
    title: 'Llamada a la Acción',
    fields: {
      title: { type: 'text', label: 'Título' },
      subtitle: { type: 'text', label: 'Subtítulo' },
      buttonText: { type: 'text', label: 'Texto del botón' },
      buttonLink: { type: 'text', label: 'Enlace del botón' },
      backgroundImage: { type: 'media', label: 'Imagen de fondo' },
      alignment: { type: 'select', label: 'Alineación', options: ['left', 'center', 'right'] }
    }
  }
};