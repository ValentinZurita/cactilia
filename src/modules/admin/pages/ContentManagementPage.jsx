import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContentManager } from '../components/content/PageContentManager';
import { BlockPreview } from '../components/content/BlockPreview';
import { usePageContent } from '../hooks/usePageContent';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice';

/**
 * Página de gestión de contenido mejorada
 * Permite configurar el contenido de las diferentes páginas del sitio
 * con previsualización en vivo y flujo de publicación
 *
 * @returns {JSX.Element}
 */
export const ContentManagementPage = () => {
  // Obtener el pageId de la URL o usar 'home' por defecto
  const { pageId = 'home' } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Estado para la página seleccionada
  const [selectedPage, setSelectedPage] = useState(pageId);

  // Estado para indicar si hay cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Estado para controlar si mostramos vista previa o vista publicada
  const [viewMode, setViewMode] = useState('draft'); // 'draft' o 'published'

  // Obtener datos y métodos del hook
  const pageContentHook = usePageContent(selectedPage);
  const {
    blocks,
    loading,
    error,
    savePageContent,
    publishPageContent,
    loadPageContent,
    updateBlock
  } = pageContentHook;

  // Actualizar selectedPage cuando cambia el parámetro pageId
  useEffect(() => {
    setSelectedPage(pageId);
  }, [pageId]);

  // Manejar cambio de página
  const handlePageChange = (newPageId) => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm("Tienes cambios sin guardar. ¿Deseas continuar y perder estos cambios?");
      if (!confirm) return;
    }

    setSelectedPage(newPageId);
    navigate(`/admin/content/${newPageId}`);
    setHasUnsavedChanges(false);
  };

  // Manejar el guardado de contenido
  const handleSaveContent = async () => {
    try {
      await savePageContent();
      setHasUnsavedChanges(false);
      dispatch(addMessage({
        type: 'success',
        text: 'Contenido guardado correctamente. Aún no está publicado.'
      }));
    } catch (error) {
      console.error('Error guardando contenido:', error);
      dispatch(addMessage({
        type: 'error',
        text: 'Error al guardar contenido: ' + error.message
      }));
    }
  };

  // Manejar la publicación de contenido
  const handlePublishContent = async () => {
    try {
      // Primero guardar para asegurarnos que tenemos los últimos cambios
      await savePageContent();

      // Luego publicar
      await publishPageContent();

      setHasUnsavedChanges(false);
      dispatch(addMessage({
        type: 'success',
        text: 'Contenido publicado correctamente'
      }));

      // Refrescar contenido
      await loadPageContent();
    } catch (error) {
      console.error('Error publicando contenido:', error);
      dispatch(addMessage({
        type: 'error',
        text: 'Error al publicar contenido: ' + error.message
      }));
    }
  };

  // Notificar cuando hay cambios
  const handleBlockUpdate = (blockId, updates) => {
    setHasUnsavedChanges(true);
    updateBlock(blockId, updates);
  };

  // Lista de páginas disponibles
  const availablePages = [
    { id: 'home', name: 'Página Principal', icon: 'bi-house-door' },
    { id: 'about', name: 'Acerca de Nosotros', icon: 'bi-info-circle' },
    { id: 'contact', name: 'Contacto', icon: 'bi-envelope' },
  ];

  return (
    <div className="content-management-page">
      {/* Cabecera con título y selector de página */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Editor de Contenido</h2>

        {/* Selector de página con botones */}
        <div className="page-selector">
          <div className="btn-group" role="group">
            {availablePages.map((page) => (
              <button
                key={page.id}
                type="button"
                className={`btn ${selectedPage === page.id ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handlePageChange(page.id)}
              >
                <i className={`${page.icon} me-2`}></i>
                {page.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Indicador de cambios sin guardar */}
      {hasUnsavedChanges && (
        <div className="alert alert-warning mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Tienes cambios sin guardar. Recuerda guardar antes de salir o cambiar de página.
        </div>
      )}

      {/* Guía de uso */}
      <div className="alert alert-info mb-4">
        <div className="d-flex">
          <div className="me-3">
            <i className="bi bi-lightbulb-fill fs-3 text-warning"></i>
          </div>
          <div>
            <h5>Cómo editar tu página</h5>
            <p className="mb-1">
              1. <strong>Selecciona o añade</strong> un bloque desde el panel izquierdo
            </p>
            <p className="mb-1">
              2. <strong>Edita</strong> la información del bloque en el panel derecho
            </p>
            <p className="mb-1">
              3. <strong>Guarda los cambios</strong> para mantenerlos en borrador
            </p>
            <p className="mb-0">
              4. <strong>Publica los cambios</strong> para que sean visibles en el sitio web
            </p>
          </div>
        </div>
      </div>

      {/* Selector de modo de vista (borrador/publicado) */}
      <div className="d-flex justify-content-end mb-3">
        <div className="btn-group">
          <button
            className={`btn ${viewMode === 'draft' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('draft')}
          >
            <i className="bi bi-pencil me-2"></i>
            Vista previa (Borrador)
          </button>
          <button
            className={`btn ${viewMode === 'published' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('published')}
          >
            <i className="bi bi-eye me-2"></i>
            Vista publicada
          </button>
        </div>
      </div>

      {/* Vista previa en tiempo real */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {viewMode === 'draft' ? 'Vista Previa (Borrador)' : 'Vista Publicada'}
              </h5>
              <div className="d-flex gap-2">
                <a
                  href={`/${pageId === 'home' ? '' : pageId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-secondary"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i>
                  Ver página actual
                </a>
              </div>
            </div>
            <div className="card-body p-0 bg-light">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-3 text-muted">Cargando vista previa...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger m-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Error: {error}
                </div>
              ) : (
                <div className="preview-container p-3">
                  <BlockPreview
                    blocks={blocks}
                    isPreview={true}
                    viewMode={viewMode}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gestor de contenido con funcionalidad de notificar cambios */}
      <PageContentManager
        pageContentHook={{
          ...pageContentHook,
          updateBlock: handleBlockUpdate
        }}
      />

      {/* Botones flotantes para guardar y publicar cambios */}
      <div className="position-fixed" style={{ bottom: '2rem', right: '2rem', zIndex: 1000 }}>
        <div className="d-flex flex-column gap-2">
          {/* Botón de guardar */}
          <button
            className={`btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center ${hasUnsavedChanges ? 'btn-pulse' : ''}`}
            style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}
            onClick={handleSaveContent}
            title="Guardar cambios (borrador)"
          >
            <i className="bi bi-save"></i>
          </button>

          {/* Botón de publicar */}
          <button
            className="btn btn-success rounded-circle shadow d-flex align-items-center justify-content-center"
            style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}
            onClick={handlePublishContent}
            title="Publicar cambios"
          >
            <i className="bi bi-globe"></i>
          </button>
        </div>
      </div>

      {/* Estilos para animación de pulsación */}
      <style jsx>{`
        .btn-pulse {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
          }
        }
      `}</style>
    </div>
  );
};