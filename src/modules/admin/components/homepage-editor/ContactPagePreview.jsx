// src/modules/admin/components/contact-editor/ContactPagePreview.jsx
import React from 'react';
import { CONTACT_INFO, SOCIAL_MEDIA_LINKS } from '../../../../shared/constants/index.js';

/**
 * Componente que muestra una vista previa simplificada de la página de contacto
 *
 * @param {Object} config - Configuración de la página de contacto
 * @returns {JSX.Element}
 */
export const ContactPagePreview = ({ config }) => {
  if (!config) return null;

  // Obtener datos de las secciones
  const header = config.header || {};
  const contactInfo = config.contactInfo || {};
  const form = config.form || {};
  const map = config.map || {};

  // Obtener información de contacto (predeterminada o personalizada)
  const getContactDetails = () => {
    if (contactInfo.useDefaultInfo !== false) {
      return {
        phone: CONTACT_INFO.phone,
        email: CONTACT_INFO.email,
        address: CONTACT_INFO.address
      };
    }
    return {
      phone: contactInfo.customPhone || CONTACT_INFO.phone,
      email: contactInfo.customEmail || CONTACT_INFO.email,
      address: contactInfo.customAddress || CONTACT_INFO.address
    };
  };

  const contactDetails = getContactDetails();

  return (
    <div className="contact-page-preview">
      <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Vista Previa</h6>

      <div className="preview-container">
        {/* Sección de encabezado */}
        <div className="preview-section mb-4">
          <div
            className="header-preview p-4 text-center rounded"
            style={{
              backgroundColor: header.showBackground !== false ? '#f8f9fa' : 'transparent',
              backgroundImage: header.backgroundImage ? `url(${header.backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              overflow: 'hidden',
              color: header.backgroundImage ? 'white' : '#333'
            }}
          >
            {/* Overlay para imágenes oscuras */}
            {header.backgroundImage && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  zIndex: 1
                }}
              />
            )}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h3 className="mb-2">{header.title || 'Contáctanos'}</h3>
              <p className="text-sm mb-0">
                {header.subtitle || 'Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.'}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="preview-section mb-4">
          <div className="row g-4">
            {/* Columna de información de contacto */}
            {contactInfo.showContactInfo !== false && (
              <div className="col-md-5">
                <div className="contact-info-preview p-4 bg-success text-white h-100 rounded">
                  <h4 className="mb-4">¡Hablemos!</h4>

                  {/* Teléfono */}
                  <div className="contact-info-item d-flex mb-3">
                    <div className="contact-icon me-3">
                      <i className="bi bi-telephone-fill"></i>
                    </div>
                    <div>
                      <h6 className="mb-1">Teléfono</h6>
                      <p className="mb-0">{contactDetails.phone}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="contact-info-item d-flex mb-3">
                    <div className="contact-icon me-3">
                      <i className="bi bi-envelope-fill"></i>
                    </div>
                    <div>
                      <h6 className="mb-1">Email</h6>
                      <p className="mb-0">{contactDetails.email}</p>
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="contact-info-item d-flex mb-3">
                    <div className="contact-icon me-3">
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div>
                      <h6 className="mb-1">Dirección</h6>
                      <p className="mb-0">{contactDetails.address}</p>
                    </div>
                  </div>

                  {/* Redes sociales */}
                  {contactInfo.showSocialMedia !== false && (
                    <div className="social-links mt-4">
                      <h6 className="mb-2">Síguenos</h6>
                      <div className="d-flex">
                        {SOCIAL_MEDIA_LINKS.map((social, index) => (
                          <div key={index} className="social-icon me-2">
                            <i className={`bi ${social.icon}`}></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Columna del formulario */}
            {form.showForm !== false && (
              <div className={`col-md-${contactInfo.showContactInfo !== false ? '7' : '12'}`}>
                <div className="form-preview p-4 bg-white border rounded">
                  <h4 className="mb-4">{form.title || 'Envíanos un mensaje'}</h4>

                  <div className="row g-3">
                    {/* Nombre */}
                    {form.showNameField !== false && (
                      <div className="col-md-6">
                        <div className="form-control-preview p-2 bg-light rounded">Nombre</div>
                      </div>
                    )}

                    {/* Email */}
                    {form.showEmailField !== false && (
                      <div className="col-md-6">
                        <div className="form-control-preview p-2 bg-light rounded">Email</div>
                      </div>
                    )}

                    {/* Teléfono */}
                    {form.showPhoneField !== false && (
                      <div className="col-md-6">
                        <div className="form-control-preview p-2 bg-light rounded">Teléfono</div>
                      </div>
                    )}

                    {/* Asunto */}
                    {form.showSubjectField !== false && (
                      <div className="col-md-6">
                        <div className="form-control-preview p-2 bg-light rounded">Asunto</div>
                      </div>
                    )}

                    {/* Mensaje */}
                    {form.showMessageField !== false && (
                      <div className="col-12">
                        <div className="form-control-preview p-2 bg-light rounded" style={{ height: '80px' }}>Mensaje</div>
                      </div>
                    )}

                    {/* Botón de enviar */}
                    <div className="col-12">
                      <button
                        className="btn w-100 mt-3"
                        style={{
                          backgroundColor: form.buttonColor || '#34C749',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        {form.buttonText || 'Enviar mensaje'}
                      </button>

                      {/* Texto de privacidad */}
                      {form.privacyText && (
                        <p className="text-muted text-center small mt-2">
                          {form.privacyText}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección del mapa */}
        {map.showMap !== false && (
          <div className="preview-section">
            <div className="map-preview rounded overflow-hidden" style={{ height: '200px', backgroundColor: '#e9e9e9' }}>
              {map.embedUrl ? (
                <iframe
                  src={map.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                ></iframe>
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                  <div className="text-center">
                    <i className="bi bi-map fs-1 d-block mb-2"></i>
                    <span>Vista previa del mapa</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-3">
        <small className="text-muted">
          Esta es una vista previa simplificada. Para ver la página completa, haz clic en "Previsualizar página".
        </small>
      </div>
    </div>
  );
};