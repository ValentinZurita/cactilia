import { useState, useEffect } from 'react';
import { SectionEditor } from './SectionEditor';
import { PreviewPanel } from './PreviewPanel';
import { ActionButtons } from './ActionButton.jsx'
import { getHomePageContent, saveHomePageContent, publishHomePageContent } from './homepageService.js'
import { DEFAULT_TEMPLATE } from './templateData.js'

/**
 * Editor principal para la página de inicio
 * Maneja la carga, edición, guardado y publicación de configuración de la homepage
 */
const HomePageEditor = () => {
  // Estado principal para la configuración de la página
  const [pageConfig, setPageConfig] = useState(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasSavedContent, setHasSavedContent] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });

  // Cargar la configuración al iniciar
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const result = await getHomePageContent();

        if (result.ok && result.data) {
          setPageConfig(result.data);
          setHasSavedContent(true); // Hay contenido guardado que podemos publicar
        } else {
          // Si no hay configuración guardada, usar la predeterminada
          setPageConfig({ ...DEFAULT_TEMPLATE });
          setHasSavedContent(false);
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

  // Mostrar alerta y ocultarla después de un tiempo
  const showTemporaryAlert = (type, message) => {
    setShowAlert({
      show: true,
      type,
      message
    });

    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  // Guardar borrador
  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await saveHomePageContent(pageConfig);

      if (result.ok) {
        showTemporaryAlert('success', 'Borrador guardado correctamente');
        setHasChanges(false);
        setHasSavedContent(true); // Activar que hay contenido guardado para publicar
      } else {
        throw new Error(result.error || 'Error desconocido al guardar');
      }
    } catch (error) {
      console.error('Error guardando la configuración:', error);
      showTemporaryAlert('danger', `Error al guardar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Publicar cambios
  const handlePublish = async () => {
    try {
      setPublishing(true);

      // Guardar primero para asegurarnos de tener la última versión
      const saveResult = await saveHomePageContent(pageConfig);
      if (!saveResult.ok) {
        throw new Error(saveResult.error || 'Error al guardar antes de publicar');
      }

      // Luego publicar
      const publishResult = await publishHomePageContent();

      if (publishResult.ok) {
        showTemporaryAlert('success', '✅ Cambios publicados correctamente. Ya son visibles en la página web.');
        setHasChanges(false);
      } else {
        throw new Error(publishResult.error || 'Error desconocido al publicar');
      }
    } catch (error) {
      console.error('Error publicando la configuración:', error);
      showTemporaryAlert('danger', `Error al publicar: ${error.message}`);
    } finally {
      setPublishing(false);
    }
  };

  // Resetear a la plantilla predeterminada
  const handleReset = () => {
    if (window.confirm('¿Estás seguro de resetear la configuración a la plantilla predeterminada? Perderás todos los cambios.')) {
      setPageConfig({ ...DEFAULT_TEMPLATE });
      setActiveSection('hero');
      setHasChanges(true);
    }
  };

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="ms-3 mb-0">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="homepage-editor">
      {/* Alerta de estado */}
      {showAlert.show && (
        <div className={`alert alert-${showAlert.type} alert-dismissible fade show`} role="alert">
          <div className="d-flex align-items-center">
            <i className={`bi ${showAlert.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} fs-4 me-2`}></i>
            <div>{showAlert.message}</div>
          </div>
          <button type="button" className="btn-close" onClick={() => setShowAlert({ show: false })}></button>
        </div>
      )}

      {/* Explicación del flujo de trabajo */}
      <div className="alert alert-info mb-4 d-flex">
        <i className="bi bi-info-circle-fill fs-4 me-2"></i>
        <div>
          <strong>Cómo funciona:</strong> Los cambios que realices no serán visibles en tu sitio hasta que hagas clic en "Publicar cambios".
          Puedes guardar un borrador en cualquier momento.
        </div>
      </div>

      <div className="row g-4">
        {/* Panel izquierdo con pestañas de secciones */}
        <div className="col-lg-5">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bi bi-pencil-square text-primary me-2"></i>
                Editor de Secciones
              </h5>
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
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bi bi-eye text-primary me-2"></i>
                Vista Previa
              </h5>
              <span className="badge bg-primary">
                <i className="bi bi-display me-1"></i>
                Previsualización
              </span>
            </div>
            <div className="card-body p-0">
              {pageConfig && (
                <div className="position-relative">
                  <div className="position-absolute top-0 end-0 z-index-10 m-2">
                    <span className="badge bg-warning text-dark px-3 py-2">
                      <i className="bi bi-eye-fill me-1"></i>
                      VISTA PREVIA
                    </span>
                  </div>
                  <PreviewPanel config={pageConfig} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-4">
        <ActionButtons
          onSave={handleSave}
          onPublish={handlePublish}
          onReset={handleReset}
          saving={saving}
          publishing={publishing}
          hasChanges={hasChanges}
          hasSavedContent={hasSavedContent}
        />
      </div>
    </div>
  );
};

export default HomePageEditor;