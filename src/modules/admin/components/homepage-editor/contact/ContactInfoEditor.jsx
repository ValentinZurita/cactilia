import React from 'react';

/**
 * Editor de información de contacto (teléfono, email, dirección, horario).
 *
 * @param {Object} props
 * @param {Object} [props.data={}]  - Datos de la sección (phone, email, address, etc.).
 * @param {Function} props.onUpdate - Función para actualizar la configuración.
 */
export function ContactInfoEditor({ data = {}, onUpdate }) {
  function handleChange(field, value) {
    onUpdate({ [field]: value });
  }

  return (
    <div className="contact-info-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Datos de Contacto</h6>
        <div className="row g-3">
          {/* Teléfono */}
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

          {/* Email */}
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

          {/* Dirección */}
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

          {/* Horario */}
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
        </div>
      </div>
    </div>
  );
}
