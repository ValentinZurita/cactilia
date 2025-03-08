import { useState, useEffect, useCallback } from 'react';
import { createDefaultBlocks } from '../utilis/blockHelpers';
import { ContentService } from '../services/contentService';

/**
 * Hook que administra toda la lógica de ContentManagementPage:
 * - Estados y efectos relacionados con guardado, publicación, etc.
 * - Handlers: cambiar de página, guardar, publicar, resetear bloques, etc.
 * - Sin mezclar con el renderizado de la UI.
 *
 * @param {object} pageContentHook - El hook que maneja la carga/almacenamiento de bloques (usePageContent)
 * @param {string} pageId - El ID actual de la página seleccionada (ej. 'home', 'about', etc.)
 * @param {function} navigateFn - Función para navegar entre páginas (useNavigate)
 */
export const useContentManagement = (pageContentHook, pageId, navigateFn) => {
  // Estados para la interfaz
  const [selectedPage, setSelectedPage] = useState(pageId);
  const [alertState, setAlertState] = useState({ show: false, type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Extraemos valores de pageContentHook
  const {
    blocks,
    loading,
    error,
    savePageContent,
    setBlocks,
    originalBlocks
  } = pageContentHook;

  /**
   * Revisa si los blocks actuales difieren de los originales,
   * determinando si hay cambios no guardados.
   */
  const checkUnsavedChanges = useCallback(() => {
    if (!loading && blocks?.length > 0 && originalBlocks) {
      const currentJSON = JSON.stringify(blocks);
      const originalJSON = JSON.stringify(originalBlocks);
      return currentJSON !== originalJSON;
    }
    return false;
  }, [blocks, originalBlocks, loading]);

  /**
   * Cada vez que cambien blocks u originalBlocks, recalculamos hasUnsavedChanges.
   */
  useEffect(() => {
    setHasUnsavedChanges(checkUnsavedChanges());
  }, [blocks, originalBlocks, loading, checkUnsavedChanges]);

  /**
   * Muestra una alerta en pantalla por un tiempo determinado.
   */
  const showTemporaryAlert = (type, message, durationMs = 3000) => {
    setAlertState({ show: true, type, message });
    setTimeout(() => {
      setAlertState((prev) => ({ ...prev, show: false }));
    }, durationMs);
  };

  /**
   * Cuando cambia el pageId (ej. de 'home' a 'about'), actualiza selectedPage.
   */
  useEffect(() => {
    setSelectedPage(pageId);
  }, [pageId]);

  // ──────────────────────────────────────────────────────────────────────────
  // Handlers de eventos
  // ──────────────────────────────────────────────────────────────────────────

  const handlePageChange = (newPageId) => {
    if (hasUnsavedChanges) {
      const confirmChange = window.confirm('Hay cambios sin guardar. ¿Deseas continuar y perder los cambios?');
      if (!confirmChange) return;
    }
    setSelectedPage(newPageId);
    navigateFn(`/admin/content/${newPageId}`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePageContent();
      showTemporaryAlert('success', 'Cambios guardados correctamente');
      setHasUnsavedChanges(false);
    } catch (error) {
      showTemporaryAlert('danger', 'Error al guardar cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (hasUnsavedChanges) {
      const saveFirst = window.confirm('Hay cambios sin guardar. ¿Guardar antes de publicar?');
      if (saveFirst) {
        await handleSave();
      }
    }
    setIsPublishing(true);
    try {
      const result = await ContentService.publishPageContent(selectedPage);
      if (result.ok) {
        showTemporaryAlert('success', 'Contenido publicado correctamente');
      } else {
        throw new Error(result.error || 'Error al publicar');
      }
    } catch (error) {
      showTemporaryAlert('danger', 'Error al publicar contenido');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleResetBlocks = () => {
    const confirmReset = window.confirm('¿Restaurar al diseño original? Esta acción no se puede deshacer.');
    if (confirmReset) {
      const defaultBlocks = createDefaultBlocks(selectedPage);
      setBlocks(defaultBlocks);
      setHasUnsavedChanges(true);
      showTemporaryAlert('info', 'Diseño restaurado al original');
    }
  };

  const handleViewPage = () => {
    const baseUrl = window.location.origin;
    const urlPath = selectedPage === 'home' ? '/' : `/${selectedPage}`;
    window.open(baseUrl + urlPath, '_blank');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Retornamos todo lo que la UI necesita
  // ──────────────────────────────────────────────────────────────────────────

  return {
    // Estados
    selectedPage,
    setSelectedPage,
    alertState,
    setAlertState,
    isSaving,
    isPublishing,
    hasUnsavedChanges,

    // Del hook de contenido
    blocks,
    loading,
    error,

    // Handlers
    handlePageChange,
    handleSave,
    handlePublish,
    handleResetBlocks,
    handleViewPage
  };
};