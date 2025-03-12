import { Logo } from '../../../shared/components/logo/Logo.jsx';
import '../styles/contact.css';
import { ContactForm, ContactInfo } from '../components/contact/index.js';
import { SocialMediaLinks } from '../../../shared/components/footer/index.js'

/**
 * Página de Contacto:
 * Muestra un título, subtítulo, información de contacto y un formulario para enviar mensajes.
 *
 * @returns {JSX.Element} - Retorna la estructura de la página de contacto.
 */
export const ContactPage = () => {

  /**
   * Renderiza la sección de encabezado (título y subtítulo).
   */
  const renderHeadingSection = () => (
    <div className="row mb-4 mb-md-5">
      <div className="col-12 text-center">
        <h1 className="contact-title">Contáctanos</h1>
        <p className="contact-subtitle">
          Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
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

      {/* Información de contacto */}
      <ContactInfo />

      {/* Redes sociales reemplazadas por el componente SocialMediaLinks */}
      <div className="social-links mt-4">
        <h5 className="text-white-50 fw-light mb-3">Síguenos</h5>
        <SocialMediaLinks />
      </div>

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
      <h3 className="mb-4">Envíanos un mensaje</h3>
      <ContactForm />
    </div>
  );

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
          <div className="col-lg-5 mb-4 mb-lg-0">
            {renderContactInfoCard()}
          </div>

          {/* Tarjeta del formulario de contacto */}
          <div className="col-lg-7">
            {renderContactFormCard()}
          </div>
        </div>
      </div>
    </div>
  );
};
