import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// Ajustar la ruta si ContentService se mueve o si se usa un servicio genérico
import ContentService from '../../admin/components/content/shared/ContentService';

const COOKIES_POLICY_PAGE_ID = 'cookies-policy';

/**
 * Hook para cargar los datos de la página pública de Política de Cookies.
 * Determina si cargar la versión publicada o el borrador (para previsualización)
 * basándose en el parámetro URL 'preview'.
 *
 * @returns {object} Estado y datos de la página:
 *  - pageData: Los datos cargados de la página (null si no se encuentra o hay error).
 *  - status: Estado actual ('idle', 'loading', 'success', 'error').
 *  - error: Mensaje de error si status es 'error'.
 *  - isPreview: Booleano que indica si se está en modo previsualización.
 */
export const useCookiesPolicyPageData = () => {
  const [pageData, setPageData] = useState(null);
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
        // Usamos ContentService para obtener los datos de la página
        const version = isPreview ? 'draft' : 'published';
        const result = await ContentService.getPageContent(COOKIES_POLICY_PAGE_ID, version);

        if (isMounted) {
          if (result.ok && result.data) {
            setPageData(result.data);
            setStatus('success');
          } else {
            const message = isPreview
              ? 'No se encontró el borrador de la Política de Cookies.'
              : 'No se encontró el contenido publicado de la Política de Cookies.';
            setError(message);
            setStatus('error');
            setPageData(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Error al cargar Política de Cookies (${isPreview ? 'borrador' : 'publicada'}):`, err);
          setError('Ocurrió un error al cargar la política de cookies.');
          setStatus('error');
          setPageData(null);
        }
      }
    };

    loadData();
    return () => { isMounted = false };
  }, [isPreview]);

  return { pageData, status, error, isPreview };
}; 