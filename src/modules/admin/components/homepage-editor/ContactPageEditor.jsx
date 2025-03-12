// src/modules/admin/components/contact-editor/ContactPageEditor.jsx
import { useState, useEffect } from 'react';
import {
  getContactPageContent,
  saveContactPageContent,
  publishContactPageContent,
  DEFAULT_CONTACT_TEMPLATE
} from './contactPageService';

import { HeaderSectionEditor } from './HeaderSectionEditor';
import { ContactInfoEditor } from './ContactInfoEditor';
import { FormSectionEditor } from './FormSectionEditor';
import { MapSectionEditor } from './MapSectionEditor';
import { ContactPagePreview } from './ContactPagePreview';
import { AlertMessage } from './AlertMessage.jsx'
import { EditorToolbar } from './EditorToolbar.jsx'
import { EditorActionBar } from './EditorActionBar.jsx'

/**
 * Editor principal para la página de contacto
 * Permite personalizar todas las secciones de la página de contacto
 */
const ContactPageEditor = () => {
  // Estado principal
  const [pageConfig, setPageConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasSavedContent, setHasSavedContent] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ show: false, type: '', message: '' });

  // Estados para secciones expandidas
  const [expandedSection, setExpandedSection] = useState(null);

  // Cargar la configuración al iniciar
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const result = await getContactPageContent();

        if (result.ok && result.data) {
          setPageConfig(result.data);
          setHasSavedContent(true);

          // Expandir la primera sección por defecto si no hay ninguna
          if (!expandedSection) {
            setExpandedSection('header');
          }
        } else {
          console.log('No se encontraron datos, usando valores predeterminados');
          setPageConfig({ ...DEFAULT_CONTACT_TEMPLATE });
          setHasSavedContent(false);

          // Expandir la primera sección por defecto
          setExpandedSection('header');
        }
      } catch (error) {
        console.error('Error cargando la configuración:', error);
        showTemporaryAlert('danger', 'Error al cargar la configuración');
        setPageConfig({ ...DEFAULT_CONTACT_TEMPLATE });
        // Expandir la primera sección por defecto
        setExpandedSection('header');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Actualizar una sección específica
  const handleSectionUpdate = (sectionId, newData) => {
    setPageConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          ...newData
        }
      }
    }));
    setHasChanges(true);
  };

  // Mostrar alerta temporal
  const showTemporaryAlert = (type, message) => {
    setAlertMessage({ show: true, type, message });
  };

  // Cerrar alerta
  const closeAlert = () => {
    setAlertMessage({ show: false, type: '', message: '' });
  };

  // Guardar borrador
  const handleSave = async () => {
    try {
      setSaving(true);

      // Crear una copia profunda para evitar problemas de referencia
      const updatedConfig = JSON.parse(JSON.stringify(pageConfig));

      const result = await saveContactPageContent(updatedConfig);

      if (result.ok) {
        showTemporaryAlert('success', 'Borrador guardado correctamente');
        setHasChanges(false);
        setHasSavedContent(true);

        // Actualizar también el estado local para consistencia
        setPageConfig(updatedConfig);
      } else {
        throw new Error(result.error || 'Error desconocido al guardar');
      }
    } catch (err) {
      console.error('Error guardando la configuración:', err);
      showTemporaryAlert('danger', `Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Publicar cambios
  const handlePublish = async () => {
    try {
      setPublishing(true);

      // Asegurar que se guarde antes de publicar
      const updatedConfig = JSON.parse(JSON.stringify(pageConfig));

      const saveResult = await saveContactPageContent(updatedConfig);

      if (!saveResult.ok) {
        throw new Error(saveResult.error || 'Error al guardar antes de publicar');
      }

      const publishResult = await publishContactPageContent();

      if (publishResult.ok) {
        showTemporaryAlert('success', '✅ Cambios publicados correctamente');
        setHasChanges(false);

        // Actualizar estado local para consistencia
        setPageConfig(updatedConfig);
      } else {
        throw new Error(publishResult.error || 'Error desconocido al publicar');
      }
    } catch (err) {
      console.error('Error publicando la configuración:', err);
      showTemporaryAlert('danger', `Error al publicar: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  // Resetear a la plantilla predeterminada
  const handleReset = () => {
    if (window.confirm('¿Estás seguro de resetear la configuración? Perderás todos los cambios.')) {
      setPageConfig({ ...DEFAULT_CONTACT_TEMPLATE });
      setExpandedSection('header');
      setHasChanges(true);
      showTemporaryAlert('warning', 'Se ha restaurado la configuración predeterminada');
    }
  };

  // Controlador para expandir/colapsar secciones
  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Mostrar spinner mientras carga
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

  // Información de las secciones para mostrar en las cards
  const sectionInfo = {
    'header': {
      icon: 'bi-type-h1',
      name: 'Encabezado',
      description: 'Título y subtítulo de la página'
    },
    'contactInfo': {
      icon: 'bi-info-circle',
      name: 'Información de Contacto',
      description: 'Teléfono, email, dirección y redes sociales'
    },
    'form': {
      icon: 'bi-envelope',
      name: 'Formulario de Contacto',
      description: 'Campos y personalización del formulario'
    },
    'map': {
      icon: 'bi-map',
      name: 'Mapa',
      description: 'Ubicación en Google Maps'
    }
  };

  return (
    <div className="contact-page-editor">
      {/* Alerta de estado mejorada */}
      <AlertMessage
        show={alertMessage.show}
        type={alertMessage.type}
        message={alertMessage.message}
        onClose={closeAlert}
      />

      {/* Barra de herramientas */}
      <EditorToolbar
        previewUrl="/contacto"
        hasChanges={hasChanges}
      />

      {/* Vista previa */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <ContactPagePreview config={pageConfig?.sections} />
            </div>
          </div>
        </div>
      </div>

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
                  <div className="section-icon d-flex align-items-center justify-content-center me-3"
                       style={{
                         width: '40px',
                         height: '40px',
                         borderRadius: '8px',
                         backgroundColor: 'rgba(13, 110, 253, 0.1)',
                         color: '#0d6efd'
                       }}>
                    <i className={`bi ${sectionInfo[sectionId]?.icon || 'bi-square'} fs-4`}></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">{sectionInfo[sectionId]?.name || sectionId}</h6>
                    <p className="text-muted small mb-0">
                      {sectionInfo[sectionId]?.description || ''}
                    </p>
                  </div>
                </div>
                <i className={`bi ${expandedSection === sectionId ? 'bi-chevron-up' : 'bi-chevron-down'} fs-4 text-muted`}></i>
              </div>

              {/* Contenido expandible */}
              {expandedSection === sectionId && (
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
                    <FormSectionEditor
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
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Botones de acción */}
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
};

export default ContactPageEditor;