import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPublishedFaqContent, getFaqContent } from '../../admin/components/content/faq/faqService';

/**
 * Hook para cargar los datos de la página pública de FAQ.
 * Determina si cargar la versión publicada o el borrador (para previsualización)
 * basándose en el parámetro URL 'preview'.
 *
 * @returns {object} Estado y datos de la página FAQ:
 *  - faqData: Los datos cargados de la página (null si no se encuentra o hay error).
 *  - status: Estado actual ('idle', 'loading', 'success', 'error').
 *  - error: Mensaje de error si status es 'error'.
 *  - isPreview: Booleano que indica si se está en modo previsualización.
 */
export const useFaqPageData = () => {
  const [faqData, setFaqData] = useState(null);
  const [status, setStatus] = useState('loading'); // idle, loading, success, error
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  const isPreview = searchParams.get('preview') === 'true';

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setStatus('loading');
      setError(null);
      try {
        const fetchFunction = isPreview ? getFaqContent : getPublishedFaqContent;
        const data = await fetchFunction();

        if (isMounted) {
          if (data) {
            setFaqData(data);
            setStatus('success');
          } else {
            const message = isPreview
              ? 'No se encontró el borrador de Preguntas Frecuentes.'
              : 'No se encontró el contenido publicado de Preguntas Frecuentes.';
            setError(message);
            setStatus('error');
            setFaqData(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          // console.error(`Error al cargar FAQ (${isPreview ? 'borrador' : 'publicadas'}):`, err); // Mantenemos console.error
          setError('Ocurrió un error al cargar las preguntas frecuentes.');
          setStatus('error');
          setFaqData(null);
        }
      }
    };

    loadData();
    return () => { isMounted = false };
  }, [isPreview]);

  return { faqData, status, error, isPreview };
}; 