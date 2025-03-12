// src/modules/admin/components/contact-editor/ContactInfoEditor.jsx
import { useState } from 'react';
import { CONTACT_INFO } from '../../../../shared/constants/index.js'

/**
 * Editor para la sección de información de contacto
 *
 * @param {Object} data - Datos actuales de la sección
 * @param {Function} onUpdate - Función para actualizar los datos
 * @returns {JSX.Element}
 */
export const ContactInfoEditor = ({ data = {}, onUpdate }) => {

  // Manejador para cambios en campos de texto
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  // Manejador para cambios en campos booleanos (toggles)
  const handleToggleChange = (field) => {
    onUpdate({ [field]: !data[field] });
  };

  return (
    <div className="contact-info-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Configuración General</h6>

        {/* Mostrar información de contacto */}
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="showContactInfo"
            checked={data.showContactInfo !== false}
            onChange={() => handleToggleChange('showContactInfo')}
          />
          <label className="form-check-label" htmlFor="showContactInfo">
            Mostrar información de contacto
          </label>
        </div>

        {/* Mostrar redes sociales */}
        {data.showContactInfo !== false && (
          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="showSocialMedia"
              checked={data.showSocialMedia !== false}
              onChange={() => handleToggleChange('showSocialMedia')}
            />
            <label className="form-check-label" htmlFor="showSocialMedia">
              Mostrar redes sociales
            </label>
          </div>
        )}
      </div>

      {data.showContactInfo !== false && (
        <div className="mb-4">
          <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Datos de Contacto</h6>

          {/* Usar información predeterminada */}
          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="useDefaultInfo"
              checked={data.useDefaultInfo !== false}
              onChange={() => handleToggleChange('useDefaultInfo')}
            />
            <label className="form-check-label" htmlFor="useDefaultInfo">
              Usar información predeterminada
            </label>
            <div className="form-text">
              <small>Si está activado, se usará la información de contacto definida en las constantes globales.</small>
            </div>
          </div>

          {/* Información predeterminada (solo lectura) */}
          {data.useDefaultInfo !== false && (
            <div className="card bg-light border-0 p-3 mb-3">
              <h6 className="mb-3 text-muted">Información predeterminada</h6>

              <div className="mb-2">
                <strong className="d-block">Teléfono:</strong>
                <span className="text-muted">{CONTACT_INFO.phone}</span>
              </div>

              <div className="mb-2">
                <strong className="d-block">Email:</strong>
                <span className="text-muted">{CONTACT_INFO.email}</span>
              </div>

              <div className="mb-2">
                <strong className="d-block">Dirección:</strong>
                <span className="text-muted">{CONTACT_INFO.address}</span>
              </div>

              <div className="alert alert-info mt-2 mb-0 py-2">
                <small>
                  <i className="bi bi-info-circle me-2"></i>
                  Para cambiar estos valores predeterminados, edita el archivo <code>src/shared/constants/footerLinks.js</code>
                </small>
              </div>
            </div>
          )}

          {/* Información personalizada */}
          {data.useDefaultInfo === false && (
            <div className="card border-0 p-3 mb-3">
              <h6 className="mb-3">Información personalizada</h6>

              <div className="mb-3">
                <label htmlFor="customPhone" className="form-label">Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  id="customPhone"
                  value={data.customPhone || ''}
                  onChange={(e) => handleChange('customPhone', e.target.value)}
                  placeholder={CONTACT_INFO.phone}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="customEmail" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="customEmail"
                  value={data.customEmail || ''}
                  onChange={(e) => handleChange('customEmail', e.target.value)}
                  placeholder={CONTACT_INFO.email}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="customAddress" className="form-label">Dirección</label>
                <textarea
                  className="form-control"
                  id="customAddress"
                  value={data.customAddress || ''}
                  onChange={(e) => handleChange('customAddress', e.target.value)}
                  placeholder={CONTACT_INFO.address}
                  rows="2"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};