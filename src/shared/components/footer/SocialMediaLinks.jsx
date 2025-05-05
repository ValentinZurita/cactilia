import React from 'react';
import { useSelector } from 'react-redux';
import { selectSocialLinks } from '../../../store/slices/siteConfigSlice.js';

/**
 * @component SocialMediaLinks
 * @description Componente que muestra los iconos de redes sociales en el footer.
 *              Obtiene los enlaces desde el store de Redux y muestra solo los visibles.
 */

export const SocialMediaLinks = () => {

  // Obtener enlaces sociales del store de Redux
  const socialLinks = useSelector(selectSocialLinks);
  console.log("ℹ️ SocialMediaLinks (Footer) - socialLinks from selector:", socialLinks); // Log value from selector

  // Filtrar para mostrar solo los enlaces marcados como visibles
  const visibleLinks = socialLinks?.filter(link => link.visible !== false) || [];

  // No renderizar la sección si no hay enlaces visibles que mostrar
  if (visibleLinks.length === 0) {
      return null; 
  }

  // Renderizado principal del componente
  return (
    <div className="col d-flex flex-column align-items-md-start align-items-start">
      {/* Título */}
      <h5 className="text-uppercase fw-bold text-start">Síguenos</h5>

      {/* Contenedor de enlaces */}
      <div className="d-flex align-items-start">
        {/* Mapea sobre los enlaces visibles obtenidos y renderiza un icono para cada uno */}
        {visibleLinks.map((social) => (
          // Usar social.id como key si está disponible y es único
          <a key={social.id || social.url} href={social.url} className="text-white mx-2" target="_blank" rel="noopener noreferrer">
            <i className={`bi ${social.icon} fs-3`}></i>
          </a>
        ))}
      </div>
    </div>
  );
};