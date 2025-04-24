import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Sección para configurar los metadatos SEO y de navegador
 */
const SeoSection = ({ data, onUpdate }) => {
  const [seoInfo, setSeoInfo] = useState({
    siteName: data.siteName || '', // Nombre para <title> y JSON-LD
    metaDescription: data.metaDescription || '', // Para <meta name="description">
    faviconUrl: data.faviconUrl || '' // Para <link rel="icon">
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedInfo = {
      ...seoInfo,
      [name]: value
    };
    
    setSeoInfo(updatedInfo);
    onUpdate(updatedInfo); // Enviar el objeto seo actualizado
  };

  return (
    <div className="seo-section">
      <div className="row mb-4">
        <div className="col-12 mb-4">
          <h5 className="fw-medium mb-3">
            <i className="bi bi-google me-2"></i>
            SEO / Metadatos del Navegador
          </h5>
          <p className="text-muted">
            Configuración de cómo se presenta tu sitio en buscadores y pestañas del navegador.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Nombre del Sitio (Google/Título) */}
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="siteName" className="form-label">
              Nombre del Sitio (para Google/Título) <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="siteName"
              name="siteName"
              value={seoInfo.siteName}
              onChange={handleChange}
              placeholder="Ej. Cactilia - Granja Urbana"
              required
            />
            <small className="form-text text-muted">
              Se usará en la etiqueta &lt;title&gt; y como sugerencia a Google para el nombre del sitio.
            </small>
          </div>
        </div>

        {/* Favicon URL */}
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="faviconUrl" className="form-label">
              URL del Favicon
            </label>
            <input
              type="url"
              className="form-control"
              id="faviconUrl"
              name="faviconUrl" // Asegúrate que el name coincida con el estado
              value={seoInfo.faviconUrl}
              onChange={handleChange}
              placeholder="https://ejemplo.com/favicon.ico"
            />
            <small className="form-text text-muted">
              Icono (.ico, .png) para la pestaña del navegador.
            </small>
          </div>
        </div>

        {/* Meta Descripción (SEO) */}
        <div className="col-12">
          <div className="form-group">
            <label htmlFor="metaDescription" className="form-label">
              Meta Descripción (para Google)
            </label>
            <textarea
              className="form-control"
              id="metaDescription"
              name="metaDescription" // Asegúrate que el name coincida con el estado
              value={seoInfo.metaDescription}
              onChange={handleChange}
              rows="4"
              placeholder="Describe tu sitio brevemente para los resultados de búsqueda (150-160 caracteres recomendados)..."
              maxLength="160" // Opcional: limitar longitud
            ></textarea>
            <small className="form-text text-muted">
              Sugerencia a Google para la descripción en los resultados de búsqueda.
            </small>
          </div>
        </div>

      </div>
    </div>
  );
};

SeoSection.propTypes = {
  data: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default SeoSection; 