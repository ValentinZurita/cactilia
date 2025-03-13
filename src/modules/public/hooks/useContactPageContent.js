// src/modules/public/hooks/useContactPageContent.js
import { useState, useEffect } from 'react';
import { ContentService } from '../../admin/components/homepage-editor/shared/ContentService.js';
import { DEFAULT_CONTACT_TEMPLATE } from '../../admin/components/homepage-editor/contact/contactPageService.js'

/**
 * Hook para cargar el contenido personalizado de la página de contacto
 * @returns {Object} - Datos y estado del contenido de la página
 */
export const useContactPageContent = () => {
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);

        // Obtener contenido publicado
        const result = await ContentService.getPageContent('contact', 'published');

        if (result.ok && result.data) {
          setPageContent(result.data);
        } else {
          console.log('No se encontró contenido personalizado para la página de contacto, usando valores predeterminados');
          setPageContent(DEFAULT_CONTACT_TEMPLATE);
        }

        setError(null);
      } catch (err) {
        console.error('Error cargando contenido de la página de contacto:', err);
        setError('Error al cargar el contenido personalizado');
        setPageContent(DEFAULT_CONTACT_TEMPLATE);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  return {
    pageContent,
    loading,
    error,
    // Función auxiliar para obtener una sección específica
    getSection: (sectionKey) => pageContent?.sections?.[sectionKey] || {}
  };
};