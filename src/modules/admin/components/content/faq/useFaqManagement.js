import { useState, useEffect, useCallback } from 'react';
import { getFaqContent, saveFaqContent } from './faqService';
import ContentService from '../shared/ContentService';

/**
 * Hook para gestionar la lógica de carga, guardado y publicación
 * del contenido de la página de FAQ en el administrador.
 *
 * @returns {object} Estado y funciones para gestionar el editor de FAQ:
 *  - initialData: Los datos cargados inicialmente o después del último guardado.
 *  - currentData: Los datos actuales en el editor (puede diferir de initialData).
 *  - status: Estado actual ('idle', 'loading', 'saving', 'publishing', 'error').
 *  - error: Mensaje de error si status es 'error'.
 *  - saveDraft: Función asíncrona para guardar el borrador.
 *  - publishChanges: Función asíncrona para guardar y publicar.
 *  - setCurrentData: Función para actualizar currentData desde el editor.
 */
export const useFaqManagement = () => {
  const [initialData, setInitialData] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [status, setStatus] = useState('loading'); // idle, loading, saving, publishing, error
  const [error, setError] = useState(null);

  // Carga inicial
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setStatus('loading');
      setError(null);
      try {
        const data = await getFaqContent();
        if (isMounted) {
          setInitialData(data);
          setCurrentData(JSON.parse(JSON.stringify(data))); // Copia profunda para currentData
          setStatus('idle');
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error al cargar datos de FAQ:", err);
          setError("No se pudieron cargar los datos. Intenta de nuevo.");
          setStatus('error');
        }
      }
    };

    loadData();
    return () => { isMounted = false }; // Cleanup para evitar sets en componente desmontado
  }, []);

  // Guardar borrador
  const saveDraft = useCallback(async (dataToSave) => {
    setStatus('saving');
    setError(null);
    try {
      await saveFaqContent(dataToSave);
      setInitialData(dataToSave); // Actualiza initialData para reflejar el guardado
      setCurrentData(JSON.parse(JSON.stringify(dataToSave))); // Sincroniza currentData
      setStatus('idle');
      return { ok: true };
    } catch (err) {
      console.error("Error al guardar borrador FAQ:", err);
      setError("No se pudo guardar el borrador. Intenta de nuevo.");
      setStatus('error');
      return { ok: false, error: err.message };
    }
  }, []);

  // Guardar y Publicar
  const publishChanges = useCallback(async (dataToPublish) => {
    // Primero guardar borrador
    setStatus('saving'); 
    setError(null);
    try {
      await saveFaqContent(dataToPublish);
      setInitialData(dataToPublish); // Actualiza initialData
      setCurrentData(JSON.parse(JSON.stringify(dataToPublish))); // Sincroniza currentData
    } catch (err) {
       console.error("Error al guardar borrador antes de publicar:", err);
       setError("Error al guardar antes de publicar. Intenta de nuevo.");
       setStatus('error');
       return { ok: false, error: err.message };
    }

    // Luego publicar
    setStatus('publishing');
    try {
      const publishResult = await ContentService.publishPageContent('faq');
      if (!publishResult.ok) {
        throw new Error(publishResult.error || 'Error desconocido al publicar.');
      }
      setStatus('idle');
      return { ok: true };
    } catch (err) {
      console.error("Error al publicar datos de FAQ:", err);
      setError(`No se pudo publicar el contenido: ${err.message}`);
      setStatus('error');
      return { ok: false, error: err.message };
    }
  }, []);

  return {
    initialData,
    currentData, // Asegúrate de que el editor pueda actualizar esto
    status,
    error,
    saveDraft,
    publishChanges,
    setCurrentData // Exponer para que FaqEditor actualice
  };
}; 