import { useEffect } from 'react';
import { useCompanyInfo } from '../../modules/admin/companyInfo/hooks/useCompanyInfo.js';

/**
 * @hook useSiteMetadata
 * @description Hook personalizado que obtiene la información de la empresa
 * (nombre, logo/favicon, descripción) desde Firestore y actualiza dinámicamente
 * las etiquetas correspondientes en el `<head>` del documento HTML.
 * - Actualiza `<title>` con el nombre de la empresa.
 * - Actualiza o crea `<link rel="icon">` con la URL del logo/favicon y su tipo MIME.
 * - Actualiza o crea `<meta name="description">` con la descripción de la empresa.
 * 
 * Este hook se ejecuta una vez al montar el componente donde se use (idealmente `App.jsx`)
 * y cada vez que la información de la empresa (`companyInfo`) o el estado de carga (`loading`) cambien.
 * No renderiza ningún elemento visual.
 */
export const useSiteMetadata = () => {
  const { companyInfo, loading } = useCompanyInfo();

  useEffect(() => {
    // Solo proceder si la carga ha terminado y tenemos datos
    if (!loading && companyInfo) {

      // -------------------------------------
      // 1. Actualizar Título del Documento
      // -------------------------------------
      if (companyInfo.name) {
        document.title = companyInfo.name;
      }

      // -------------------------------------
      // 2. Actualizar Favicon
      // -------------------------------------
      if (companyInfo.logoUrl) {
        let faviconLink = document.querySelector("link[rel='icon']"); 

        // Determinar tipo MIME basado en la extensión (básico)
        let mimeType = '';
        if (companyInfo.logoUrl.endsWith('.ico')) {
          mimeType = 'image/x-icon';
        } else if (companyInfo.logoUrl.endsWith('.png')) {
          mimeType = 'image/png';
        } else if (companyInfo.logoUrl.endsWith('.svg')) {
          mimeType = 'image/svg+xml';
        } else if (companyInfo.logoUrl.endsWith('.jpg') || companyInfo.logoUrl.endsWith('.jpeg')) {
          mimeType = 'image/jpeg';
        } // Se pueden añadir más tipos si es necesario

        // Si no existe la etiqueta, crearla
        if (!faviconLink) {
          faviconLink = document.createElement('link');
          faviconLink.rel = 'icon';
          document.head.appendChild(faviconLink);
        }

        // Actualizar el href y el tipo
        faviconLink.href = companyInfo.logoUrl;
        if (mimeType) {
          faviconLink.type = mimeType;
        } else {
          // Si no se pudo determinar, quitar el tipo para que el navegador intente adivinar
          faviconLink.removeAttribute('type');
        }
      }

      // -------------------------------------
      // 3. Actualizar Meta Descripción (SEO)
      // -------------------------------------
      if (companyInfo.description) { 
        let metaDescriptionTag = document.querySelector("meta[name='description']");

        // Si no existe la etiqueta, crearla
        if (!metaDescriptionTag) { 
          metaDescriptionTag = document.createElement('meta');
          metaDescriptionTag.name = 'description';
          document.head.appendChild(metaDescriptionTag); 
        }
        
        // Actualizar el contenido
        metaDescriptionTag.content = companyInfo.description; 
      } 
    }
  }, [companyInfo, loading]);

  // Este hook no necesita devolver nada, solo ejecuta el efecto.
}; 