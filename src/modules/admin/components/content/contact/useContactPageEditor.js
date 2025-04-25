import { useState, useEffect } from 'react';
import {
  getContactPageContent,
  saveContactPageContent,
  publishContactPageContent,
  DEFAULT_CONTACT_TEMPLATE
} from './contactPageService';

/**
 * Opciones por defecto para "Asunto" (form)
 * Podrías moverlo a un archivo de constantes o mantenerlo aquí.
 */
const DEFAULT_SUBJECT_OPTIONS = [
  "Consulta general",
  "Soporte técnico",
  "Ventas",
  "Otro"
];

/**
 * Encapsula toda la lógica de la página de contacto:
 *  - Carga inicial (fetch)
 *  - Estados (pageConfig, loading, etc.)
 *  - Guardado y publicación
 *  - Alertas (opcionalmente)
 *  - Control del estado de cada sección
 */
export function useContactPageEditor() {
  const [pageConfig, setPageConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasSavedContent, setHasSavedContent] = useState(false);

  const [alertMessage, setAlertMessage] = useState({
    show: false,
    type: '',
    message: ''
  });

  // Control de UI: sección expandida
  const [expandedSection, setExpandedSection] = useState(null);

  /**
   * Carga la configuración al montar el hook / componente que lo use.
   */
  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        const result = await getContactPageContent();

        if (result.ok && result.data) {
          const simplifiedConfig = {
            ...result.data,
            sections: {
              header: {
                title: result.data.sections?.header?.title
                  || DEFAULT_CONTACT_TEMPLATE.sections.header.title,
                subtitle: result.data.sections?.header?.subtitle
                  || DEFAULT_CONTACT_TEMPLATE.sections.header.subtitle,
              },
              contactInfo: {
                showSocialMedia: result.data.sections?.contactInfo?.showSocialMedia !== false,
                showContactInfo: result.data.sections?.contactInfo?.showContactInfo !== false
              },
              map: {
                showMap: result.data.sections?.map?.showMap !== false,
                embedUrl: result.data.sections?.map?.embedUrl || '',
                height: result.data.sections?.map?.height || '400px',
              },
              socialMedia: {
                items: result.data.sections?.socialMedia?.items
                  || DEFAULT_CONTACT_TEMPLATE.sections.socialMedia.items,
              },
              // Sección Formulario
              form: {
                subjectOptions: result.data.sections?.form?.subjectOptions
                  || DEFAULT_SUBJECT_OPTIONS
              }
            }
          };

          setPageConfig(simplifiedConfig);
          setHasSavedContent(true);

          // Expande la primera sección por defecto
          setExpandedSection('header');
        } else {
          // No hay datos guardados => usar la plantilla default
          const simplifiedTemplate = {
            ...DEFAULT_CONTACT_TEMPLATE,
            sections: {
              header: {
                title: DEFAULT_CONTACT_TEMPLATE.sections.header.title,
                subtitle: DEFAULT_CONTACT_TEMPLATE.sections.header.subtitle,
              },
              contactInfo: {
                showSocialMedia: DEFAULT_CONTACT_TEMPLATE.sections?.contactInfo?.showSocialMedia !== false,
                showContactInfo: DEFAULT_CONTACT_TEMPLATE.sections?.contactInfo?.showContactInfo !== false
              },
              map: {
                showMap: DEFAULT_CONTACT_TEMPLATE.sections?.map?.showMap !== false,
                embedUrl: DEFAULT_CONTACT_TEMPLATE.sections.map.embedUrl,
                height: DEFAULT_CONTACT_TEMPLATE.sections.map.height,
              },
              socialMedia: {
                items: DEFAULT_CONTACT_TEMPLATE.sections.socialMedia.items,
              },
              form: {
                subjectOptions: DEFAULT_SUBJECT_OPTIONS
              }
            }
          };
          setPageConfig(simplifiedTemplate);
          setHasSavedContent(false);
          setExpandedSection('header');
        }
      } catch (error) {
        console.error('Error al cargar la configuración:', error);
        showTemporaryAlert('danger', 'Error al cargar la configuración');

        // Plantilla base en caso de error
        const simplifiedErrorTemplate = {
          ...DEFAULT_CONTACT_TEMPLATE,
          sections: {
            header: {
              title: DEFAULT_CONTACT_TEMPLATE.sections.header.title,
              subtitle: DEFAULT_CONTACT_TEMPLATE.sections.header.subtitle,
            },
            contactInfo: {
              showSocialMedia: DEFAULT_CONTACT_TEMPLATE.sections?.contactInfo?.showSocialMedia !== false,
              showContactInfo: DEFAULT_CONTACT_TEMPLATE.sections?.contactInfo?.showContactInfo !== false
            },
            map: {
              showMap: DEFAULT_CONTACT_TEMPLATE.sections?.map?.showMap !== false,
              embedUrl: '',
              height: '400px',
            },
            socialMedia: {
              items: DEFAULT_CONTACT_TEMPLATE.sections.socialMedia.items,
            },
            form: {
              subjectOptions: DEFAULT_SUBJECT_OPTIONS
            }
          }
        };
        setPageConfig(simplifiedErrorTemplate);
        setExpandedSection('header');
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, []);

  /** Muestra un mensaje de alerta temporal */
  function showTemporaryAlert(type, message) {
    setAlertMessage({ show: true, type, message });
  }

  /** Cierra el mensaje de alerta */
  function closeAlert() {
    setAlertMessage({ show: false, type: '', message: '' });
  }

  /**
   * Expande o colapsa la sección
   */
  function toggleSection(sectionId) {
    setExpandedSection(prev =>
      prev === sectionId ? null : sectionId
    );
  }

  /**
   * Actualiza la configuración de una sección específica
   */
  function handleSectionUpdate(sectionId, newData) {
    if (!pageConfig) return;
    const updatedConfig = JSON.parse(JSON.stringify(pageConfig));
    
    // Ensure the section exists before trying to update it
    if (!updatedConfig.sections[sectionId]) {
      updatedConfig.sections[sectionId] = {};
    }
    
    updatedConfig.sections[sectionId] = {
      ...updatedConfig.sections[sectionId],
      ...newData
    };
    setPageConfig(updatedConfig);
    setHasChanges(true);
  }

  /**
   * Guarda la configuración (borrador)
   */
  async function handleSave() {
    try {
      setSaving(true);
      if (!pageConfig) return;

      const updatedConfig = JSON.parse(JSON.stringify(pageConfig));
      const result = await saveContactPageContent(updatedConfig);

      if (result.ok) {
        showTemporaryAlert('success', 'Borrador guardado correctamente');
        setHasChanges(false);
        setHasSavedContent(true);
        setPageConfig(updatedConfig);
      } else {
        throw new Error(result.error || 'Error desconocido al guardar');
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      showTemporaryAlert('danger', `Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  /**
   * Publica la configuración
   */
  async function handlePublish() {
    try {
      setPublishing(true);
      if (!pageConfig) return;

      // Primero guardar
      const updatedConfig = JSON.parse(JSON.stringify(pageConfig));
      const saveResult = await saveContactPageContent(updatedConfig);
      if (!saveResult.ok) {
        throw new Error(saveResult.error || 'Error al guardar antes de publicar');
      }
      // Luego publicar
      const publishResult = await publishContactPageContent();
      if (publishResult.ok) {
        showTemporaryAlert('success', '✅ Cambios publicados correctamente');
        setHasChanges(false);
        setPageConfig(updatedConfig);
      } else {
        throw new Error(publishResult.error || 'Error desconocido al publicar');
      }
    } catch (err) {
      console.error('Error al publicar:', err);
      showTemporaryAlert('danger', `Error al publicar: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  }

  /**
   * Resetea a la plantilla predeterminada
   */
  function handleReset() {
    const confirmReset = window.confirm(
      '¿Estás seguro de resetear la configuración? Perderás todos los cambios.'
    );
    if (!confirmReset) return;

    const simplifiedTemplate = {
      ...DEFAULT_CONTACT_TEMPLATE,
      sections: {
        header: {
          title: DEFAULT_CONTACT_TEMPLATE.sections.header.title,
          subtitle: DEFAULT_CONTACT_TEMPLATE.sections.header.subtitle,
        },
        contactInfo: {
          showSocialMedia: DEFAULT_CONTACT_TEMPLATE.sections?.contactInfo?.showSocialMedia !== false,
          showContactInfo: DEFAULT_CONTACT_TEMPLATE.sections?.contactInfo?.showContactInfo !== false
        },
        map: {
          showMap: DEFAULT_CONTACT_TEMPLATE.sections?.map?.showMap !== false,
          embedUrl: DEFAULT_CONTACT_TEMPLATE.sections.map.embedUrl,
          height: DEFAULT_CONTACT_TEMPLATE.sections.map.height,
        },
        socialMedia: {
          items: DEFAULT_CONTACT_TEMPLATE.sections.socialMedia.items,
        },
        form: {
          subjectOptions: DEFAULT_SUBJECT_OPTIONS
        }
      }
    };

    setPageConfig(simplifiedTemplate);
    setExpandedSection('header');
    setHasChanges(true);
    showTemporaryAlert('warning', 'Se ha restaurado la configuración predeterminada');
  }

  // Retornamos todo lo que el componente principal necesite usar o renderizar
  return {
    pageConfig,
    loading,
    saving,
    publishing,
    hasChanges,
    hasSavedContent,
    alertMessage,
    expandedSection,

    // Funciones
    closeAlert,
    toggleSection,
    handleSectionUpdate,
    handleSave,
    handlePublish,
    handleReset
  };
}
