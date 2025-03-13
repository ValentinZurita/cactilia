import { HeaderSectionEditor } from './HeaderSectionEditor.jsx'

/**
 * Form Fields Editor Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - Current form configuration data
 * @param {Function} props.onUpdate - Update callback for form data
 * @returns {JSX.Element}
 */
const FormFieldsEditor = ({ data = {}, onUpdate }) => {
  const [newSubjectOption, setNewSubjectOption] = useState('');

  // Get subject options with fallback to defaults
  const subjectOptions = data.subjectOptions || [
    "Consulta general",
    "Soporte técnico",
    "Ventas",
    "Otro"
  ];

  /**
   * Handles adding a new subject option
   */
  const handleAddSubjectOption = () => {
    if (!newSubjectOption.trim()) return;

    const updatedOptions = [...subjectOptions, newSubjectOption.trim()];
    onUpdate({ subjectOptions: updatedOptions });
    setNewSubjectOption('');
  };

  /**
   * Handles removing a subject option
   * @param {number} index - Index of the option to remove
   */
  const handleRemoveSubjectOption = (index) => {
    const updatedOptions = subjectOptions.filter((_, i) => i !== index);
    onUpdate({ subjectOptions: updatedOptions });
  };

  /**
   * Handles changing the order of a subject option
   * @param {number} index - Current index of the option
   * @param {number} direction - Direction to move (1 for down, -1 for up)
   */
  const handleMoveOption = (index, direction) => {
    if (
      (direction < 0 && index === 0) ||
      (direction > 0 && index === subjectOptions.length - 1)
    ) {
      return; // Can't move beyond bounds
    }

    const newOptions = [...subjectOptions];
    const newIndex = index + direction;

    // Swap elements
    [newOptions[index], newOptions[newIndex]] = [newOptions[newIndex], newOptions[index]];

    onUpdate({ subjectOptions: newOptions });
  };

  /**
   * Handles keydown events for the new option input
   * @param {Event} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubjectOption();
    }
  };

  return (
    <div className="form-fields-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Opciones del Campo Asunto</h6>

        <p className="text-muted mb-3">
          Define las opciones disponibles en el menú desplegable de asunto.
        </p>

        {/* List of current subject options */}
        <div className="card mb-3">
          <div className="card-header bg-light py-2">
            <strong>Opciones actuales</strong>
          </div>
          <div className="card-body p-0">
            {subjectOptions.length > 0 ? (
              <div className="list-group list-group-flush">
                {subjectOptions.map((option, index) => (
                  <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{option}</span>
                    <div className="btn-group">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleMoveOption(index, -1)}
                        disabled={index === 0}
                        title="Mover arriba"
                      >
                        <i className="bi bi-arrow-up"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleMoveOption(index, 1)}
                        disabled={index === subjectOptions.length - 1}
                        title="Mover abajo"
                      >
                        <i className="bi bi-arrow-down"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveSubjectOption(index)}
                        title="Eliminar opción"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center text-muted">
                No hay opciones configuradas. Añade al menos una opción.
              </div>
            )}
          </div>
        </div>

        {/* Add new subject option */}
        <div className="mb-3">
          <label className="form-label">Añadir nueva opción</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Escribe una nueva opción..."
              value={newSubjectOption}
              onChange={(e) => setNewSubjectOption(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleAddSubjectOption}
              disabled={!newSubjectOption.trim()}
            >
              <i className="bi bi-plus-lg me-1"></i>
              Añadir
            </button>
          </div>
          <div className="form-text">
            Presiona Enter o haz clic en Añadir para agregar una nueva opción.
          </div>
        </div>
      </div>
    </div>
  );
};// src/modules/admin/components/contact-editor/ContactPageEditor.jsx
import { useState, useEffect } from 'react';
import {
  getContactPageContent,
  saveContactPageContent,
  publishContactPageContent,
  DEFAULT_CONTACT_TEMPLATE
} from './contactPageService';

