// src/modules/public/pages/ContactPage.jsx (versión actualizada)
import { useContactPageContent } from '../hooks/useContactPageContent';
import { Logo } from '../../../shared/components/logo/Logo.jsx';
import '../styles/contact.css';
import { ContactForm, ContactInfo } from '../components/contact/index.js';
import { SocialMediaLinks } from '../../../shared/components/footer/index.js';
import { CONTACT_INFO } from '../../../shared/constants/index.js';

/**
 * Página de Contacto con contenido personalizable:
 * Carga la configuración personalizada desde Firestore y muestra los elementos según
 * la configuración del administrador.
 *
 * @returns {JSX.Element} - Retorna la estructura de la página de contacto.
 */
export const ContactPage = () => {
  // Cargar contenido personalizado de la página
  const { pageContent, loading, getSection } = useContactPageContent();

  // Obtener configuración de cada sección
  const headerConfig = getSection('header');
  const contactInfoConfig = getSection('contactInfo');
  const formConfig = getSection('form');
  const mapConfig = getSection('map');

  // Obtener información de contacto (predeterminada o personalizada)
  const getContactDetails = () => {
    if (contactInfoConfig.useDefaultInfo !== false) {
      return {
        phone: CONTACT_INFO.phone,
        email: CONTACT_INFO.email,
        address: CONTACT_INFO.address
      };
    }
    return {
      phone: contactInfoConfig.customPhone || CONTACT_INFO.phone,
      email: contactInfoConfig.customEmail || CONTACT_INFO.email,
      address: contactInfoConfig.customAddress || CONTACT_INFO.address
    };
  };

  const contactDetails = getContactDetails();

  /**
   * Renderiza la sección de encabezado (título y subtítulo).
   */
  const renderHeadingSection = () => (
    <div className="row mb-4 mb-md-5">
      <div className="col-12 text-center">
        <h1 className="contact-title">{headerConfig.title || 'Contáctanos'}</h1>
        <p className="contact-subtitle">
          {headerConfig.subtitle || 'Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.'}
        </p>
      </div>
    </div>
  );

  /**
   * Renderiza la tarjeta con la información de contacto y enlaces a redes sociales.
   */
  const renderContactInfoCard = () => (
    <div className="contact-info-card">
      <div className="contact-info-header">
        <Logo styles={{ maxWidth: '100px' }} color="white" captionColor="text-white" />
        <h3 className="text-white mt-4 mb-3">¡Hablemos!</h3>
        <p className="text-white-50 mb-4">
          Ponte en contacto con nosotros a través de cualquiera de estos canales.
        </p>
      </div>

      {/* Información de contacto personalizada */}
      <div className="contact-details">
        <div className="contact-info-item">
          <div className="icon-container">
            <i className="bi bi-telephone-fill"></i>
          </div>
          <div className="info-content">
            <h6 className="info-title">Teléfono</h6>
            <p className="info-text">{contactDetails.phone}</p>
          </div>
        </div>
        <div className="contact-info-item">
          <div className="icon-container">
            <i className="bi bi-envelope-fill"></i>
          </div>
          <div className="info-content">
            <h6 className="info-title">Email</h6>
            <p className="info-text">{contactDetails.email}</p>
          </div>
        </div>
        <div className="contact-info-item">
          <div className="icon-container">
            <i className="bi bi-geo-alt-fill"></i>
          </div>
          <div className="info-content">
            <h6 className="info-title">Dirección</h6>
            <p className="info-text">{contactDetails.address}</p>
          </div>
        </div>
        <div className="contact-info-item">
          <div className="icon-container">
            <i className="bi bi-clock-fill"></i>
          </div>
          <div className="info-content">
            <h6 className="info-title">Horario</h6>
            <p className="info-text">Lunes a Viernes: 9am - 6pm</p>
          </div>
        </div>
      </div>

      {/* Redes sociales */}
      {contactInfoConfig.showSocialMedia !== false && (
        <div className="social-links mt-4">
          <h5 className="text-white-50 fw-light mb-3">Síguenos</h5>
          <SocialMediaLinks />
        </div>
      )}

      {/* Decoración */}
      <div className="contact-card-decoration">
        <div className="decoration-circle"></div>
        <div className="decoration-circle"></div>
      </div>
    </div>
  );

  /**
   * Renderiza la tarjeta que contiene el formulario de contacto.
   */
  const renderContactFormCard = () => (
    <div className="contact-form-card">
      <h3 className="mb-4">{formConfig.title || 'Envíanos un mensaje'}</h3>
      <ContactForm
        showName={formConfig.showNameField !== false}
        showEmail={formConfig.showEmailField !== false}
        showPhone={formConfig.showPhoneField !== false}
        showSubject={formConfig.showSubjectField !== false}
        showMessage={formConfig.showMessageField !== false}
        buttonText={formConfig.buttonText || 'Enviar mensaje'}
        buttonColor={formConfig.buttonColor || '#34C749'}
        privacyText={formConfig.privacyText}
      />
    </div>
  );

  /**
   * Renderiza el mapa de Google
   */
  const renderMap = () => {
    if (!mapConfig.embedUrl) return null;

    return (
      <div className="container-fluid px-0 mt-5">
        <div className="map-container" style={{ height: mapConfig.height || '400px' }}>
          <iframe
            src={mapConfig.embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps"
          ></iframe>
        </div>
      </div>
    );
  };

  // Mostrar spinner mientras carga el contenido
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  /**
   * Render principal de la página.
   */
  return (
    <div className="contact-page-container">
      <div className="container">
        {/* Sección de encabezado */}
        {renderHeadingSection()}

        {/* Contenido de la página */}
        <div className="row contact-content-wrapper">
          {/* Tarjeta de información de contacto */}
          {contactInfoConfig.showContactInfo !== false && (
            <div className="col-lg-5 mb-4 mb-lg-0">
              {renderContactInfoCard()}
            </div>
          )}

          {/* Tarjeta del formulario de contacto */}
          {formConfig.showForm !== false && (
            <div className={`col-lg-${contactInfoConfig.showContactInfo !== false ? '7' : '12'}`}>
              {renderContactFormCard()}
            </div>
          )}
        </div>
      </div>

      {/* Mapa */}
      {mapConfig.showMap !== false && renderMap()}
    </div>
  );
};