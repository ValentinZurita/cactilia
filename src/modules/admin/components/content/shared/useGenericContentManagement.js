import { useState, useEffect, useCallback } from 'react';
import ContentService from './ContentService'; // Asumiendo que está en la misma carpeta shared

/**
 * Hook genérico para gestionar la lógica de carga, guardado y publicación
 * del contenido de páginas estáticas en el administrador.
 *
 * @param {string} pageId - Identificador único de la página (ej: 'cookies-policy', 'about-us').
 * @param {object} [defaultContent={}] - Objeto con el contenido por defecto si la página no existe aún.
 * @returns {object} Estado y funciones para gestionar el editor:
 *  - pageData: Los datos de la página cargados o los por defecto.
 *  - status: Estado actual ('idle', 'loading', 'saving', 'publishing', 'error').
 *  - alertInfo: Objeto con { show, type, message } para mostrar alertas.
 *  - saveDraft: Función asíncrona para guardar el borrador.
 *  - publishChanges: Función asíncrona para guardar y publicar.
 *  - setPageData: Función para actualizar pageData (usada por el editor).
 *  - clearAlert: Función para ocultar la alerta actual.
 */
export const useGenericContentManagement = (pageId, defaultContent = {}) => {
  const [pageData, setPageData] = useState(null); // Inicialmente null hasta cargar
  const [status, setStatus] = useState('loading');
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Carga inicial de datos
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!pageId) {
        setStatus('error');
        setAlertInfo({ show: true, type: 'danger', message: 'Error: ID de página no proporcionado al hook.' });
        return;
      }
      setStatus('loading');
      setAlertInfo({ show: false });
      try {
        const result = await ContentService.getPageContent(pageId, 'draft');
        if (isMounted) {
          if (result.ok) {
            // Usar datos cargados o los por defecto si no existen
            const initialContent = result.data || {
              id: pageId,
              pageTitle: '', // Empezar vacío o usar defaultContent
              pageDescription: '',
              mainContent: '',
              ...defaultContent, // Sobrescribir con los defaults proporcionados
              createdAt: result.data?.createdAt || null, // Preservar timestamps si existen
              updatedAt: result.data?.updatedAt || null,
            };
            setPageData(initialContent);
            setStatus('idle');
          } else {
            throw new Error(result.error || `Error cargando contenido para ${pageId}`);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Error cargando datos para página ${pageId}:`, err);
          const msg = `No se pudo cargar el contenido de la página (${pageId}). Intenta de nuevo.`;
          setAlertInfo({ show: true, type: 'danger', message: msg });
          setStatus('error');
        }
      }
    };
    loadData();
    return () => { isMounted = false };
  }, [pageId, JSON.stringify(defaultContent)]); // Recargar si pageId o los defaults cambian

  const clearAlert = useCallback(() => {
    setAlertInfo({ show: false, type: '', message: '' });
  }, []);

  // Guardar borrador
  const saveDraft = useCallback(async (dataToSave) => {
    if (!pageId) return; // Seguridad
    setStatus('saving');
    setAlertInfo({ show: false });
    try {
      const result = await ContentService.savePageContent(pageId, dataToSave);
      if (!result.ok) {
        throw new Error(result.error || 'Error desconocido al guardar borrador');
      }
      // Actualizar estado local con los datos guardados (incluyendo posibles timestamps actualizados por el backend)
      const updatedResult = await ContentService.getPageContent(pageId, 'draft');
      if(updatedResult.ok) {
        setPageData(updatedResult.data);
      } else {
        // Si falla al releer, al menos usar los datos que se intentaron guardar
        setPageData(dataToSave);
      }
      setStatus('idle');
      setAlertInfo({ show: true, type: 'success', message: 'Borrador guardado correctamente.' });
    } catch (err) {
      console.error(`Error guardando borrador para ${pageId}:`, err);
      const msg = `No se pudo guardar el borrador (${pageId}): ${err.message}`;
      setAlertInfo({ show: true, type: 'danger', message: msg });
      setStatus('error');
    }
  }, [pageId]);

  // Guardar y Publicar
  const publishChanges = useCallback(async (dataToPublish) => {
    if (!pageId) return; // Seguridad
    setStatus('saving');
    setAlertInfo({ show: false });
    try {
      // 1. Guardar borrador primero
      const saveResult = await ContentService.savePageContent(pageId, dataToPublish);
      if (!saveResult.ok) {
        throw new Error(saveResult.error || 'Error al guardar antes de publicar');
      }
      // Actualizar estado local con los datos guardados (del borrador)
      const updatedResult = await ContentService.getPageContent(pageId, 'draft');
      if(updatedResult.ok) {
        setPageData(updatedResult.data);
      } else {
        setPageData(dataToPublish); // Fallback
      }

      // 2. Publicar
      setStatus('publishing');
      const publishResult = await ContentService.publishPageContent(pageId);
      if (!publishResult.ok) {
        throw new Error(publishResult.error || 'Error desconocido al publicar.');
      }
      setStatus('idle');
      setAlertInfo({ show: true, type: 'success', message: 'Contenido publicado correctamente.' });

    } catch (err) {
      console.error(`Error publicando página ${pageId}:`, err);
      const msg = `No se pudo publicar (${pageId}): ${err.message}`;
      setAlertInfo({ show: true, type: 'danger', message: msg });
      setStatus('error');
    }
  }, [pageId]);

  return {
    pageData,
    status,
    alertInfo,
    saveDraft,
    publishChanges,
    setPageData, // Permitir al editor actualizar el estado del hook
    clearAlert
  };
}; 