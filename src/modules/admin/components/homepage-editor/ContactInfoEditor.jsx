import { useState } from 'react';
import { CONTACT_INFO } from '../../../../shared/constants/index.js';

/**
 * Enhanced editor component for contact information section
 *
 * @param {Object} props
 * @param {Object} props.data - Current contact info configuration
 * @param {Function} props.onUpdate - Callback when configuration is updated
 * @returns {JSX.Element}
 */
export const ContactInfoEditor = ({ data = {}, onUpdate }) => {
  // Hold state for the hours configuration
  const [customHours, setCustomHours] = useState(data.customHours || 'Lunes a Viernes: 9am - 6pm');

  /**
   * Handle changes to text input fields
   * @param {string} field - Field name to update
   * @param {string} value - New field value
   */
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  /**
   * Handle changes to boolean toggle fields
   * @param {string} field - Field name to toggle
   */
  const handleToggleChange = (field) => {
    onUpdate({ [field]: !data[field] });
  };

  /**
   * Handle changes to business hours text
   * @param {Event} e - Input change event
   */
  const handleHoursChange = (e) => {
    const value = e.target.value;
    setCustomHours(value);
    onUpdate({ customHours: value });
  };

  return (
    <div className="contact-info-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Configuración General</h6>

        {/* Show contact info toggle */}
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
      </div>

      {data.showContactInfo !== false && (
        <div className="mb-4">
          <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Datos de Contacto</h6>

          {/* Use default info toggle */}
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

          {/* Default contact info (read-only) */}
          {data.useDefaultInfo !== false && (
            <div className="card bg-light border-0 p-3 mb-3">
              <h6 className="mb-3 text-muted">Información predeterminada</h6>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="mb-2">
                    <strong className="d-block">Teléfono:</strong>
                    <span className="text-muted">{CONTACT_INFO.phone}</span>
                  </div>

                  <div className="mb-2">
                    <strong className="d-block">Email:</strong>
                    <span className="text-muted">{CONTACT_INFO.email}</span>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-2">
                    <strong className="d-block">Dirección:</strong>
                    <span className="text-muted">{CONTACT_INFO.address}</span>
                  </div>

                  <div className="mb-2">
                    <strong className="d-block">Horario:</strong>
                    <span className="text-muted">Lunes a Viernes: 9am - 6pm</span>
                  </div>
                </div>
              </div>

              <div className="alert alert-info mt-3 mb-0 py-2">
                <small>
                  <i className="bi bi-info-circle me-2"></i>
                  Para cambiar estos valores predeterminados, edita el archivo <code>src/shared/constants/footerLinks.js</code>
                </small>
              </div>
            </div>
          )}

          {/* Custom contact info */}
          {data.useDefaultInfo === false && (
            <div className="card border-0 p-3 mb-3">
              <h6 className="mb-3">Información personalizada</h6>

              <div className="row g-3">
                <div className="col-md-6">
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
                </div>

                <div className="col-md-6">
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

                  <div className="mb-3">
                    <label htmlFor="customHours" className="form-label">Horario</label>
                    <input
                      type="text"
                      className="form-control"
                      id="customHours"
                      value={customHours}
                      onChange={handleHoursChange}
                      placeholder="Lunes a Viernes: 9am - 6pm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {data.showContactInfo !== false && (
        <SocialMediaEditorSection data={data} onUpdate={onUpdate} />
      )}
    </div>
  );
};

/**
 * Social media section for contact info editor
 *
 * @param {Object} props
 * @param {Object} props.data - Current configuration data
 * @param {Function} props.onUpdate - Update callback
 * @returns {JSX.Element}
 */
const SocialMediaEditorSection = ({ data, onUpdate }) => (
  <div className="social-media-section mb-4">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <h6 className="mb-0 fw-bold text-primary">Redes Sociales</h6>

      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="showSocialMediaBasic"
          checked={data.showSocialMedia !== false}
          onChange={() => onUpdate({ showSocialMedia: !data.showSocialMedia })}
        />
        <label className="form-check-label" htmlFor="showSocialMediaBasic">
          Mostrar
        </label>
      </div>
    </div>

    {data.showSocialMedia !== false && (
      <div className="alert alert-info mt-3">
        <div className="d-flex">
          <i className="bi bi-info-circle me-2 fs-5"></i>
          <div>
            <p className="mb-1">Puedes personalizar las redes sociales en la sección específica más abajo.</p>
            <small>Allí podrás modificar URLs y la visibilidad de cada red social.</small>
          </div>
        </div>
      </div>
    )}
  </div>
);