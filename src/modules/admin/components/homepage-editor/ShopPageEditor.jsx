import { useState, useEffect } from 'react';
import { ShopBannerEditor } from './ShopBannerEditor';
import { DEFAULT_SHOP_TEMPLATE } from './shopPageService';
import { getShopPageContent, saveShopPageContent, publishShopPageContent } from './shopPageService';
import { EditorActionBar } from './EditorActionBar.jsx'
import { EditorToolbar } from './EditorToolbar.jsx'
import { AlertMessage } from './AlertMessage.jsx'
import { ShopBannerPreview } from './ShopBannePreview.jsx'

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
  const [alertMessage, setAlertMessage] = useState({ show: false, type: '', message: '' });
  // Estado para controlar la expansión del banner
  const [bannerExpanded, setBannerExpanded] = useState(true);

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
        showTemporaryAlert('danger', 'Error al cargar la configuración');
        setPageConfig({ ...DEFAULT_SHOP_TEMPLATE });
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Manejador para expandir/contraer la sección del banner
  const toggleBannerExpanded = () => {
    setBannerExpanded(!bannerExpanded);
  };

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
      <AlertMessage
        show={alertMessage.show}
        type={alertMessage.type}
        message={alertMessage.message}
        onClose={closeAlert}
      />

      {/* Barra de herramientas */}
      <EditorToolbar
        previewUrl="/shop"
        hasChanges={hasChanges}
      />

      {/* Vista previa */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <ShopBannerPreview config={pageConfig.sections.banner} />
            </div>
          </div>
        </div>
      </div>

      {/* Editor del banner - Ahora expandible/contraíble */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div
              className="card-header d-flex flex-wrap justify-content-between align-items-center py-3"
              onClick={toggleBannerExpanded}
              style={{
                cursor: 'pointer',
                background: bannerExpanded ? '#f8f9fa' : 'white'
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
                  <i className="bi bi-image fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">Banner de Tienda</h6>
                  <p className="text-muted small mb-0">
                    Personaliza la apariencia del banner de la tienda
                  </p>
                </div>
              </div>
              <i className={`bi ${bannerExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} fs-4 text-muted`}></i>
            </div>

            {/* Contenido expandible/contraíble */}
            {bannerExpanded && (
              <div className="card-body border-top p-4">
                <ShopBannerEditor
                  data={pageConfig.sections.banner}
                  onUpdate={handleBannerUpdate}
                />
              </div>
            )}
          </div>
        </div>
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

export default ShopPageEditor;