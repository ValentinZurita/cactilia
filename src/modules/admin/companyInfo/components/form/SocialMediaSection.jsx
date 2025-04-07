import React from 'react';
import PropTypes from 'prop-types';
import { FormSection } from './FormSection';

/**
 * Sección para redes sociales
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.data - Datos de redes sociales
 * @param {Function} props.onUpdate - Función para actualizar redes sociales
 * @returns {JSX.Element} Sección de redes sociales
 */
export const SocialMediaSection = ({ data, onUpdate }) => {
  /**
   * Actualizar una red social específica
   * @param {string} network - Nombre de la red social
   * @param {string} value - Valor (URL/identificador)
   */
  const handleSocialChange = (network, value) => {
    const updatedSocial = {
      ...data,
      [network]: value
    };
    
    onUpdate(updatedSocial);
  };
  
  // Configuración de redes sociales disponibles
  const socialNetworks = [
    { id: 'facebook', name: 'Facebook', icon: 'bi-facebook', placeholder: 'https://facebook.com/tuempresa' },
    { id: 'instagram', name: 'Instagram', icon: 'bi-instagram', placeholder: 'https://instagram.com/tuempresa' },
    { id: 'twitter', name: 'Twitter', icon: 'bi-twitter-x', placeholder: 'https://twitter.com/tuempresa' },
    { id: 'youtube', name: 'YouTube', icon: 'bi-youtube', placeholder: 'https://youtube.com/c/tuempresa' },
    { id: 'tiktok', name: 'TikTok', icon: 'bi-tiktok', placeholder: 'https://tiktok.com/@tuempresa' },
    { id: 'pinterest', name: 'Pinterest', icon: 'bi-pinterest', placeholder: 'https://pinterest.com/tuempresa' }
  ];
  
  return (
    <FormSection 
      title="Redes Sociales" 
      icon="bi-share"
      description="Enlaces a las redes sociales de tu empresa"
    >
      <div className="row g-3">
        {socialNetworks.map((network) => (
          <div className="col-md-6" key={network.id}>
            <label htmlFor={`social-${network.id}`} className="form-label">
              <i className={`bi ${network.icon} me-1`}></i> {network.name}
            </label>
            <input
              type="url"
              className="form-control"
              id={`social-${network.id}`}
              value={data[network.id] || ''}
              onChange={(e) => handleSocialChange(network.id, e.target.value)}
              placeholder={network.placeholder}
            />
          </div>
        ))}
      </div>
      
      <div className="form-text text-muted mt-3">
        <i className="bi bi-info-circle me-1"></i>
        Ingresa las URL completas incluyendo https://
      </div>
    </FormSection>
  );
};

SocialMediaSection.propTypes = {
  data: PropTypes.shape({
    facebook: PropTypes.string,
    instagram: PropTypes.string,
    twitter: PropTypes.string,
    youtube: PropTypes.string,
    tiktok: PropTypes.string,
    pinterest: PropTypes.string
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
}; 