import { useState, useEffect } from 'react';
import { HeroSectionEditor } from './HeroSectionEditor.jsx';
import { FarmCarouselEditor } from './FarmCarouselEditor.jsx';
import { ProductCategoriesEditor } from '../shop/ProductCategoriesEditor.jsx';
import { DEFAULT_TEMPLATE } from './templateData.js';
import { getHomePageContent, saveHomePageContent, publishHomePageContent } from './homepageService.js';
import { FeaturedProductsEditor } from './FeaturedProducstEditor.jsx';
import { EditorActionBar } from '../shared/EditorActionBar.jsx'
import { EditorToolbar } from '../shared/EditorToolbar.jsx'
import { AlertMessage } from '../shared/AlertMessage.jsx'


/**
 * Editor principal para la página de inicio - Versión rediseñada
 * Enfoque mobile-first con sistema de cards y UX mejorada
 */
const HomePageEditor = () => {
  // Estado principal
  const [pageConfig, setPageConfig] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasSavedContent, setHasSavedContent] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ show: false, type: '', message: '' });
  const [isReordering, setIsReordering] = useState(false);
  const [sectionOrder, setSectionOrder] = useState([]);

  // Cargar la configuración al iniciar
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const result = await getHomePageContent();

        if (result.ok && result.data) {
          setPageConfig(result.data);

          // Inicializar el orden de secciones con blockOrder si existe,
          // o con las claves de sections si no hay blockOrder
          const orderToUse = result.data.blockOrder && Array.isArray(result.data.blockOrder) && result.data.blockOrder.length > 0
            ? result.data.blockOrder
            : Object.keys(result.data.sections || {});

          setSectionOrder(orderToUse);

          // Intentar restaurar la sección expandida desde localStorage
          const savedExpandedSection = localStorage.getItem('homepageEditor_expandedSection');
          if (savedExpandedSection && orderToUse.includes(savedExpandedSection)) {
            setExpandedSection(savedExpandedSection);
          }

          setHasSavedContent(true);
        } else {
          console.log(
            'No se encontraron datos publicados, usando valores predeterminados'
          );
          setPageConfig({ ...DEFAULT_TEMPLATE });
          setSectionOrder(DEFAULT_TEMPLATE.blockOrder || Object.keys(DEFAULT_TEMPLATE.sections || {}));
          setHasSavedContent(false);
        }
      } catch (error) {
        console.error('Error cargando la configuración:', error);
        showTemporaryAlert('danger', 'Error al cargar la configuración');
        setPageConfig({ ...DEFAULT_TEMPLATE });
        setSectionOrder(DEFAULT_TEMPLATE.blockOrder || Object.keys(DEFAULT_TEMPLATE.sections || {}));
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Guarda la sección expandida en localStorage cuando cambia
  useEffect(() => {
    if (expandedSection) {
      localStorage.setItem('homepageEditor_expandedSection', expandedSection);
    } else {
      localStorage.removeItem('homepageEditor_expandedSection');
    }
  }, [expandedSection]);

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

      // Asegurar que blockOrder refleja el orden actual en el editor
      updatedConfig.blockOrder = [...sectionOrder];

      console.log('Guardando configuración con orden:', updatedConfig.blockOrder);

      const result = await saveHomePageContent(updatedConfig);

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

      // Asegurar que el orden actualizado se guarde antes de publicar
      const updatedConfig = JSON.parse(JSON.stringify(pageConfig));
      updatedConfig.blockOrder = [...sectionOrder];

      const saveResult = await saveHomePageContent(updatedConfig);

      if (!saveResult.ok) {
        throw new Error(saveResult.error || 'Error al guardar antes de publicar');
      }

      const publishResult = await publishHomePageContent();

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
      setPageConfig({ ...DEFAULT_TEMPLATE });
      setSectionOrder(DEFAULT_TEMPLATE.blockOrder || Object.keys(DEFAULT_TEMPLATE.sections));
      setExpandedSection(null);
      localStorage.removeItem('homepageEditor_expandedSection');
      setHasChanges(true);
      showTemporaryAlert('warning', 'Se ha restaurado la configuración predeterminada');
    }
  };

  // Controlador para expandir/colapsar secciones
  const toggleSection = (sectionId) => {
    if (isReordering) return; // No expandir/colapsar durante reordenamiento
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Habilitar/deshabilitar modo de reordenamiento
  const toggleReorderMode = () => {
    setIsReordering(!isReordering);
    setExpandedSection(null); // Cerrar cualquier sección expandida
  };

  // Mover una sección hacia arriba
  const moveSectionUp = (index) => {
    if (index <= 0) return;
    const newOrder = [...sectionOrder];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setSectionOrder(newOrder);
    setHasChanges(true);
  };

  // Mover una sección hacia abajo
  const moveSectionDown = (index) => {
    if (index >= sectionOrder.length - 1) return;
    const newOrder = [...sectionOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSectionOrder(newOrder);
    setHasChanges(true);
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
    'hero': {
      icon: 'bi-image',
      name: 'Banner Principal',
      description: 'Personaliza la primera impresión'
    },
    'featuredProducts': {
      icon: 'bi-star',
      name: 'Productos Destacados',
      description: 'Muestra tus mejores productos'
    },
    'farmCarousel': {
      icon: 'bi-images',
      name: 'Carrusel de Granja',
      description: 'Galería de imágenes y contenido'
    },
    'productCategories': {
      icon: 'bi-grid',
      name: 'Categorías de Productos',
      description: 'Organiza tu catálogo'
    }
  };

  // Renderizar el editor para una sección específica
  const renderSectionEditor = (sectionId) => {
    const sectionData = pageConfig.sections[sectionId];

    if (!sectionData) return null;

    switch (sectionId) {
      case 'hero':
        return <HeroSectionEditor data={sectionData} onUpdate={(newData) => handleSectionUpdate('hero', newData)} />;
      case 'featuredProducts':
        return <FeaturedProductsEditor data={sectionData} onUpdate={(newData) => handleSectionUpdate('featuredProducts', newData)} />;
      case 'farmCarousel':
        return <FarmCarouselEditor data={sectionData} onUpdate={(newData) => handleSectionUpdate('farmCarousel', newData)} />;
      case 'productCategories':
        return <ProductCategoriesEditor data={sectionData} onUpdate={(newData) => handleSectionUpdate('productCategories', newData)} />;
      default:
        return null;
    }
  };

  return (
    <div className="homepage-editor">
      {/* Alerta de estado mejorada */}
      <AlertMessage
        show={alertMessage.show}
        type={alertMessage.type}
        message={alertMessage.message}
        onClose={closeAlert}
      />

      {/* Barra de herramientas */}
      <EditorToolbar
        previewUrl="/"
        showReordering={true}
        isReordering={isReordering}
        onToggleReordering={toggleReorderMode}
        hasChanges={hasChanges}
      />

      {/* Cards de secciones mejoradas */}
      <div className="row g-3 mb-4">
        {sectionOrder.map((sectionId, index) => (
          <div className="col-12" key={sectionId}>
            <div className={`card shadow-sm ${isReordering ? 'border-primary' : ''}`}>
              <div
                className="card-header d-flex flex-wrap justify-content-between align-items-center py-3"
                onClick={() => toggleSection(sectionId)}
                style={{
                  cursor: isReordering ? 'move' : 'pointer',
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

                {isReordering ? (
                  <div className="d-flex mt-2 mt-sm-0">
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={(e) => { e.stopPropagation(); moveSectionUp(index); }}
                      disabled={index === 0}
                      style={{width: '38px', height: '38px'}}
                    >
                      <i className="bi bi-arrow-up"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={(e) => { e.stopPropagation(); moveSectionDown(index); }}
                      disabled={index === sectionOrder.length - 1}
                      style={{width: '38px', height: '38px'}}
                    >
                      <i className="bi bi-arrow-down"></i>
                    </button>
                  </div>
                ) : (
                  <i className={`bi ${expandedSection === sectionId ? 'bi-chevron-up' : 'bi-chevron-down'} fs-4 text-muted`}></i>
                )}
              </div>

              {expandedSection === sectionId && !isReordering && (
                <div className="card-body border-top p-4">
                  {renderSectionEditor(sectionId)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Botones de acción con anclaje al fondo */}
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

export default HomePageEditor;