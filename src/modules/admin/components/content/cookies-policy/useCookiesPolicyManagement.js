import { useState, useEffect, useCallback } from 'react';
// Asumimos que faqService exporta las funciones genéricas o las adaptaremos
// import { getFaqContent as getPageContent, saveFaqContent as savePageContent } from './faqService'; // Eliminada esta línea
// O directamente usar ContentService?
// import ContentService from '../shared/ContentService';
import ContentService from '../shared/ContentService'; // Usaremos ContentService directamente para publish

const COOKIES_POLICY_PAGE_ID = 'cookies-policy';

/**
 * Hook para gestionar la lógica de carga, guardado y publicación
 * del contenido de la página de Política de Cookies en el administrador.
 *
 * @returns {object} Estado y funciones para gestionar el editor:
 *  - pageData: Los datos de la página cargados.
 *  - status: Estado actual ('idle', 'loading', 'saving', 'publishing', 'error').
 *  - alertInfo: Objeto con { show, type, message } para mostrar alertas.
 *  - saveDraft: Función asíncrona para guardar el borrador.
 *  - publishChanges: Función asíncrona para guardar y publicar.
 *  - setPageData: Función para actualizar pageData desde el editor.
 *  - clearAlert: Función para ocultar la alerta actual.
 */
export const useCookiesPolicyManagement = () => {
  const [pageData, setPageData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Carga inicial de datos
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setStatus('loading');
      setAlertInfo({ show: false });
      try {
        const result = await ContentService.getPageContent(COOKIES_POLICY_PAGE_ID, 'draft');
        if (isMounted) {
          if (result.ok) {
            // Inicializar con estructura básica si no existe
            const initialContent = result.data || {
              id: COOKIES_POLICY_PAGE_ID,
              pageTitle: 'Política de Cookies', // Valor por defecto
              pageDescription: 'Detalles sobre el uso de cookies en nuestro sitio.', // Valor por defecto
              mainContent: '', // Campo principal para el texto
              createdAt: null,
              updatedAt: null,
            };
            setPageData(initialContent);
            setStatus('idle');
          } else {
            throw new Error(result.error || 'Error al cargar los datos');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error cargando datos de Política de Cookies:", err); // Mantener para depuración
          const msg = "No se pudieron cargar los datos. Intenta de nuevo.";
          setAlertInfo({ show: true, type: 'danger', message: msg });
          setStatus('error');
        }
      }
    };
    loadData();
    return () => { isMounted = false }; // Limpieza al desmontar
  }, []);

  const clearAlert = useCallback(() => {
    setAlertInfo({ show: false, type: '', message: '' });
  }, []);

  // Guardar borrador
  const saveDraft = useCallback(async (dataToSave) => {
    setStatus('saving');
    setAlertInfo({ show: false });
    try {
      const result = await ContentService.savePageContent(COOKIES_POLICY_PAGE_ID, dataToSave);
      if (!result.ok) {
        throw new Error(result.error || 'Error desconocido al guardar borrador');
      }
      setPageData(dataToSave); // Actualizar estado local con los datos guardados
      setStatus('idle');
      setAlertInfo({ show: true, type: 'success', message: 'Borrador guardado correctamente.' });
    } catch (err) {
      console.error("Error guardando borrador de Política de Cookies:", err); // Mantener para depuración
      const msg = `No se pudo guardar el borrador: ${err.message}`;
      setAlertInfo({ show: true, type: 'danger', message: msg });
      setStatus('error');
    }
  }, []);

  // Guardar y Publicar
  const publishChanges = useCallback(async (dataToPublish) => {
    setStatus('saving'); // Empezar con estado "saving"
    setAlertInfo({ show: false });
    try {
      // 1. Guardar borrador primero
      const saveResult = await ContentService.savePageContent(COOKIES_POLICY_PAGE_ID, dataToPublish);
       if (!saveResult.ok) {
        throw new Error(saveResult.error || 'Error al guardar antes de publicar');
      }
      setPageData(dataToPublish); // Actualizar estado local

      // 2. Publicar
      setStatus('publishing');
      const publishResult = await ContentService.publishPageContent(COOKIES_POLICY_PAGE_ID);
      if (!publishResult.ok) {
        throw new Error(publishResult.error || 'Error desconocido al publicar.');
      }
      setStatus('idle');
      setAlertInfo({ show: true, type: 'success', message: 'Política de Cookies publicada correctamente.' });

    } catch (err) {
      console.error("Error publicando Política de Cookies:", err); // Mantener para depuración
      const msg = `No se pudo publicar: ${err.message}`;
      setAlertInfo({ show: true, type: 'danger', message: msg });
      setStatus('error'); // Reflejar el estado de fallo
    }
  }, []);

  return {
    pageData, // Estado único para los datos
    status,
    alertInfo,
    saveDraft,
    publishChanges,
    clearAlert
  };
}; 