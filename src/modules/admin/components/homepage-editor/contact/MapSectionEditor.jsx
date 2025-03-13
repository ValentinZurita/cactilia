import React from 'react';

/**
 * Editor para el mapa (Google Maps).
 *
 * @param {Object} props
 * @param {Object} [props.data={}]  - Datos actuales (URL de inserción, etc.).
 * @param {Function} props.onUpdate - Función de callback para actualizar el estado.
 */
export function MapSectionEditor({ data = {}, onUpdate }) {
  /** Actualiza un campo de texto */
  function handleChange(field, value) {
    onUpdate({ [field]: value });
  }

  /** Alterna un campo booleano (p.ej. mostrar/ocultar) */
  function handleToggleChange(field) {
    onUpdate({ [field]: !data[field] });
  }

  return (
    <div className="map-section-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Configuración del Mapa</h6>

        {/* Toggle para mostrar/ocultar */}
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
            Mostrar mapa de ubicación
          </label>
        </div>

        {data.showMap !== false && (
          <>
            {/* URL de inserción */}
            <div className="mb-3">
              <label htmlFor="embedUrl" className="form-label">URL de inserción de Google Maps</label>
              <textarea
                className="form-control"
                id="embedUrl"
                value={data.embedUrl || ''}
                onChange={(e) => handleChange('embedUrl', e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                rows="3"
              />
              <div className="form-text">
                Para obtener esta URL, ve a Google Maps, busca tu ubicación, haz clic en "Compartir",
                selecciona "Insertar un mapa" y copia la URL del iframe.
              </div>
            </div>

            {/* Vista previa del mapa */}
            <div className="mb-3">
              <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Vista Previa del Mapa</h6>
              {data.embedUrl ? (
                <div className="map-preview">
                  <iframe
                    src={data.embedUrl}
                    width="100%"
                    height="300px"
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
    </div>
  );
}
