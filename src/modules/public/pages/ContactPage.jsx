// src/modules/public/pages/ContactPage.jsx
import { useContactPageContent } from '../hooks/useContactPageContent';
import { Logo } from '../../../shared/components/logo/Logo.jsx';
import '../styles/contact.css';
import { ContactForm } from '../components/contact/index.js';
import { CONTACT_INFO } from '../../../shared/constants/index.js';

/**
 * Enhanced Contact Page component that uses the customizable content
 * managed through the admin interface
 *
 * @returns {JSX.Element}
 */
export const ContactPage = () => {
  // Load customized content for the page
  const { pageContent, loading, getSection } = useContactPageContent();

  // Get configuration for each section
  const headerConfig = getSection('header');
  const contactInfoConfig = getSection('contactInfo');
  const formConfig = getSection('form');
  const mapConfig = getSection('map');
  const socialMediaConfig = getSection('socialMedia');

  // Get contact information (default or custom)
  const getContactDetails = () => {
    if (contactInfoConfig.useDefaultInfo !== false) {
      return {
        phone: CONTACT_INFO.phone,
        email: CONTACT_INFO.email,
        address: CONTACT_INFO.address,
        hours: 'Lunes a Viernes: 9am - 6pm'
      };
    }
    return {
      phone: contactInfoConfig.customPhone || CONTACT_INFO.phone,
      email: contactInfoConfig.customEmail || CONTACT_INFO.email,
      address: contactInfoConfig.customAddress || CONTACT_INFO.address,
      hours: contactInfoConfig.customHours || 'Lunes a Viernes: 9am - 6pm'
    };
  };

  // Get visible social media items
  const getVisibleSocialMedia = () => {
    if (socialMediaConfig?.items && Array.isArray(socialMediaConfig.items)) {
      return socialMediaConfig.items.filter(item => item.visible !== false);
    }

    // If no custom configuration, use defaults from constants
    return SOCIAL_MEDIA_LINKS;
  };

  const contactDetails = getContactDetails();
  const visibleSocialMedia = getVisibleSocialMedia();

  /**
   * Renders the heading section (title and subtitle)
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
   * Renders the contact information card with social media links
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

      {/* Contact details */}
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
            <p className="info-text">{contactDetails.hours}</p>
          </div>
        </div>
      </div>

      {/* Social media links */}
      {contactInfoConfig.showSocialMedia !== false && visibleSocialMedia.length > 0 && (
        <div className="social-links mt-4">
          <h5 className="text-white-50 fw-light mb-3">Síguenos</h5>
          <div className="d-flex">
            {visibleSocialMedia.map((social, index) => (
              <a
                key={index}
                href={social.url}
                className="text-white social-icon me-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className={`bi ${social.icon}`}></i>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="contact-card-decoration">
        <div className="decoration-circle"></div>
        <div className="decoration-circle"></div>
      </div>
    </div>
  );

  /**
   * Renders the contact form card
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
        subjectOptions={formConfig.subjectOptions}
      />
    </div>
  );

  /**
   * Renders the Google Maps iframe
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

  // Show loading spinner while content is being fetched
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
   * Main render method for the page
   */
  return (
    <div className="contact-page-container">
      <div className="container">
        {/* Header section */}
        {renderHeadingSection()}

        {/* Main content area */}
        <div className="row contact-content-wrapper">
          {/* Contact info card */}
          {contactInfoConfig.showContactInfo !== false && (
            <div className="col-lg-5 mb-4 mb-lg-0">
              {renderContactInfoCard()}
            </div>
          )}

          {/* Contact form card */}
          {formConfig.showForm !== false && (
            <div className={`col-lg-${contactInfoConfig.showContactInfo !== false ? '7' : '12'}`}>
              {renderContactFormCard()}
            </div>
          )}
        </div>
      </div>

      {/* Map section */}
      {mapConfig.showMap !== false && renderMap()}
    </div>
  );
};