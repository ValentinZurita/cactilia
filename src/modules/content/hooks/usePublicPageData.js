import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// Necesitamos importar ContentService, ajusta la ruta si es necesario
import ContentService from '../../admin/components/content/shared/ContentService'; 

/**
 * Hook genérico para cargar los datos de una página de contenido estático pública.
 * Determina si cargar la versión publicada o el borrador (para previsualización)
 * basándose en el parámetro URL 'preview'.
 *
 * @param {string} pageId - El ID de la página a cargar (ej: 'nosotros', 'cookies-policy').
 * @returns {object} Estado y datos de la página:
 *  - pageData: Los datos cargados de la página (null si no se encuentra o hay error).
 *  - status: Estado actual ('idle', 'loading', 'success', 'error').
 *  - error: Mensaje de error si status es 'error'.
 *  - isPreview: Booleano que indica si se está en modo previsualización.
 */
export const usePublicPageData = (pageId) => {
  const [pageData, setPageData] = useState(null);
  const [status, setStatus] = useState('loading'); 
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  const isPreview = searchParams.get('preview') === 'true';

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!pageId) {
        if (isMounted) {
          setError('Error interno: No se especificó ID de página.');
          setStatus('error');
        }
        return;
      }
      setStatus('loading');
      setError(null);
      try {
        const source = isPreview ? 'draft' : 'published';
        const result = await ContentService.getPageContent(pageId, source);

        if (isMounted) {
          if (result.ok && result.data) {
            setPageData(result.data);
            setStatus('success');
          } else {
            const message = `No se encontró el contenido ${isPreview ? 'del borrador' : 'publicado'} para la página '${pageId}'.`;
            setError(message);
            setStatus('error');
            setPageData(null);
            // Opcional: Loguear el error completo si result.ok era false pero no había data
            if (!result.ok) {
                console.error(`Error fetching page ${pageId} (${source}):`, result.error)
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Error cargando página ${pageId} (${isPreview ? 'borrador' : 'publicada'}):`, err);
          setError('Ocurrió un error al cargar el contenido de la página.');
          setStatus('error');
          setPageData(null);
        }
      }
    };

    loadData();
    return () => { isMounted = false };
  }, [pageId, isPreview]); // Depender de pageId y isPreview

  return { pageData, status, error, isPreview };
}; 