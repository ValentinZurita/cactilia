import { EditorActionBar } from '../shared/EditorActionBar.jsx';
import { EditorToolbar } from '../shared/EditorToolbar.jsx';
import { AlertMessage } from '../shared/AlertMessage.jsx';
import { useContactPageEditor } from './useContactPageEditor.js';
import { HeaderSectionEditor } from './HeaderSectionEditor.jsx';
import { ContactInfoEditor } from './ContactInfoEditor.jsx';
import { FormFieldsEditor } from './FormFieldsEditor.jsx';
import { MapSectionEditor } from './MapSectionEditor.jsx';
import { SocialMediaEditor } from './SocialMediaEditor.jsx';

/**
 * Componente principal que orquesta la edición de la página de contacto.
 * Utiliza el custom hook `useContactPageEditor()` para la lógica y states,
 * y se apoya en pequeñas funciones internas para renderizar cada parte.
 */
export default function ContactPageEditor() {
  // =========================================================================
  // 1. Extraer estados y funciones esenciales del custom hook
  // =========================================================================
  const {
    pageConfig,
    loading,
    saving,
    publishing,
    hasChanges,
    hasSavedContent,
    alertMessage,
    expandedSection,
    closeAlert,
    toggleSection,
    handleSectionUpdate,
    handleSave,
    handlePublish,
    handleReset
  } = useContactPageEditor();

  // =========================================================================
  // 2. Definir la información de cada sección (ícono, nombre, descripción)
  // =========================================================================
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

  // =========================================================================
  // 3. Render condicional: mostrar spinner si está cargando
  // =========================================================================
  if (loading) {
    return renderLoadingSpinner();
  }

  // =========================================================================
  // 4. Render principal del componente
  // =========================================================================
  return (
    <div className="contact-page-editor">
      {/* 4.1 Alerta de estado (éxito, error, etc.) */}
      {renderAlertMessage()}

      {/* 4.2 Barra de herramientas (Preview y notificación de cambios) */}
      {renderEditorToolbar()}

      {/* 4.3 Listado de secciones (Encabezado, Contacto, Form, etc.) */}
      {renderSectionList()}

      {/* 4.4 Barra de acciones (Guardar, Publicar, Reset) */}
      {renderEditorActionBar()}
    </div>
  );

  // =========================================================================
  // 5. Funciones locales de render (para seccionar la UI y mantener el return limpio)
  // =========================================================================

  /**
   * Renderiza el spinner de carga cuando `loading` es true.
   */
  function renderLoadingSpinner() {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="ms-3 mb-0 h5">Cargando editor...</p>
      </div>
    );
  }

  /**
   * Muestra el componente de alerta cuando haya mensaje activo.
   */
  function renderAlertMessage() {
    return (
      <AlertMessage
        show={alertMessage.show}
        type={alertMessage.type}
        message={alertMessage.message}
        onClose={closeAlert}
      />
    );
  }

  /**
   * Barra superior con botón "Ver Vista Previa" y etiqueta "Tienes cambios sin guardar".
   */
  function renderEditorToolbar() {
    return (
      <EditorToolbar
        previewUrl="/contacto"
        hasChanges={hasChanges}
      />
    );
  }

  /**
   * Lista (map) de todas las secciones definidas en `sectionInfo`.
   * Cada sección se renderiza dentro de una card con un header clicable para
   * expandir o contraer, y el contenido seccionado en `renderSectionEditor`.
   */
  function renderSectionList() {
    return (
      <div className="row g-3 mb-4">
        {Object.keys(sectionInfo).map(sectionId => renderSectionCard(sectionId))}
      </div>
    );
  }

  /**
   * Renderiza la card contenedora de cada sección (header + editor expandible).
   */
  function renderSectionCard(sectionId) {
    const { icon, name, description } = sectionInfo[sectionId] || {};

    return (
      <div className="col-12" key={sectionId}>
        <div className="card shadow-sm">
          {/* Encabezado clicable de la sección */}
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
                <i className={`bi ${icon || 'bi-square'} fs-4`} />
              </div>
              <div>
                <h6 className="mb-0 fw-bold">{name || sectionId}</h6>
                <p className="text-muted small mb-0">{description || ''}</p>
              </div>
            </div>
            <i
              className={`bi ${
                expandedSection === sectionId ? 'bi-chevron-up' : 'bi-chevron-down'
              } fs-4 text-muted`}
            />
          </div>

          {/* Contenido expandible: solo se muestra si coincide con la sección expandida */}
          {expandedSection === sectionId && pageConfig && (
            <div className="card-body border-top p-4">
              {renderSectionEditor(sectionId)}
            </div>
          )}
        </div>
      </div>
    );
  }

  /**
   * Muestra el editor apropiado para cada sección (encabezado, contacto, etc.).
   */
  function renderSectionEditor(sectionId) {
    const sections = pageConfig?.sections || {};
    const currentData = sections[sectionId];

    switch (sectionId) {
      case 'header':
        return (
          <HeaderSectionEditor
            data={currentData}
            onUpdate={(newData) => handleSectionUpdate('header', newData)}
          />
        );

      case 'contactInfo':
        return (
          <ContactInfoEditor
            data={currentData}
            onUpdate={(newData) => handleSectionUpdate('contactInfo', newData)}
          />
        );

      case 'form':
        return (
          <FormFieldsEditor
            data={currentData}
            onUpdate={(newData) => handleSectionUpdate('form', newData)}
          />
        );

      case 'map':
        return (
          <MapSectionEditor
            data={currentData}
            onUpdate={(newData) => handleSectionUpdate('map', newData)}
          />
        );

      case 'socialMedia':
        return (
          <SocialMediaEditor
            data={currentData}
            onUpdate={(newData) => handleSectionUpdate('socialMedia', newData)}
          />
        );

      default:
        return <p className="text-muted">No se encontró un editor para esta sección.</p>;
    }
  }

  /**
   * Barra de acciones al final (Guardar, Publicar, Reset), incluyendo su estado (saving, etc.).
   */
  function renderEditorActionBar() {
    return (
      <EditorActionBar
        onSave={handleSave}
        onPublish={handlePublish}
        onReset={handleReset}
        saving={saving}
        publishing={publishing}
        hasChanges={hasChanges}
        hasSavedContent={hasSavedContent}
      />
    );
  }
}
