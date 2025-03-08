import { useParams, useNavigate } from 'react-router-dom';
import { usePageContent } from '../hooks/usePageContent';
import { useContentManagement } from '../hooks/useContentManagement';
import {
  EditorCard,
  HeaderActions,
  PageSelectorView, PreviewCard,
  StatusAlert,
  UnsavedChangesBanner,
} from '../components/content/page' // <- Asegúrate que index.js exporte todos

// Lista de páginas disponibles
const availablePages = [
  { id: 'home', name: 'Página Principal', icon: 'bi-house-door' },
  { id: 'about', name: 'Acerca de Nosotros', icon: 'bi-info-circle' },
  { id: 'contact', name: 'Contacto', icon: 'bi-envelope' },
];

export const ContentManagementPage = () => {
  // 1. Identificamos la página y creamos navigateFn
  const { pageId = 'home' } = useParams();
  const navigateFn = useNavigate();

  // 2. Hook que obtiene/carga bloques
  const pageContentHook = usePageContent(pageId);

  // 3. Hook con la lógica principal (guardar, publicar, etc.)
  const {
    selectedPage,
    alertState,
    isSaving,
    isPublishing,
    hasUnsavedChanges,
    blocks,
    loading,
    error,
    handlePageChange,
    handleSave,
    handlePublish,
    handleResetBlocks,
    handleViewPage,
  } = useContentManagement(pageContentHook, pageId, navigateFn);

  // 4. Render puro y declarativo
  return (
    <div className="content-management-page">
      <HeaderActions
        loading={loading}
        isSaving={isSaving}
        isPublishing={isPublishing}
        hasUnsavedChanges={hasUnsavedChanges}
        onViewPage={handleViewPage}
        onResetBlocks={handleResetBlocks}
        onSave={handleSave}
        onPublish={handlePublish}
      />

      <StatusAlert alertState={alertState} />

{/*      <UnsavedChangesBanner hasUnsavedChanges={hasUnsavedChanges} />*/}

      <PageSelectorView
        selectedPage={selectedPage}
        onPageChange={handlePageChange}
        availablePages={availablePages}
      />

      <PreviewCard
        blocks={blocks}
        loading={loading}
        error={error}
      />

      <EditorCard contentHook={pageContentHook} />
    </div>
  );
};