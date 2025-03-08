import { useState, useEffect } from 'react';
import { TemplateSelector } from './TemplateSelector';
import { SectionEditor } from './SectionEditor';
import { PreviewPanel } from './PreviewPanel';
import { ActionButtons } from './ActionButton.jsx'
import { getHomePageContent, saveHomePageContent } from './homepageService.js'
import { DEFAULT_TEMPLATE } from './templateData.js'

/**
 * Editor principal para la página de inicio
 * Maneja la carga, edición y guardado de configuración de la homepage
 */
const HomePageEditor = () => {
  // Estado principal para la configuración de la página
  const [pageConfig, setPageConfig] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });

  // Cargar la configuración al iniciar
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const result = await getHomePageContent();

        if (result.ok && result.data) {
          setPageConfig(result.data);
          // Identificar la plantilla según la configuración cargada
          setSelectedTemplate(result.data.templateId || 'default');
        } else {
          // Si no hay configuración guardada, usar la predeterminada
          setPageConfig({ ...DEFAULT_TEMPLATE });
          setSelectedTemplate('default');
        }
      } catch (error) {
        console.error('Error cargando la configuración:', error);
        setShowAlert({
          show: true,
          type: 'danger',
          message: 'Error al cargar la configuración de la página'
        });
        // En caso de error, usar la plantilla predeterminada
        setPageConfig({ ...DEFAULT_TEMPLATE });
        setSelectedTemplate('default');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Manejar cambio de plantilla
  const handleTemplateChange = (templateId) => {
    if (hasChanges) {
      if (!window.confirm('Hay cambios sin guardar. ¿Deseas cambiar de plantilla y perder estos cambios?')) {
        return;
      }
    }

    // Obtener la plantilla y aplicarla
    const newTemplate = templatesData.find(t => t.id === templateId) || DEFAULT_TEMPLATE;
    setPageConfig({ ...newTemplate });
    setSelectedTemplate(templateId);
    setActiveSection('hero'); // Resetear a la primera sección
    setHasChanges(true);
  };

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

  // Guardar la configuración
  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await saveHomePageContent(pageConfig);

      if (result.ok) {
        setShowAlert({
          show: true,
          type: 'success',
          message: 'Configuración guardada correctamente'
        });
        setHasChanges(false);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error guardando la configuración:', error);
      setShowAlert({
        show: true,
        type: 'danger',
        message: `Error al guardar: ${error.message}`
      });
    } finally {
      setSaving(false);

      // Ocultar la alerta después de 3 segundos
      setTimeout(() => {
        setShowAlert({ show: false, type: '', message: '' });
      }, 3000);
    }
  };

  // Resetear a la plantilla predeterminada
  const handleReset = () => {
    if (window.confirm('¿Estás seguro de resetear la configuración a la plantilla predeterminada? Perderás todos los cambios.')) {
      setPageConfig({ ...DEFAULT_TEMPLATE });
      setSelectedTemplate('default');
      setActiveSection('hero');
      setHasChanges(true);
    }
  };

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando configuración de la página...</p>
      </div>
    );
  }

  return (
    <div className="homepage-editor">
      {/* Alerta de estado */}
      {showAlert.show && (
        <div className={`alert alert-${showAlert.type} alert-dismissible fade show`} role="alert">
          {showAlert.message}
          <button type="button" className="btn-close" onClick={() => setShowAlert({ show: false })}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Panel izquierdo - Controles de edición */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Plantilla</h5>
            </div>
            <div className="card-body">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleTemplateChange}
              />
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Editar secciones</h5>
            </div>
            <div className="card-body p-0">
              {pageConfig && (
                <SectionEditor
                  sections={pageConfig.sections}
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                  onUpdateSection={handleSectionUpdate}
                />
              )}
            </div>
          </div>
        </div>

        {/* Panel derecho - Vista previa */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Vista previa</h5>
              <span className="badge bg-secondary">Previsualización</span>
            </div>
            <div className="card-body p-0">
              {pageConfig && (
                <PreviewPanel config={pageConfig} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <ActionButtons
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
        hasChanges={hasChanges}
      />
    </div>
  );
};

export default HomePageEditor;