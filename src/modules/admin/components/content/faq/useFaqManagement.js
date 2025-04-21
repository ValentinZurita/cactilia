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
 *  - error: Mensaje de error si status es 'error' (obsoleto, usar alertInfo).
 *  - alertInfo: Objeto con { show, type, message } para mostrar alertas.
 *  - saveDraft: Función asíncrona para guardar el borrador.
 *  - publishChanges: Función asíncrona para guardar y publicar.
 *  - setCurrentData: Función para actualizar currentData desde el editor.
 *  - clearAlert: Función para ocultar la alerta actual.
 */
export const useFaqManagement = () => {
  const [initialData, setInitialData] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null); // Mantener por si acaso, pero preferir alertInfo
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Carga inicial
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setStatus('loading');
      setError(null);
      setAlertInfo({ show: false }); // Limpiar alerta al cargar
      try {
        const data = await getFaqContent();
        if (isMounted) {
          setInitialData(data);
          setCurrentData(JSON.parse(JSON.stringify(data)));
          setStatus('idle');
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error al cargar datos de FAQ:", err);
          const msg = "No se pudieron cargar los datos. Intenta de nuevo.";
          setError(msg);
          setAlertInfo({ show: true, type: 'danger', message: msg });
          setStatus('error');
        }
      }
    };
    loadData();
    return () => { isMounted = false };
  }, []);

  // Limpiar alerta
  const clearAlert = useCallback(() => {
    setAlertInfo({ show: false, type: '', message: '' });
  }, []);

  // Guardar borrador
  const saveDraft = useCallback(async (dataToSave) => {
    setStatus('saving');
    setError(null);
    setAlertInfo({ show: false });
    try {
      await saveFaqContent(dataToSave);
      setInitialData(dataToSave);
      setCurrentData(JSON.parse(JSON.stringify(dataToSave)));
      setStatus('idle');
      setAlertInfo({ show: true, type: 'success', message: 'Borrador guardado correctamente.' });
    } catch (err) {
      console.error("Error al guardar borrador FAQ:", err);
      const msg = "No se pudo guardar el borrador. Intenta de nuevo.";
      setError(msg);
      setAlertInfo({ show: true, type: 'danger', message: msg });
      setStatus('error');
    }
  }, []);

  // Guardar y Publicar
  const publishChanges = useCallback(async (dataToPublish) => {
    setStatus('saving');
    setError(null);
    setAlertInfo({ show: false });
    let savedOk = false;
    try {
      await saveFaqContent(dataToPublish);
      setInitialData(dataToPublish);
      setCurrentData(JSON.parse(JSON.stringify(dataToPublish)));
      savedOk = true;
    } catch (err) {
      console.error("Error al guardar borrador antes de publicar:", err);
      const msg = "Error al guardar antes de publicar. Intenta de nuevo.";
      setError(msg);
      setAlertInfo({ show: true, type: 'danger', message: msg });
      setStatus('error');
      return; // Salir si falla el guardado previo
    }

    if (savedOk) {
      setStatus('publishing');
      try {
        const publishResult = await ContentService.publishPageContent('faq');
        if (!publishResult.ok) {
          throw new Error(publishResult.error || 'Error desconocido al publicar.');
        }
        setStatus('idle');
        setAlertInfo({ show: true, type: 'success', message: 'Contenido publicado correctamente.' });
      } catch (err) {
        console.error("Error al publicar datos de FAQ:", err);
        const msg = `No se pudo publicar el contenido: ${err.message}`;
        setError(msg);
        setAlertInfo({ show: true, type: 'danger', message: msg });
        setStatus('error');
      }
    }
  }, []);

  return {
    initialData,
    currentData,
    status,
    error, // Se puede quitar si no se usa fuera del hook
    alertInfo, // Exponer estado de alerta
    saveDraft,
    publishChanges,
    setCurrentData,
    clearAlert // Exponer función para limpiar alerta
  };
}; 