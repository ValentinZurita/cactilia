import { useState, useEffect } from 'react';
import { ShopBannerEditor } from './ShopBannerEditor';
import { DEFAULT_SHOP_TEMPLATE } from './shopPageService';
import { getShopPageContent, saveShopPageContent, publishShopPageContent } from './shopPageService';
import { ActionButtons } from './ActionButton.jsx'

/**
 * Editor principal para la página de tienda
 * Permite personalizar el banner superior de la tienda
 */
const ShopPageEditor = () => {
  // Estado principal
  const [pageConfig, setPageConfig] = useState(null);
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
        const result = await getShopPageContent();

        if (result.ok && result.data) {
          setPageConfig(result.data);
          setHasSavedContent(true);
        } else {
          console.log('No se encontraron datos, usando valores predeterminados');
          setPageConfig({ ...DEFAULT_SHOP_TEMPLATE });
          setHasSavedContent(false);
        }
      } catch (error) {
        console.error('Error cargando la configuración:', error);
        setShowAlert({
          show: true,
          type: 'danger',
          message: 'Error al cargar la configuración'
        });
        setPageConfig({ ...DEFAULT_SHOP_TEMPLATE });
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Actualizar la sección del banner
  const handleBannerUpdate = (newData) => {
    setPageConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        banner: {
          ...prev.sections.banner,
          ...newData
        }
      }
    }));
    setHasChanges(true);
  };

  // Mostrar alerta temporal
  const showTemporaryAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => setShowAlert({ show: false, type: '', message: '' }), 3000);
  };

  // Guardar borrador
  const handleSave = async () => {
    try {
      setSaving(true);

      // Crear una copia profunda para evitar problemas de referencia
      const updatedConfig = JSON.parse(JSON.stringify(pageConfig));

      const result = await saveShopPageContent(updatedConfig);

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

      const saveResult = await saveShopPageContent(updatedConfig);

      if (!saveResult.ok) {
        throw new Error(saveResult.error || 'Error al guardar antes de publicar');
      }

      const publishResult = await publishShopPageContent();

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
      setPageConfig({ ...DEFAULT_SHOP_TEMPLATE });
      setHasChanges(true);
      showTemporaryAlert('warning', 'Se ha restaurado la configuración predeterminada');
    }
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

  return (
    <div className="shop-page-editor">
      {/* Alerta de estado mejorada */}
      {showAlert.show && (
        <div className={`alert alert-${showAlert.type} alert-dismissible fade show`}
             style={{
               position: 'fixed',
               top: '1rem',
               right: '1rem',
               zIndex: 1050,
               maxWidth: '90%',
               boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
             }}
             role="alert">
          <div className="d-flex align-items-center">
            <i className={`bi ${showAlert.type === 'success' ? 'bi-check-circle' : showAlert.type === 'warning' ? 'bi-exclamation-triangle' : 'bi-exclamation-circle'} fs-5 me-2`}></i>
            <div>{showAlert.message}</div>
          </div>
          <button type="button" className="btn-close" onClick={() => setShowAlert({ show: false })}></button>
        </div>
      )}

      {/* Card de herramientas superior */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-12">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => window.open('/shop', '_blank')}
                title="Ver la página en una nueva ventana"
              >
                <i className="bi bi-eye me-2"></i>
                Previsualizar tienda
              </button>
            </div>
          </div>

          {/* Indicador de cambios pendientes */}
          {hasChanges && (
            <div className="mt-3 alert alert-warning py-2 mb-0">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Tienes cambios sin guardar
            </div>
          )}
        </div>
      </div>

      {/* Editor del banner */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm mb-4">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center py-3">
              <div className="d-flex align-items-center">
                <div className="section-icon d-flex align-items-center justify-content-center me-3"
                     style={{
                       width: '40px',
                       height: '40px',
                       borderRadius: '8px',
                       backgroundColor: 'rgba(13, 110, 253, 0.1)',
                       color: '#0d6efd'
                     }}>
                  <i className="bi bi-image fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">Banner de Tienda</h6>
                  <p className="text-muted small mb-0">
                    Personaliza la apariencia del banner de la tienda
                  </p>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              <ShopBannerEditor
                data={pageConfig.sections.banner}
                onUpdate={handleBannerUpdate}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción con anclaje al fondo */}
      <div className="sticky-action-bar card shadow-sm"
           style={{
             position: 'sticky',
             bottom: '0',
             zIndex: '1020',
             marginTop: '1rem',
             borderTop: '1px solid #dee2e6',
             borderRadius: '0'
           }}>
        <div className="card-body py-3">
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
    </div>
  );
};

export default ShopPageEditor;