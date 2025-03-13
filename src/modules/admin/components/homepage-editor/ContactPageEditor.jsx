import { useState, useEffect } from 'react';
import {
  getContactPageContent,
  saveContactPageContent,
  publishContactPageContent,
  DEFAULT_CONTACT_TEMPLATE
} from './contactPageService';

import { HeaderSectionEditor } from './HeaderSectionEditor';
import { ContactInfoEditor } from './ContactInfoEditor';
import { SocialMediaEditor } from './SocialMediaEditor';
import { MapSectionEditor } from './MapSectionEditor';
import { ContactPagePreview } from './ContactPagePreview';
import { AlertMessage } from './AlertMessage.jsx';
import { EditorToolbar } from './EditorToolbar.jsx';
import { EditorActionBar } from './EditorActionBar.jsx';
import { FormFieldsEditor } from './FormFieldEditor.jsx'

/**
 * Enhanced Contact Page Editor component
 * Allows customization of all aspects of the contact page
 *
 * @returns {JSX.Element}
 */
const ContactPageEditor = () => {
  // Main states
  const [pageConfig, setPageConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasSavedContent, setHasSavedContent] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ show: false, type: '', message: '' });

  // UI states
  const [expandedSection, setExpandedSection] = useState(null);

  // Load page configuration on component mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const result = await getContactPageContent();

        if (result.ok && result.data) {
          setPageConfig(result.data);
          setHasSavedContent(true);

          // Expand first section by default if none is expanded
          if (!expandedSection) {
            setExpandedSection('header');
          }
        } else {
          console.log('No saved data found, using default template');
          setPageConfig({ ...DEFAULT_CONTACT_TEMPLATE });
          setHasSavedContent(false);

          // Expand first section by default
          setExpandedSection('header');
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
        showTemporaryAlert('danger', 'Error al cargar la configuración');
        setPageConfig({ ...DEFAULT_CONTACT_TEMPLATE });
        // Expand first section by default
        setExpandedSection('header');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  /**
   * Updates a specific section's configuration
   *
   * @param {string} sectionId - Section identifier
   * @param {Object} newData - New section data
   */
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

  /**
   * Shows a temporary alert message
   *
   * @param {string} type - Alert type (success, warning, danger)
   * @param {string} message - Alert message
   */
  const showTemporaryAlert = (type, message) => {
    setAlertMessage({ show: true, type, message });
  };

  /**
   * Closes the alert message
   */
  const closeAlert = () => {
    setAlertMessage({ show: false, type: '', message: '' });
  };

  /**
   * Saves the current configuration as a draft
   */
  const handleSave = async () => {
    try {
      setSaving(true);

      // Create a deep copy to avoid reference issues
      const updatedConfig = JSON.parse(JSON.stringify(pageConfig));

      const result = await saveContactPageContent(updatedConfig);

      if (result.ok) {
        showTemporaryAlert('success', 'Borrador guardado correctamente');
        setHasChanges(false);
        setHasSavedContent(true);

        // Update local state for consistency
        setPageConfig(updatedConfig);
      } else {
        throw new Error(result.error || 'Error desconocido al guardar');
      }
    } catch (err) {
      console.error('Error saving configuration:', err);
      showTemporaryAlert('danger', `Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Publishes the current configuration
   */
  const handlePublish = async () => {
    try {
      setPublishing(true);

      // Ensure we save before publishing
      const updatedConfig = JSON.parse(JSON.stringify(pageConfig));

      const saveResult = await saveContactPageContent(updatedConfig);

      if (!saveResult.ok) {
        throw new Error(saveResult.error || 'Error al guardar antes de publicar');
      }

      const publishResult = await publishContactPageContent();

      if (publishResult.ok) {
        showTemporaryAlert('success', '✅ Cambios publicados correctamente');
        setHasChanges(false);

        // Update local state for consistency
        setPageConfig(updatedConfig);
      } else {
        throw new Error(publishResult.error || 'Error desconocido al publicar');
      }
    } catch (err) {
      console.error('Error publishing configuration:', err);
      showTemporaryAlert('danger', `Error al publicar: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  /**
   * Resets the configuration to default template
   */
  const handleReset = () => {
    if (window.confirm('¿Estás seguro de resetear la configuración? Perderás todos los cambios.')) {
      setPageConfig({ ...DEFAULT_CONTACT_TEMPLATE });
      setExpandedSection('header');
      setHasChanges(true);
      showTemporaryAlert('warning', 'Se ha restaurado la configuración predeterminada');
    }
  };

  /**
   * Toggles a section's expanded state
   *
   * @param {string} sectionId - Section identifier
   */
  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Show spinner while loading
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

  // Section information for display
  const sectionInfo = {
    'header': {
      icon: 'bi-type-h1',
      name: 'Encabezado',
      description: 'Título y subtítulo de la página'
    },
    'contactInfo': {
      icon: 'bi-info-circle',
      name: 'Información de Contacto',
      description: 'Teléfono, email, dirección y horarios'
    },
    'form': {
      icon: 'bi-envelope',
      name: 'Formulario de Contacto',
      description: 'Campos, opciones y personalización'
    },
    'socialMedia': {
      icon: 'bi-people',
      name: 'Redes Sociales',
      description: 'Enlaces y visibilidad de redes sociales'
    },
    'map': {
      icon: 'bi-map',
      name: 'Mapa',
      description: 'Ubicación en Google Maps'
    }
  };

  return (
    <div className="contact-page-editor">
      {/* Status alert */}
      <AlertMessage
        show={alertMessage.show}
        type={alertMessage.type}
        message={alertMessage.message}
        onClose={closeAlert}
      />

      {/* Toolbar */}
      <EditorToolbar
        previewUrl="/contacto"
        hasChanges={hasChanges}
      />

      {/* Page preview */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <ContactPagePreview config={pageConfig?.sections} />
            </div>
          </div>
        </div>
      </div>

      {/* Editable sections */}
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

              {/* Expandable content */}
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
                    <FormFieldsEditor
                      data={pageConfig.sections.form}
                      onUpdate={(newData) => handleSectionUpdate('form', newData)}
                    />
                  )}
                  {sectionId === 'socialMedia' && (
                    <SocialMediaEditor
                      data={pageConfig.sections.socialMedia}
                      onUpdate={(newData) => handleSectionUpdate('socialMedia', newData)}
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

      {/* Action buttons */}
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