import { EditorActionBar } from '../homepage-editor/EditorActionBar.jsx';
import { EditorToolbar } from '../homepage-editor/EditorToolbar.jsx';
import { AlertMessage } from '../homepage-editor/AlertMessage.jsx';

/**
 * Simplified Contact Page Editor
 * Provides a streamlined interface for editing contact page content
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
          // Simplify the template - ensure it has all required structure
          const simplifiedConfig = {
            ...result.data,
            sections: {
              header: {
                title: result.data.sections?.header?.title || DEFAULT_CONTACT_TEMPLATE.sections.header.title,
                subtitle: result.data.sections?.header?.subtitle || DEFAULT_CONTACT_TEMPLATE.sections.header.subtitle,
              },
              contactInfo: {
                customPhone: result.data.sections?.contactInfo?.customPhone || '',
                customEmail: result.data.sections?.contactInfo?.customEmail || '',
                customAddress: result.data.sections?.contactInfo?.customAddress || '',
                customHours: result.data.sections?.contactInfo?.customHours || 'Lunes a Viernes: 9am - 6pm',
              },
              map: {
                showMap: true,
                embedUrl: result.data.sections?.map?.embedUrl || '',
                height: result.data.sections?.map?.height || '400px',
              },
              socialMedia: {
                items: result.data.sections?.socialMedia?.items || DEFAULT_CONTACT_TEMPLATE.sections.socialMedia.items,
              }
            }
          };

          setPageConfig(simplifiedConfig);
          setHasSavedContent(true);

          // Expand first section by default if none is expanded
          if (!expandedSection) {
            setExpandedSection('header');
          }
        } else {
          console.log('No saved data found, using simplified template');

          // Create a simplified version of the default template
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
              }
            }
          };

          setPageConfig(simplifiedTemplate);
          setHasSavedContent(false);

          // Expand first section by default
          setExpandedSection('header');
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
        showTemporaryAlert('danger', 'Error al cargar la configuración');

        // Setup a simplified default template in case of error
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
            }
          }
        };

        setPageConfig(simplifiedErrorTemplate);
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
    // Make a deep copy of the current state
    const updatedConfig = JSON.parse(JSON.stringify(pageConfig));

    // Update the specific section with new data
    updatedConfig.sections[sectionId] = {
      ...updatedConfig.sections[sectionId],
      ...newData
    };

    // Set the state with the updated configuration
    setPageConfig(updatedConfig);
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
      // Create a simplified version of the default template
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
          }
        }
      };

      setPageConfig(simplifiedTemplate);
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
      name: 'Formulario',
      description: 'Opciones del campo de asunto'
    },
    'map': {
      icon: 'bi-map',
      name: 'Mapa',
      description: 'Ubicación en Google Maps'
    },
    'socialMedia': {
      icon: 'bi-people',
      name: 'Redes Sociales',
      description: 'Enlaces a tus redes sociales'
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

/**
 * Contact Info Editor Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - Current section data
 * @param {Function} props.onUpdate - Update callback
 * @returns {JSX.Element}
 */
