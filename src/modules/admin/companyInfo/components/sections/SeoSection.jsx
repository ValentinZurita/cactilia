import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { InputField } from '../../../common/components/InputField.jsx';

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
      <div className="row g-4">
        {/* Nombre del Sitio (Google/Título) */}
        <div className="col-md-6">
          <InputField 
            id="siteName"
            name="siteName"
            label="Nombre del Sitio (para Google/Título)"
            value={seoInfo.siteName}
            onChange={handleChange}
            placeholder="Ej. Cactilia - Granja Urbana"
            helpText="Este nombre aparece en el título de la pestaña del navegador y es la sugerencia principal para Google como \'Nombre del Sitio\'."
            required
            colWidth="col-12"
          />
        </div>

        {/* Favicon URL */}
        <div className="col-md-6">
          <InputField 
            id="faviconUrl"
            name="faviconUrl" 
            label="URL del Favicon"
            value={seoInfo.faviconUrl}
            onChange={handleChange}
            type="url"
            placeholder="https://ejemplo.com/favicon.ico"
            helpText="URL completa del icono (.ico o .png) que se muestra en la pestaña del navegador. Debe ser accesible públicamente."
            colWidth="col-12"
          />
        </div>

        {/* Meta Descripción (SEO) */}
        <div className="col-12">
          <InputField 
            id="metaDescription"
            name="metaDescription" 
            label="Meta Descripción (para Google)"
            value={seoInfo.metaDescription}
            onChange={handleChange}
            placeholder="Describe tu sitio brevemente para los resultados de búsqueda (150-160 caracteres recomendados)..."
            helpText="Texto breve (150-160 caracteres idealmente) que describe tu sitio. Sugerencia para la descripción en resultados de Google."
            isTextArea={true}
            rows={4}
            colWidth="col-12"
            // maxLength="160" // InputField no soporta maxLength directamente, se podría añadir si es crítico
          />
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