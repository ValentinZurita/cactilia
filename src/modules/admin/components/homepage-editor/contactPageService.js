// src/modules/admin/components/contact-editor/contactPageService.js

// ID para el documento de la página de contacto
import ContentService from './ContentService.js'

const CONTACT_PAGE_ID = 'contact';

// Configuración predeterminada para la página de contacto
export const DEFAULT_CONTACT_TEMPLATE = {
  pageTitle: "Contacto",
  pageDescription: "Formulario de contacto y datos de contacto de Cactilia.",
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
      customHours: "Lunes a Viernes: 9am - 6pm",
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
      subjectOptions: [
        "Consulta general",
        "Soporte técnico",
        "Ventas",
        "Otro"
      ],
      buttonText: "Enviar mensaje",
      buttonColor: "#34C749",
      privacyText: "Al enviar este formulario, aceptas nuestra política de privacidad."
    },
    map: {
      showMap: true,
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.661912952812!2d-99.16869742474776!3d19.427021841887487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff35f5bd1563%3A0x6c366f0e2de02ff7!2sEl%20%C3%81ngel%20de%20la%20Independencia!5e0!3m2!1ses-419!2smx!4v1692394356657!5m2!1ses-419!2smx",
      height: "400px"
    },
    socialMedia: {
      items: [
        {
          label: "Facebook",
          icon: "bi-facebook",
          url: "https://facebook.com",
          visible: true
        },
        {
          label: "Instagram",
          icon: "bi-instagram",
          url: "https://instagram.com",
          visible: true
        },
        {
          label: "Twitter",
          icon: "bi-twitter",
          url: "https://twitter.com",
          visible: true
        }
      ]
    }
  }
};

/**
 * Retrieves contact page configuration
 * @param {string} [version='draft'] - Version to get ('draft' or 'published')
 * @returns {Promise<Object>} - Operation result
 */
export const getContactPageContent = async (version = 'draft') => {
  try {
    const result = await ContentService.getPageContent(CONTACT_PAGE_ID, version);

    // If no data exists, return default template
    if (result.ok && !result.data) {
      return {
        ok: true,
        data: { ...DEFAULT_CONTACT_TEMPLATE }
      };
    }

    return result;
  } catch (error) {
    console.error('Error retrieving contact page content:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Saves contact page configuration (draft)
 * @param {Object} data - Configuration data to save
 * @returns {Promise<Object>} - Operation result
 */
export const saveContactPageContent = async (data) => {
  try {
    // Validate basic structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid page data');
    }

    // Create deep copy to avoid reference issues
    const dataToSave = JSON.parse(JSON.stringify(data));

    // Log for debugging
    console.log('Saving contact page:', dataToSave);

    return await ContentService.savePageContent(CONTACT_PAGE_ID, dataToSave);
  } catch (error) {
    console.error('Error saving contact page content:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Publishes contact page configuration
 * Copies draft to published collection
 * @returns {Promise<Object>} - Operation result
 */
export const publishContactPageContent = async () => {
  try {
    return await ContentService.publishPageContent(CONTACT_PAGE_ID);
  } catch (error) {
    console.error('Error publishing contact page content:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Resets contact page configuration to default template
 * @returns {Promise<Object>} - Operation result
 */
export const resetContactPageContent = async () => {
  try {
    return await saveContactPageContent({ ...DEFAULT_CONTACT_TEMPLATE });
  } catch (error) {
    console.error('Error resetting contact page content:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};