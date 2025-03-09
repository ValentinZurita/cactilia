// src/modules/admin/components/homepage-editor/FeaturedProductsEditor.jsx
import { useState } from 'react';

/**
 * Editor para la sección de Productos Destacados
 */
export const FeaturedProductsEditor = ({ data = {}, onUpdate }) => {
  // Manejador para cambios en campos de texto
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  // Manejador para cambios en campos booleanos (toggles)
  const handleToggleChange = (field) => {
    onUpdate({ [field]: !data[field] });
  };

  return (
    <div className="featured-products-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3">Contenido Principal</h6>

        {/* Título */}
        <div className="mb-3">
          <label htmlFor="featuredTitle" className="form-label">Título</label>
          <input
            type="text"
            className="form-control"
            id="featuredTitle"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ej: Productos Destacados"
          />
        </div>

        {/* Subtítulo */}
        <div className="mb-3">
          <label htmlFor="featuredSubtitle" className="form-label">Subtítulo</label>
          <input
            type="text"
            className="form-control"
            id="featuredSubtitle"
            value={data.subtitle || ''}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="Ej: Explora nuestra selección especial"
          />
        </div>

        {/* Icono */}
        <div className="mb-3">
          <label htmlFor="featuredIcon" className="form-label">Icono</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className={`bi ${data.icon || 'bi-star-fill'}`}></i>
            </span>
            <input
              type="text"
              className="form-control"
              id="featuredIcon"
              value={data.icon || 'bi-star-fill'}
              onChange={(e) => handleChange('icon', e.target.value)}
              placeholder="Ej: bi-star-fill"
            />
          </div>
          <div className="form-text">
            Usa clases de <a href="https://icons.getbootstrap.com/" target="_blank">Bootstrap Icons</a>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h6 className="fw-bold mb-3">Apariencia</h6>

        {/* Fondo */}
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="featuredShowBg"
            checked={data.showBg === true}
            onChange={() => handleToggleChange('showBg')}
          />
          <label className="form-check-label" htmlFor="featuredShowBg">
            Mostrar fondo claro
          </label>
        </div>
      </div>
    </div>
  );
};






