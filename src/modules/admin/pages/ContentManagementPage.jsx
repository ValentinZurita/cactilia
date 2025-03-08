import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentPreview } from '../components/content/ContentPreview';
import { PageSelector } from '../components/content/common/PageSelector';
import { usePageContent } from '../hooks/usePageContent';
import { ContentEditor } from '../components/content/blocks/ContentEditor.jsx'
import { SaveButton } from '../components/content/common/SaveButton.jsx'

/**
 * Página de gestión de contenido mejorada
 * Permite configurar el contenido de las diferentes páginas del sitio
 * con previsualización en vivo
 *
 * @returns {JSX.Element}
 */
export const ContentManagementPage = () => {
  // Obtener el pageId de la URL o usar 'home' por defecto
  const { pageId = 'home' } = useParams();
  const navigate = useNavigate();

  // Estado para la página seleccionada
  const [selectedPage, setSelectedPage] = useState(pageId);

  // Obtener datos y métodos del hook
  const pageContentHook = usePageContent(selectedPage);
  const { blocks, loading, error, savePageContent } = pageContentHook;

  // Actualizar selectedPage cuando cambia el parámetro pageId
  useEffect(() => {
    setSelectedPage(pageId);
  }, [pageId]);

  // Manejar cambio de página
  const handlePageChange = (newPageId) => {
    setSelectedPage(newPageId);
    navigate(`/admin/content/${newPageId}`);
  };

  // Lista de páginas disponibles
  const availablePages = [
    { id: 'home', name: 'Página Principal', icon: 'bi-house-door' },
    { id: 'about', name: 'Acerca de Nosotros', icon: 'bi-info-circle' },
    { id: 'contact', name: 'Contacto', icon: 'bi-envelope' },
  ];

  return (
    <div className="content-management-page">
      {/* Cabecera con título */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Editor de Contenido</h2>
      </div>

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
            <p className="mb-0">
              <strong>Nota:</strong> Los cambios se reflejarán en la página principal después de guardar.
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
              <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                <i className="bi bi-box-arrow-up-right me-1"></i>
                Ver página completa
              </a>
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

      {/* Botón flotante para guardar cambios */}
      <SaveButton onSave={savePageContent} disabled={loading} />
    </div>
  );
};