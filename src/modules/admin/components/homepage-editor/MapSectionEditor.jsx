// src/modules/admin/components/contact-editor/MapSectionEditor.jsx
import { useState } from 'react';

/**
 * Editor para la sección del mapa de Google
 *
 * @param {Object} data - Datos actuales de la sección
 * @param {Function} onUpdate - Función para actualizar los datos
 * @returns {JSX.Element}
 */
export const MapSectionEditor = ({ data = {}, onUpdate }) => {

  // Manejador para cambios en campos de texto
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  // Manejador para cambios en campos booleanos (toggles)
  const handleToggleChange = (field) => {
    onUpdate({ [field]: !data[field] });
  };

  return (
    <div className="map-section-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Configuración del Mapa</h6>

        {/* Mostrar mapa */}
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="showMap"
            checked={data.showMap !== false}
            onChange={() => handleToggleChange('showMap')}
          />
          <label className="form-check-label" htmlFor="showMap">
            Mostrar mapa
          </label>
        </div>
      </div>

      {data.showMap !== false && (
        <>
          <div className="mb-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">URL de Inserción</h6>

            {/* URL de Google Maps */}
            <div className="mb-3">
              <label htmlFor="embedUrl" className="form-label">URL de inserción de Google Maps</label>
              <textarea
                className="form-control"
                id="embedUrl"
                value={data.embedUrl || ''}
                onChange={(e) => handleChange('embedUrl', e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                rows="4"
              />
              <div className="form-text">
                <small>
                  Para obtener esta URL, ve a Google Maps, busca tu ubicación, haz clic en "Compartir", selecciona "Insertar un mapa" y copia solo la URL del iframe.
                </small>
              </div>
            </div>

            {/* Altura del mapa */}
            <div className="mb-3">
              <label htmlFor="mapHeight" className="form-label">Altura del mapa</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="mapHeight"
                  value={data.height || '400px'}
                  onChange={(e) => handleChange('height', e.target.value)}
                  placeholder="400px"
                />
                <span className="input-group-text">px</span>
              </div>
              <div className="form-text">
                <small>
                  Especifica la altura del mapa en píxeles (ej: 400px)
                </small>
              </div>
            </div>
          </div>

          {/* Vista previa del mapa */}
          <div className="mb-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Vista Previa del Mapa</h6>

            {data.embedUrl ? (
              <div className="map-preview">
                <iframe
                  src={data.embedUrl}
                  width="100%"
                  height={data.height || '400px'}
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                ></iframe>
              </div>
            ) : (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Ingresa una URL de inserción para ver la vista previa del mapa
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};