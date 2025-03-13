import React, { useState, useEffect } from 'react';


import { EditorActionBar } from '../shared/EditorActionBar.jsx';
import { EditorToolbar } from '../shared/EditorToolbar.jsx';
import { AlertMessage } from '../shared/AlertMessage.jsx';

import {
  getContactPageContent,
  saveContactPageContent,
  publishContactPageContent,
  DEFAULT_CONTACT_TEMPLATE
} from './contactPageService.js';
import { FormFieldsEditor } from './FormFieldsEditor.jsx'
import { MapSectionEditor } from './MapSectionEditor.jsx'
import { SocialMediaEditor } from './SocialMediaEditor.jsx'
import { ContactInfoEditor } from './ContactInfoEditor.jsx'
import { HeaderSectionEditor } from './HeaderSectionEditor.jsx'

/**
 * Opciones por defecto para “Asunto” (puedes centralizarlas en un archivo de constantes).
 */
const DEFAULT_SUBJECT_OPTIONS = [
  "Consulta general",
  "Soporte técnico",
  "Ventas",
  "Otro"
];

/**
 * Editor principal de la página de contacto
 * (mantiene la lógica de carga/guardado/publicación y reúne todas las secciones).
 */
export default function ContactPageEditor() {
  // Estados principales
  const [pageConfig, setPageConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasSavedContent, setHasSavedContent] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ show: false, type: '', message: '' });

  // UI: qué sección está expandida en este momento
  const [expandedSection, setExpandedSection] = useState(null);

  // Carga de contenido inicial
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
                customPhone: result.data.sections?.contactInfo?.customPhone || '',
                customEmail: result.data.sections?.contactInfo?.customEmail || '',
                customAddress: result.data.sections?.contactInfo?.customAddress || '',
                customHours: result.data.sections?.contactInfo?.customHours
                  || 'Lunes a Viernes: 9am - 6pm',
              },
              map: {
                showMap: true,
                embedUrl: result.data.sections?.map?.embedUrl || '',
                height: result.data.sections?.map?.height || '400px',
              },
              socialMedia: {
                items: result.data.sections?.socialMedia?.items
                  || DEFAULT_CONTACT_TEMPLATE.sections.socialMedia.items,
              },
              // Sección de Formulario (opciones de asunto)
              form: {
                subjectOptions: result.data.sections?.form?.subjectOptions || DEFAULT_SUBJECT_OPTIONS
              }
            }
          };

          setPageConfig(simplifiedConfig);
          setHasSavedContent(true);

          // Expande la primera sección por defecto
          if (!expandedSection) {
            setExpandedSection('header');
          }
        } else {
          // Si no hay datos, usamos la plantilla por defecto
          const simplifiedTemplate = {
            ...DEFAULT_CONTACT_TEMPLATE,
            sections: {
              header: {
                title: DEFAULT_CONTACT_TEMPLATE.sections.header.title,
                subtitle: DEFAULT_CONTACT_TEMPLATE.sections.header.subtitle,
              },
              contactInfo: {
                customPhone: '',
                customEmail: '',
                customAddress: '',
                customHours: 'Lunes a Viernes: 9am - 6pm',
              },
              map: {
                showMap: true,
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

        const simplifiedErrorTemplate = {
          ...DEFAULT_CONTACT_TEMPLATE,
          sections: {
            header: {
              title: DEFAULT_CONTACT_TEMPLATE.sections.header.title,
              subtitle: DEFAULT_CONTACT_TEMPLATE.sections.header.subtitle,
            },
            contactInfo: {
              customPhone: '',
              customEmail: '',
              customAddress: '',
              customHours: 'Lunes a Viernes: 9am - 6pm',
            },
            map: {
              showMap: true,
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
  }, [expandedSection]);

  /** Muestra un mensaje de alerta temporal */
  function showTemporaryAlert(type, message) {
    setAlertMessage({ show: true, type, message });
  }

  /** Cierra el mensaje de alerta */
  function closeAlert() {
    setAlertMessage({ show: false, type: '', message: '' });
  }

  /**
   * Actualiza la configuración de una sección específica
   */
  function handleSectionUpdate(sectionId, newData) {
    if (!pageConfig) return;
    const updatedConfig = JSON.parse(JSON.stringify(pageConfig));
    updatedConfig.sections[sectionId] = {
      ...updatedConfig.sections[sectionId],
      ...newData
    };
    setPageConfig(updatedConfig);
    setHasChanges(true);
  }

  /** Guarda la configuración en modo borrador */
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

  /** Publica la configuración actual */
  async function handlePublish() {
    try {
      setPublishing(true);
      if (!pageConfig) return;

      // Primero guardamos
      const updatedConfig = JSON.parse(JSON.stringify(pageConfig));
      const saveResult = await saveContactPageContent(updatedConfig);
      if (!saveResult.ok) {
        throw new Error(saveResult.error || 'Error al guardar antes de publicar');
      }
      // Luego publicamos
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

  /** Resetea a la configuración predeterminada */
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
          customPhone: '',
          customEmail: '',
          customAddress: '',
          customHours: 'Lunes a Viernes: 9am - 6pm',
        },
        map: {
          showMap: true,
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

  /** Expande o colapsa la sección */
  function toggleSection(sectionId) {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  }

  /** Spinner de carga */
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="ms-3 mb-0 h5">Cargando editor...</p>
      </div>
    );
  }

  /** Información descriptiva de cada sección para la UI */
  const sectionInfo = {
    header: {
      icon: 'bi-type-h1',
      name: 'Encabezado',
      description: 'Título y subtítulo de la página'
    },
    contactInfo: {
      icon: 'bi-info-circle',
      name: 'Información de Contacto',
      description: 'Teléfono, email, dirección y horarios'
    },
    form: {
      icon: 'bi-envelope',
      name: 'Formulario',
      description: 'Opciones del campo de asunto'
    },
    map: {
      icon: 'bi-map',
      name: 'Mapa',
      description: 'Ubicación en Google Maps'
    },
    socialMedia: {
      icon: 'bi-people',
      name: 'Redes Sociales',
      description: 'Enlaces a tus redes sociales'
    }
  };

  return (
    <div className="contact-page-editor">
      {/* Alerta (éxito, error, etc.) */}
      <AlertMessage
        show={alertMessage.show}
        type={alertMessage.type}
        message={alertMessage.message}
        onClose={closeAlert}
      />

      {/* Barra de herramientas superior */}
      <EditorToolbar
        previewUrl="/contacto"
        hasChanges={hasChanges}
      />

      {/* Secciones editables */}
      <div className="row g-3 mb-4">
        {Object.keys(sectionInfo).map((sectionId) => (
          <div className="col-12" key={sectionId}>
            <div className="card shadow-sm">
              <div
                className="card-header d-flex flex-wrap justify-content-between align-items-center py-3"
                onClick={() => toggleSection(sectionId)}
                style={{
                  cursor: 'pointer',
                  background: expandedSection === sectionId ? '#f8f9fa' : 'white'
                }}
              >
                <div className="d-flex align-items-center mb-2 mb-sm-0">
                  <div
                    className="section-icon d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(13, 110, 253, 0.1)',
                      color: '#0d6efd'
                    }}
                  >
                    <i className={`bi ${sectionInfo[sectionId]?.icon || 'bi-square'} fs-4`}></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">
                      {sectionInfo[sectionId]?.name || sectionId}
                    </h6>
                    <p className="text-muted small mb-0">
                      {sectionInfo[sectionId]?.description || ''}
                    </p>
                  </div>
                </div>
                <i
                  className={`bi ${
                    expandedSection === sectionId ? 'bi-chevron-up' : 'bi-chevron-down'
                  } fs-4 text-muted`}
                ></i>
              </div>

              {/* Contenido expandible */}
              {expandedSection === sectionId && pageConfig && (
                <div className="card-body border-top p-4">
                  {sectionId === 'header' && (
                    <HeaderSectionEditor
                      data={pageConfig.sections.header}
                      onUpdate={(newData) => handleSectionUpdate('header', newData)}
                    />
                  )}
                  {sectionId === 'contactInfo' && (
                    <ContactInfoEditor
                      data={pageConfig.sections.contactInfo}
                      onUpdate={(newData) => handleSectionUpdate('contactInfo', newData)}
                    />
                  )}
                  {sectionId === 'form' && (
                    <FormFieldsEditor
                      data={pageConfig.sections.form}
                      onUpdate={(newData) => handleSectionUpdate('form', newData)}
                    />
                  )}
                  {sectionId === 'map' && (
                    <MapSectionEditor
                      data={pageConfig.sections.map}
                      onUpdate={(newData) => handleSectionUpdate('map', newData)}
                    />
                  )}
                  {sectionId === 'socialMedia' && (
                    <SocialMediaEditor
                      data={pageConfig.sections.socialMedia}
                      onUpdate={(newData) => handleSectionUpdate('socialMedia', newData)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Barra de acciones (Guardar, Publicar, Reset) */}
      <EditorActionBar
        onSave={handleSave}
        onPublish={handlePublish}
        onReset={handleReset}
        saving={saving}
        publishing={publishing}
        hasChanges={hasChanges}
        hasSavedContent={hasSavedContent}
      />
    </div>
  );
}
