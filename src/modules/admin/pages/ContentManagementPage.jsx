import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentPreview } from '../components/content/ContentPreview';
import { PageSelector } from '../components/content/common/PageSelector';
import { usePageContent } from '../hooks/usePageContent';
import { ContentEditor } from '../components/content/blocks/ContentEditor';
import { SaveButton } from '../components/content/common/SaveButton';
import { ResetBlocksButton } from '../components/content/common/ResetBlocksButton';
import { ContentService } from '../services/contentService';

/**
 * Página de gestión de contenido mejorada
 * Permite configurar el contenido de las diferentes páginas del sitio
 * con previsualización en vivo y opción para resetear a valores predeterminados
 *
 * @returns {JSX.Element}
 */
export const ContentManagementPage = () => {
  // Obtener el pageId de la URL o usar 'home' por defecto
  const { pageId = 'home' } = useParams();
  const navigate = useNavigate();

  // Estado para la página seleccionada
  const [selectedPage, setSelectedPage] = useState(pageId);

  // Estado para mostrar mensaje de éxito
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Obtener datos y métodos del hook
  const pageContentHook = usePageContent(selectedPage);
  const { blocks, loading, error, savePageContent, setBlocks } = pageContentHook;


  // Actualizar selectedPage cuando cambia el parámetro pageId
  useEffect(() => {
    setSelectedPage(pageId);
  }, [pageId]);

  // Manejar cambio de página
  const handlePageChange = (newPageId) => {
    setSelectedPage(newPageId);
    navigate(`/admin/content/${newPageId}`);
  };

  // Manejar guardado con mensaje de éxito
  const handleSave = async () => {
    await savePageContent();
    showSuccessNotification('¡Cambios guardados! Los cambios se guardaron como borrador.');
  };

 /* // Manejar publicación de contenido
  const handlePublish = async () => {
    try {
      // Primero guardamos los cambios
      await savePageContent();

      // Luego publicamos
      const result = await ContentService.publishPageContent(selectedPage);

      if (result.ok) {
        showSuccessNotification('¡Cambios publicados! Los cambios ahora son visibles para todos los usuarios.');
      } else {
        throw new Error(result.error || 'Error al publicar cambios');
      }
    } catch (error) {
      console.error('Error al publicar cambios:', error);
      alert('Error al publicar cambios: ' + error.message);
    }
  };*/

  const handlePublish = async () => {
    await ContentService.publishPageContent(selectedPage);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Función helper para mostrar notificación de éxito
  const showSuccessNotification = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Lista de páginas disponibles
  const availablePages = [
    { id: 'home', name: 'Página Principal', icon: 'bi-house-door' },
    { id: 'about', name: 'Acerca de Nosotros', icon: 'bi-info-circle' },
    { id: 'contact', name: 'Contacto', icon: 'bi-envelope' },
  ];

  return (
    <div className="content-management-page">
      {/* Cabecera con título y botón de reseteo */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Editor de Contenido</h2>

        <div className="d-flex gap-2">
          {/* Botón de publicación */}
          <button
            className="btn btn-success"
            onClick={handlePublish}
            disabled={loading}
            title="Publicar los cambios para que sean visibles en el sitio público"
          >
            <i className="bi bi-globe me-2"></i>
            Publicar Cambios
          </button>

          <ResetBlocksButton
            pageId={selectedPage}
            setBlocks={setBlocks}
          />
        </div>
      </div>

      {/* Mensaje de éxito flotante */}
      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>{successMessage}</strong>
          <button type="button" className="btn-close" onClick={() => setShowSuccess(false)}></button>
        </div>
      )}

      {/* Selector de página */}
      <PageSelector
        selectedPage={selectedPage}
        onPageChange={handlePageChange}
        availablePages={availablePages}
      />

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
              3. <strong>Guarda los cambios</strong> con el botón verde al finalizar
            </p>
            <p className="mb-1">
              4. <strong>Publica los cambios</strong> para que sean visibles en la página pública
            </p>
            <p className="mb-0">
              <strong>Nota:</strong> Si deseas volver al diseño original, utiliza el botón "Restaurar Diseño Original".
            </p>
          </div>
        </div>
      </div>

      {/* Vista previa en tiempo real */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Vista Previa</h5>
              <div className="d-flex gap-2">
                <span className="badge bg-secondary me-2">
                  <i className="bi bi-pencil-fill me-1"></i>
                  Modo Editor
                </span>
                <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-box-arrow-up-right me-1"></i>
                  Ver página completa
                </a>
              </div>
            </div>
            <div className="card-body p-0 bg-light">
              <ContentPreview
                blocks={blocks}
                loading={loading}
                error={error}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editor de contenido */}
      <ContentEditor contentHook={pageContentHook} />

      <button
        className="btn btn-success me-2"
        onClick={handlePublish}
        disabled={loading}
      >
        <i className="bi bi-globe me-2"></i>
        Publicar cambios
      </button>

      {/* Botón flotante para guardar cambios */}
      <SaveButton onSave={handleSave} disabled={loading} />
    </div>
  );
};