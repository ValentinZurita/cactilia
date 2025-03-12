// src/modules/admin/components/contact-editor/contactPageService.js

// ID para el documento de la página de contacto
import ContentService from './ContentService.js'

const CONTACT_PAGE_ID = 'contact';

// Configuración predeterminada para la página de contacto
export const DEFAULT_CONTACT_TEMPLATE = {
  sections: {
    header: {
      title: "Contáctanos",
      subtitle: "Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.",
      backgroundImage: '',
      showBackground: true
    },
    contactInfo: {
      showContactInfo: true,
      customPhone: "",
      customEmail: "",
      customAddress: "",
      useDefaultInfo: true,
      showSocialMedia: true
    },
    form: {
      showForm: true,
      title: "Envíanos un mensaje",
      showNameField: true,
      showEmailField: true,
      showPhoneField: true,
      showSubjectField: true,
      showMessageField: true,
      buttonText: "Enviar mensaje",
      buttonColor: "#34C749",
      privacyText: "Al enviar este formulario, aceptas nuestra política de privacidad."
    },
    map: {
      showMap: true,
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.661912952812!2d-99.16869742474776!3d19.427021841887487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff35f5bd1563%3A0x6c366f0e2de02ff7!2sEl%20%C3%81ngel%20de%20la%20Independencia!5e0!3m2!1ses-419!2smx!4v1692394356657!5m2!1ses-419!2smx",
      height: "400px"
    }
  }
};

/**
 * Obtiene la configuración de la página de contacto
 * @param {string} [version='draft'] - Versión a obtener ('draft' o 'published')
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const getContactPageContent = async (version = 'draft') => {
  try {
    const result = await ContentService.getPageContent(CONTACT_PAGE_ID, version);

    // Si no hay datos, devolver la plantilla predeterminada para evitar errores
    if (result.ok && !result.data) {
      return {
        ok: true,
        data: { ...DEFAULT_CONTACT_TEMPLATE }
      };
    }

    return result;
  } catch (error) {
    console.error('Error obteniendo contenido de la página de contacto:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Guarda la configuración de la página de contacto (borrador)
 * @param {Object} data - Datos de configuración a guardar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const saveContactPageContent = async (data) => {
  try {
    // Validar estructura básica
    if (!data || typeof data !== 'object') {
      throw new Error('Los datos de la página no son válidos');
    }

    // Hacer copia profunda para evitar problemas de referencia
    const dataToSave = JSON.parse(JSON.stringify(data));

    // Log para debugging
    console.log('Guardando página de contacto:', dataToSave);

    return await ContentService.savePageContent(CONTACT_PAGE_ID, dataToSave);
  } catch (error) {
    console.error('Error guardando contenido de la página de contacto:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Publica la configuración de la página de contacto
 * Copia el borrador a la colección de publicados
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const publishContactPageContent = async () => {
  try {
    return await ContentService.publishPageContent(CONTACT_PAGE_ID);
  } catch (error) {
    console.error('Error publicando contenido de la página de contacto:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Resetea la configuración de la página de contacto a la plantilla predeterminada
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const resetContactPageContent = async () => {
  try {
    return await saveContactPageContent({ ...DEFAULT_CONTACT_TEMPLATE });
  } catch (error) {
    console.error('Error reseteando contenido de la página de contacto:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};