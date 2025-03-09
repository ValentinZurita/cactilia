
import { ContentService } from '../../services/contentService';
import { DEFAULT_TEMPLATE } from './templateData';

// ID para el documento de la página de inicio
const HOME_PAGE_ID = 'home';

/**
 * Obtiene la configuración de la página de inicio
 * @param {string} [version='draft'] - Versión a obtener ('draft' o 'published')
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const getHomePageContent = async (version = 'draft') => {
  try {
    const result = await ContentService.getPageContent(HOME_PAGE_ID, version);

    // Si no hay datos, devolver la plantilla predeterminada para evitar errores
    if (result.ok && !result.data) {
      return {
        ok: true,
        data: { ...DEFAULT_TEMPLATE }
      };
    }

    return result;
  } catch (error) {
    console.error('Error obteniendo contenido de la página de inicio:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Guarda la configuración de la página de inicio (borrador)
 * @param {Object} data - Datos de configuración a guardar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const saveHomePageContent = async (data) => {
  try {
    return await ContentService.savePageContent(HOME_PAGE_ID, data);
  } catch (error) {
    console.error('Error guardando contenido de la página de inicio:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Publica la configuración de la página de inicio
 * Copia el borrador a la colección de publicados
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const publishHomePageContent = async () => {
  try {
    return await ContentService.publishPageContent(HOME_PAGE_ID);
  } catch (error) {
    console.error('Error publicando contenido de la página de inicio:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Resetea la configuración de la página de inicio a la plantilla predeterminada
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const resetHomePageContent = async () => {
  try {
    return await saveHomePageContent({ ...DEFAULT_TEMPLATE });
  } catch (error) {
    console.error('Error reseteando contenido de la página de inicio:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};