const ContactInfoEditor = ({ data = {}, onUpdate }) => {
  // Manejador para cambios en campos de texto
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="contact-info-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Datos de Contacto</h6>

        <div className="row g-3">
          {/* Teléfono */}
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="customPhone" className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-control"
                id="customPhone"
                value={data.customPhone || ''}
                onChange={(e) => handleChange('customPhone', e.target.value)}
                placeholder="Ej: +52 55 1234 5678"
              />
            </div>
          </div>

          {/* Email */}
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="customEmail" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="customEmail"
                value={data.customEmail || ''}
                onChange={(e) => handleChange('customEmail', e.target.value)}
                placeholder="Ej: contacto@cactilia.com"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="customAddress" className="form-label">Dirección</label>
              <textarea
                className="form-control"
                id="customAddress"
                value={data.customAddress || ''}
                onChange={(e) => handleChange('customAddress', e.target.value)}
                placeholder="Ej: Av. Siempre Viva 742, CDMX"
                rows="2"
              />
            </div>
          </div>

          {/* Horario */}
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="customHours" className="form-label">Horario</label>
              <input
                type="text"
                className="form-control"
                id="customHours"
                value={data.customHours || ''}
                onChange={(e) => handleChange('customHours', e.target.value)}
                placeholder="Ej: Lunes a Viernes: 9am - 6pm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Map Section Editor Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - Current section data
 * @param {Function} props.onUpdate - Update callback
 * @returns {JSX.Element}
 */
const MapSectionEditor = ({ data = {}, onUpdate }) => {
  // Manejador para cambios en campos de texto
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  // Manejador para cambios en campos booleanos (toggles)
  const handleToggleChange = (field) => {
    onUpdate({ [field]: !data[field] });
  };

  return (
    <div className="map-section-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Configuración del Mapa</h6>

        {/* Mostrar mapa toggle */}
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="showMap"
            checked={data.showMap !== false}
            onChange={() => handleToggleChange('showMap')}
          />
          <label className="form-check-label" htmlFor="showMap">
            Mostrar mapa de ubicación
          </label>
        </div>

        {data.showMap !== false && (
          <>
            {/* URL de Google Maps */}
            <div className="mb-3">
              <label htmlFor="embedUrl" className="form-label">URL de inserción de Google Maps</label>
              <textarea
                className="form-control"
                id="embedUrl"
                value={data.embedUrl || ''}
                onChange={(e) => handleChange('embedUrl', e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                rows="3"
              />
              <div className="form-text">
                <small>
                  Para obtener esta URL, ve a Google Maps, busca tu ubicación, haz clic en "Compartir", selecciona "Insertar un mapa" y copia solo la URL del iframe.
                </small>
              </div>
            </div>

            {/* Vista previa del mapa */}
            <div className="mb-3">
              <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Vista Previa del Mapa</h6>

              {data.embedUrl ? (
                <div className="map-preview">
                  <iframe
                    src={data.embedUrl}
                    width="100%"
                    height="300px"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps"
                  ></iframe>
                </div>
              ) : (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Ingresa una URL de inserción para ver la vista previa del mapa
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Social Media Editor Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - Current section data
 * @param {Function} props.onUpdate - Update callback
 * @returns {JSX.Element}
 */
const SocialMediaEditor = ({ data = {}, onUpdate }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({ label: '', icon: '', url: '', visible: true });
  const [newSocialForm, setNewSocialForm] = useState({ label: '', icon: '', url: '', visible: true });
  const [showAddForm, setShowAddForm] = useState(false);

  // Ensure we have items array
  const socialItems = data.items || [];

  /**
   * Handles changes in social media items
   * @param {number} index - Item index
   * @param {string} field - Field to update
   * @param {any} value - New value
   */
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...socialItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    onUpdate({ items: updatedItems });
  };

  /**
   * Starts editing a social media item
   * @param {number} index - Item index
   */
  const startEditing = (index) => {
    setEditingIndex(index);
    setEditForm(socialItems[index]);
  };

  /**
   * Saves the edited social media item
   */
  const saveEdit = () => {
    if (editingIndex !== null) {
      const updatedItems = [...socialItems];
      updatedItems[editingIndex] = { ...editForm };
      onUpdate({ items: updatedItems });
      setEditingIndex(null);
    }
  };

  /**
   * Cancels the current edit
   */
  const cancelEdit = () => {
    setEditingIndex(null);
  };

  /**
   * Toggles visibility of a social media item
   * @param {number} index - Item index to toggle
   */
  const toggleVisibility = (index) => {
    const updatedItems = [...socialItems];
    updatedItems[index] = {
      ...updatedItems[index],
      visible: updatedItems[index].visible !== false ? false : true
    };
    onUpdate({ items: updatedItems });
  };

  /**
   * Adds a new social media item
   */
  const addNewSocialMedia = () => {
    if (!newSocialForm.label || !newSocialForm.icon || !newSocialForm.url) {
      alert("Por favor completa todos los campos");
      return;
    }

    const updatedItems = [...socialItems, { ...newSocialForm }];
    onUpdate({ items: updatedItems });
    setNewSocialForm({ label: '', icon: '', url: '', visible: true });
    setShowAddForm(false);
  };

  /**
   * Removes a social media item
   * @param {number} index - Item index to remove
   */
  const removeSocialMedia = (index) => {
    if (window.confirm(`¿Estás seguro de eliminar ${socialItems[index].label}?`)) {
      const updatedItems = socialItems.filter((_, i) => i !== index);
      onUpdate({ items: updatedItems });
    }
  };

  return (
    <div className="social-media-editor">
      <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Redes Sociales</h6>

      <div className="social-media-list">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mb-0">
            Configura los enlaces a tus redes sociales:
          </p>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <i className="bi bi-plus-lg me-1"></i> Añadir Red Social
          </button>
        </div>

        {/* Form to add new social media */}
        {showAddForm && (
          <div className="add-social-form mb-4 p-3 border rounded bg-light">
            <h6 className="mb-3 border-bottom pb-2">Añadir Nueva Red Social</h6>
            <div className="mb-2">
              <label className="form-label">Red Social</label>
              <input
                type="text"
                className="form-control"
                value={newSocialForm.label}
                onChange={(e) => setNewSocialForm({...newSocialForm, label: e.target.value})}
                placeholder="Ej: Facebook"
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Ícono</label>
              <input
                type="text"
                className="form-control"
                value={newSocialForm.icon}
                onChange={(e) => setNewSocialForm({...newSocialForm, icon: e.target.value})}
                placeholder="Ej: bi-facebook"
              />
              <div className="form-text">
                Usa clases de <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener noreferrer">Bootstrap Icons</a> (bi-facebook, bi-instagram, etc.)
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">URL</label>
              <input
                type="url"
                className="form-control"
                value={newSocialForm.url}
                onChange={(e) => setNewSocialForm({...newSocialForm, url: e.target.value})}
                placeholder="https://..."
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={addNewSocialMedia}
              >
                Añadir
              </button>
            </div>
          </div>
        )}

        {socialItems.length === 0 ? (
          <div className="alert alert-info">
            No hay redes sociales configuradas. Añade una haciendo clic en el botón.
          </div>
        ) : (
          socialItems.map((socialItem, index) => (
            <div
              key={index}
              className={`social-media-item mb-3 p-3 rounded border ${socialItem.visible === false ? 'bg-light' : 'bg-white'}`}
            >
              {editingIndex === index ? (
                // Edit form
                <div className="edit-form">
                  <div className="mb-2">
                    <label className="form-label">Red Social</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.label}
                      onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                      placeholder="Ej: Facebook"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Ícono</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.icon}
                      onChange={(e) => setEditForm({...editForm, icon: e.target.value})}
                      placeholder="Ej: bi-facebook"
                    />
                    <div className="form-text">
                      Usa clases de <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener noreferrer">Bootstrap Icons</a> (bi-facebook, bi-instagram, etc.)
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={editForm.url}
                      onChange={(e) => setEditForm({...editForm, url: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={cancelEdit}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={saveEdit}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                // Display view
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <i className={`bi ${socialItem.icon} me-2 fs-4 ${socialItem.visible === false ? 'text-muted' : ''}`}></i>
                    <span className={`fw-medium ${socialItem.visible === false ? 'text-muted' : ''}`}>{socialItem.label}</span>

                    <div className="ms-auto d-flex">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => toggleVisibility(index)}
                        title={socialItem.visible === false ? "Mostrar" : "Ocultar"}
                      >
                        <i className={`bi ${socialItem.visible === false ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => startEditing(index)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeSocialMedia(index)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <input
                      type="text"
                      className={`form-control ${socialItem.visible === false ? 'bg-light text-muted' : 'bg-white'}`}
                      value={socialItem.url}
                      readOnly
                    />
                    <a
                      href={socialItem.url}
                      className="btn btn-outline-secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-box-arrow-up-right"></i>
                    </a>
                  </div>

                  {socialItem.visible === false && (
                    <div className="mt-2 small text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Esta red social está oculta en la página
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactPageEditor;