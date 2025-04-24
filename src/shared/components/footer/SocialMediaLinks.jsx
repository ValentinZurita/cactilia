import React, { useEffect, useState } from 'react'
import { getSocialMediaLinks } from '../../../services/firebase/companyInfoService'


/**
 * @component SocialMediaLinks
 * @description Componente que muestra los iconos de redes sociales en el footer.
 *              Obtiene los enlaces desde Firestore y muestra solo los visibles.
 */

export const SocialMediaLinks = () => {

  // Estado para almacenar los enlaces de redes sociales obtenidos de Firestore
  const [socialLinks, setSocialLinks] = useState([]);
  // Estado para manejar la carga de datos
  const [loading, setLoading] = useState(true);

  
  // useEffect para obtener los enlaces al montar el componente
  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      try {
        const linksFromDb = await getSocialMediaLinks();
        // Filtrar para mostrar solo los enlaces marcados como visibles
        const visibleLinks = linksFromDb.filter(link => link.visible !== false);
        setSocialLinks(visibleLinks);
      } catch (error) {
        console.error("Error al obtener enlaces sociales para el footer:", error);
        setSocialLinks([]); // Dejar vacío en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  // Muestra un indicador de carga mientras se obtienen los datos
  if (loading) {
    return (
        <div className="col d-flex flex-column align-items-md-start align-items-start">
            <h5 className="text-uppercase fw-bold text-start">Síguenos</h5>
            {/* Indicador simple de carga */}
            <div className="d-flex align-items-start" style={{ height: '2.5rem'}}> 
                <span className="spinner-border spinner-border-sm text-white-50" role="status" aria-hidden="true"></span>
            </div>
        </div>
    );
  }
  
  // No renderizar la sección si no hay enlaces visibles que mostrar
  if (socialLinks.length === 0) {
      return null; 
  }


  // Renderizado principal del componente
  return (

    <div className="col d-flex flex-column align-items-md-start align-items-start">

      {/* Título */}
      <h5 className="text-uppercase fw-bold text-start">Síguenos</h5>

      {/* Contenedor de enlaces */}
      <div className="d-flex align-items-start">

        {/* Mapea sobre los enlaces obtenidos y renderiza un icono para cada uno */}
        {socialLinks.map((social) => (
          // Usar social.id como key si está disponible y es único
          <a key={social.id || social.url} href={social.url} className="text-white mx-2" target="_blank" rel="noopener noreferrer">
            <i className={`bi ${social.icon} fs-3`}></i>
          </a>

        ))}
      </div>

    </div>

  );
};