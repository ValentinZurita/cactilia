import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// Ajusta la ruta según la ubicación REAL de tu ContentService
import ContentService from '../modules/admin/components/content/shared/ContentService'; 

/**
 * Hook reutilizable para cargar el contenido de una página dinámica.
 * Detecta automáticamente si se debe cargar la versión 'draft' (si ?preview=true está en la URL) 
 * o la versión 'published'.
 *
 * @param {string} pageId El identificador único de la página a cargar (e.g., 'faq', 'cookies-policy').
 * @param {object} [defaultContent={ pageTitle: '', pageDescription: '', mainContent: '' }] Contenido por defecto a devolver en caso de error o si no se encuentra.
 * @returns {{ pageData: object | null, loading: boolean, error: string | null, isPreview: boolean }}
 *  - pageData: Los datos de la página (borrador o publicados) o el contenido por defecto.
 *  - loading: Booleano que indica si la carga está en progreso.
 *  - error: Mensaje de error si la carga falló, o null si fue exitosa.
 *  - isPreview: Booleano que indica si se está cargando en modo previsualización.
 */
export const usePageContent = (pageId, defaultContent = { pageTitle: '', pageDescription: '', mainContent: '' }) => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation(); 
  const queryParams = new URLSearchParams(location.search);
  const isPreview = queryParams.get('preview') === 'true';
  const versionToLoad = isPreview ? 'draft' : 'published';

  useEffect(() => {
    // Evitar ejecución si no hay pageId
    if (!pageId) {
      setError('No se especificó un ID de página.');
      setPageData(defaultContent);
      setLoading(false);
      return;
    }

    let isMounted = true; 
    const loadContentData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await ContentService.getPageContent(pageId, versionToLoad);

        if (isMounted) {
          if (result.ok) {
            if (result.data) {
              setPageData(result.data);
            } else {
              console.warn(`Contenido ${versionToLoad} no encontrado para pageId: ${pageId}. Usando valores por defecto.`);
              setPageData(defaultContent);
            }
          } else {
            throw new Error(result.error || `Error cargando contenido ${versionToLoad} para ${pageId}`);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Error cargando contenido ${versionToLoad} para ${pageId}:`, err);
          setError(err.message || 'Ocurrió un error al cargar el contenido.');
          setPageData(defaultContent); 
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadContentData();

    return () => {
      isMounted = false;
    };
  }, [pageId, versionToLoad, JSON.stringify(defaultContent)]); 

  return { pageData, loading, error, isPreview }; 
}; 