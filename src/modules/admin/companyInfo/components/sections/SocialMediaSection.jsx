import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Sección para redes sociales de la empresa
 * Con diseño elegante y minimalista
 */
const SocialMediaSection = ({ data, onUpdate }) => {
  const [socialMedia, setSocialMedia] = useState({
    facebook: data.facebook || '',
    instagram: data.instagram || '',
    twitter: data.twitter || '',
    youtube: data.youtube || '',
    tiktok: data.tiktok || '',
    pinterest: data.pinterest || ''
  });
  
  // Configuración de redes sociales disponibles
  const socialNetworks = [
    { id: 'facebook', name: 'Facebook', icon: 'facebook', placeholder: 'https://facebook.com/tuempresa', color: '#1877F2' },
    { id: 'instagram', name: 'Instagram', icon: 'instagram', placeholder: 'https://instagram.com/tuempresa', color: '#C13584' },
    { id: 'twitter', name: 'Twitter', icon: 'twitter-x', placeholder: 'https://twitter.com/tuempresa', color: '#000000' },
    { id: 'youtube', name: 'YouTube', icon: 'youtube', placeholder: 'https://youtube.com/c/tuempresa', color: '#FF0000' },
    { id: 'tiktok', name: 'TikTok', icon: 'tiktok', placeholder: 'https://tiktok.com/@tuempresa', color: '#000000' },
    { id: 'pinterest', name: 'Pinterest', icon: 'pinterest', placeholder: 'https://pinterest.com/tuempresa', color: '#E60023' }
  ];
  
  /**
   * Actualizar una red social específica
   * @param {string} network - ID de la red social
   * @param {string} value - URL o identificador
   */
  const handleSocialChange = (network, value) => {
    const updatedSocial = {
      ...socialMedia,
      [network]: value
    };
    
    setSocialMedia(updatedSocial);
    onUpdate(updatedSocial);
  };
  
  /**
   * Verificar si una URL es válida
   * @param {string} url - URL a verificar
   * @returns {boolean} - Resultado de la validación
   */
  const isValidUrl = (url) => {
    if (!url) return true; // Vacío es válido
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  return (
    <div className="social-media-section">
      <div className="row mb-4">
        <div className="col-12 mb-4">
          <h5 className="fw-medium mb-3">
            <i className="bi bi-share me-2"></i>
            Redes Sociales
          </h5>
          <p className="text-muted">
            Configura los enlaces a tus redes sociales que se mostrarán en tu tienda.
          </p>
        </div>
      </div>
      
      {/* Cards de redes sociales */}
      <div className="row g-4">
        {socialNetworks.map((network) => (
          <div className="col-md-6 col-lg-4" key={network.id}>
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-header bg-white border-0 pt-3" style={{ borderLeft: `4px solid ${network.color}` }}>
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" 
                    style={{ backgroundColor: `${network.color}20`, width: 40, height: 40 }}
                  >
                    <i className={`bi bi-${network.icon}`} style={{ color: network.color }}></i>
                  </div>
                  <h6 className="mb-0 fw-medium">{network.name}</h6>
                </div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <input
                    type="url"
                    className={`form-control ${socialMedia[network.id] && !isValidUrl(socialMedia[network.id]) ? 'is-invalid' : ''}`}
                    value={socialMedia[network.id] || ''}
                    onChange={(e) => handleSocialChange(network.id, e.target.value)}
                    placeholder={network.placeholder}
                    aria-label={`URL de ${network.name}`}
                  />
                  {socialMedia[network.id] && !isValidUrl(socialMedia[network.id]) && (
                    <div className="invalid-feedback">
                      Por favor, ingresa una URL válida
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-muted small">
        <i className="bi bi-info-circle me-1"></i>
        Deja en blanco las redes sociales que no quieras mostrar.
      </div>
    </div>
  );
};

SocialMediaSection.propTypes = {
  data: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default SocialMediaSection; 