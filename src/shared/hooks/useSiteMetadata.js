import { useEffect } from 'react';
import { useCompanyInfo } from '../../modules/admin/companyInfo/hooks/useCompanyInfo.js';

/**
 * Hook para actualizar automáticamente los metadatos del sitio (título, favicon)
 * basado en la información de la empresa obtenida de Firestore.
 */
export const useSiteMetadata = () => {
  const { companyInfo, loading } = useCompanyInfo();

  useEffect(() => {
    if (!loading && companyInfo) {
      // Update title
      if (companyInfo.name) {
        document.title = companyInfo.name;
      }

      // Update favicon
      if (companyInfo.logoUrl) {
        let faviconLink = document.querySelector("link[rel='icon']"); 

        // Determine mime type from URL extension (basic)
        let mimeType = '';
        if (companyInfo.logoUrl.endsWith('.ico')) {
          mimeType = 'image/x-icon';
        } else if (companyInfo.logoUrl.endsWith('.png')) {
          mimeType = 'image/png';
        } else if (companyInfo.logoUrl.endsWith('.svg')) {
          mimeType = 'image/svg+xml';
        } else if (companyInfo.logoUrl.endsWith('.jpg') || companyInfo.logoUrl.endsWith('.jpeg')) {
          mimeType = 'image/jpeg';
        } // Add other types if needed

        if (!faviconLink) {
          // If favicon link doesn't exist, create it
          faviconLink = document.createElement('link');
          faviconLink.rel = 'icon';
          document.head.appendChild(faviconLink);
        }

        // Update href and type
        faviconLink.href = companyInfo.logoUrl;
        if (mimeType) {
          faviconLink.type = mimeType;
        } else {
          // Remove type if we couldn't determine it, let browser guess
          faviconLink.removeAttribute('type');
        }
      }
    }
  }, [companyInfo, loading]);

  // Este hook no necesita devolver nada, solo ejecuta el efecto.
}; 