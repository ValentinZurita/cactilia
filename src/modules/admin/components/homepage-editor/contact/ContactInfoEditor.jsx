/**
 * Editor de información de contacto (teléfono, email, dirección, horario).
 *
 * @param {Object}   props
 * @param {Object}   [props.data={}]   - Datos de la sección (phone, email, address, etc.).
 * @param {Function} props.onUpdate    - Función para actualizar la configuración.
 */
export function ContactInfoEditor({ data = {}, onUpdate }) {
  // =========================================================================
  // 1. Manejador de cambios: Actualiza una propiedad específica
  // =========================================================================
  function handleChange(field, value) {
    onUpdate({ [field]: value });
  }

  // =========================================================================
  // 2. Render principal: separamos en helpers para mejorar la legibilidad
  // =========================================================================
  return (
    <div className="contact-info-editor">
      <div className="mb-4">
        {renderHeader()}
        {renderContactFields()}
      </div>
    </div>
  );

  // =========================================================================
  // 3. Funciones locales de render (helpers)
  // =========================================================================

  /**
   * Renderiza el encabezado (título y división de la sección).
   */
  function renderHeader() {
    return (
      <>
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">
          Datos de Contacto
        </h6>
      </>
    );
  }

  /**
   * Renderiza los campos de contacto en un grid (teléfono, email, dirección, horario).
   */
  function renderContactFields() {
    return (
      <div className="row g-3">
        {renderPhoneField()}
        {renderEmailField()}
        {renderAddressField()}
        {renderHoursField()}
      </div>
    );
  }

  /**
   * Campo: Teléfono
   */
  function renderPhoneField() {
    return (
      <div className="col-md-6">
        <div className="mb-3">
          <label htmlFor="customPhone" className="form-label">Teléfono</label>
          <input
            type="text"
            className="form-control"
            id="customPhone"
            value={data.customPhone || ''}
            onChange={(e) => handleChange('customPhone', e.target.value)}
            placeholder="Ej: +52 55 1234 5678"
          />
        </div>
      </div>
    );
  }

  /**
   * Campo: Email
   */
  function renderEmailField() {
    return (
      <div className="col-md-6">
        <div className="mb-3">
          <label htmlFor="customEmail" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="customEmail"
            value={data.customEmail || ''}
            onChange={(e) => handleChange('customEmail', e.target.value)}
            placeholder="Ej: contacto@cactilia.com"
          />
        </div>
      </div>
    );
  }

  /**
   * Campo: Dirección
   */
  function renderAddressField() {
    return (
      <div className="col-md-6">
        <div className="mb-3">
          <label htmlFor="customAddress" className="form-label">Dirección</label>
          <textarea
            className="form-control"
            id="customAddress"
            value={data.customAddress || ''}
            onChange={(e) => handleChange('customAddress', e.target.value)}
            placeholder="Ej: Av. Siempre Viva 742, CDMX"
            rows="2"
          />
        </div>
      </div>
    );
  }

  /**
   * Campo: Horario
   */
  function renderHoursField() {
    return (
      <div className="col-md-6">
        <div className="mb-3">
          <label htmlFor="customHours" className="form-label">Horario</label>
          <input
            type="text"
            className="form-control"
            id="customHours"
            value={data.customHours || ''}
            onChange={(e) => handleChange('customHours', e.target.value)}
            placeholder="Ej: Lunes a Viernes: 9am - 6pm"
          />
        </div>
      </div>
    );
  }
}
