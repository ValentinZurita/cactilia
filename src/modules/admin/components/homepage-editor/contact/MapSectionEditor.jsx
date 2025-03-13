/**
 * Editor para el mapa (Google Maps).
 *
 * @param {Object}   props
 * @param {Object}   [props.data={}]  - Datos actuales (URL de inserción, etc.).
 * @param {Function} props.onUpdate   - Función de callback para actualizar el estado.
 */
export function MapSectionEditor({ data = {}, onUpdate }) {
  // =========================================================================
  // 1. Manejadores de cambios
  // =========================================================================

  /**
   * Actualiza un campo de texto dentro del objeto data.
   *
   * @param {string} field - Nombre del campo a actualizar.
   * @param {string} value - Nuevo valor.
   */
  function handleChange(field, value) {
    onUpdate({ [field]: value });
  }

  /**
   * Alterna un campo booleano (ej. mostrar/ocultar mapa).
   *
   * @param {string} field - Nombre del campo a alternar.
   */
  function handleToggleChange(field) {
    onUpdate({ [field]: !data[field] });
  }

  // =========================================================================
  // 2. Render principal: dividimos en helpers para mayor legibilidad
  // =========================================================================

  return (
    <div className="map-section-editor">
      <div className="mb-4">
        {renderHeader()}
        {renderShowMapToggle()}
        {data.showMap !== false && (
          <>
            {renderMapUrlField()}
            {renderMapPreview()}
          </>
        )}
      </div>
    </div>
  );

  // =========================================================================
  // 3. Funciones locales de render (helpers)
  // =========================================================================

  /**
   * Renderiza el encabezado de la sección (título).
   */
  function renderHeader() {
    return (
      <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">
        Configuración del Mapa
      </h6>
    );
  }

  /**
   * Muestra el toggle para habilitar o deshabilitar la visualización del mapa.
   */
  function renderShowMapToggle() {
    return (
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
    );
  }

  /**
   * Campo de texto para la URL de inserción de Google Maps.
   */
  function renderMapUrlField() {
    return (
      <div className="mb-3">
        <label htmlFor="embedUrl" className="form-label">
          URL de inserción de Google Maps
        </label>
        <textarea
          className="form-control"
          id="embedUrl"
          value={data.embedUrl || ''}
          onChange={(e) => handleChange('embedUrl', e.target.value)}
          placeholder="https://www.google.com/maps/embed?pb=..."
          rows="3"
        />
        <div className="form-text">
          Para obtener esta URL, ve a Google Maps, busca tu ubicación, haz clic en
          "Compartir", selecciona "Insertar un mapa" y copia la URL del iframe.
        </div>
      </div>
    );
  }

  /**
   * Vista previa del mapa, basada en la URL (embedUrl).
   * Si no hay URL, muestra un mensaje informativo.
   */
  function renderMapPreview() {
    return (
      <div className="mb-3">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">
          Vista Previa del Mapa
        </h6>
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
    );
  }
}
