import { ContentService } from '../shared/ContentService.js';

// ID para el documento de la página de tienda
const SHOP_PAGE_ID = 'shop';

// Configuración predeterminada para la página de tienda
export const DEFAULT_SHOP_TEMPLATE = {
  sections: {
    banner: {
      title: "Tienda de Cactilia",
      subtitle: "Encuentra productos frescos y naturales",
      showLogo: true,
      showSubtitle: true,
      height: "50vh",
      autoRotate: false,
      useCollection: false,
      backgroundImage: '',
      collectionId: null,
      collectionName: null
    }
  }
};

/**
 * Obtiene la configuración de la página de tienda
 * @param {string} [version='draft'] - Versión a obtener ('draft' o 'published')
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const getShopPageContent = async (version = 'draft') => {
  try {
    const result = await ContentService.getPageContent(SHOP_PAGE_ID, version);

    // Si no hay datos, devolver la plantilla predeterminada para evitar errores
    if (result.ok && !result.data) {
      return {
        ok: true,
        data: { ...DEFAULT_SHOP_TEMPLATE }
      };
    }

    return result;
  } catch (error) {
    console.error('Error obteniendo contenido de la página de tienda:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Guarda la configuración de la página de tienda (borrador)
 * @param {Object} data - Datos de configuración a guardar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const saveShopPageContent = async (data) => {
  try {
    // Validar estructura básica
    if (!data || typeof data !== 'object') {
      throw new Error('Los datos de la página no son válidos');
    }

    // Hacer copia profunda para evitar problemas de referencia
    const dataToSave = JSON.parse(JSON.stringify(data));

    // Log explícito para debugging
    console.log('Guardando página de tienda:', dataToSave);

    return await ContentService.savePageContent(SHOP_PAGE_ID, dataToSave);
  } catch (error) {
    console.error('Error guardando contenido de la página de tienda:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Publica la configuración de la página de tienda
 * Copia el borrador a la colección de publicados
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const publishShopPageContent = async () => {
  try {
    return await ContentService.publishPageContent(SHOP_PAGE_ID);
  } catch (error) {
    console.error('Error publicando contenido de la página de tienda:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Resetea la configuración de la página de tienda a la plantilla predeterminada
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const resetShopPageContent = async () => {
  try {
    return await saveShopPageContent({ ...DEFAULT_SHOP_TEMPLATE });
  } catch (error) {
    console.error('Error reseteando contenido de la página de tienda:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};