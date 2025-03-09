import { ContentService } from './ContentService';
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

    // Validación adicional: si blockOrder no existe o está vacío, reconstruirlo
    if (result.ok && result.data) {
      if (!result.data.blockOrder || !Array.isArray(result.data.blockOrder) || result.data.blockOrder.length === 0) {
        // Si no hay blockOrder válido, reconstruirlo a partir de las secciones
        console.log('Reconstruyendo blockOrder ausente');
        result.data.blockOrder = result.data.sections ? Object.keys(result.data.sections) : [...DEFAULT_TEMPLATE.blockOrder];
      }
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
    // Validar estructura básica
    if (!data || typeof data !== 'object') {
      throw new Error('Los datos de la página no son válidos');
    }

    // Validar y asegurar que blockOrder existe y es válido
    let dataToSave = { ...data };

    // Si no hay blockOrder o no es un array, recrearlo basado en las secciones
    if (!dataToSave.blockOrder || !Array.isArray(dataToSave.blockOrder) || dataToSave.blockOrder.length === 0) {
      dataToSave.blockOrder = dataToSave.sections ? Object.keys(dataToSave.sections) : [...DEFAULT_TEMPLATE.blockOrder];
      console.log('Reconstruido blockOrder en saveHomePageContent:', dataToSave.blockOrder);
    }

    // Hacer copia profunda para evitar problemas de referencia
    dataToSave = JSON.parse(JSON.stringify(dataToSave));

    // Log explícito del orden para debugging
    console.log('Guardando página con blockOrder:', dataToSave.blockOrder);

    return await ContentService.savePageContent(HOME_PAGE_ID, dataToSave);
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