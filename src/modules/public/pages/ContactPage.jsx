import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useContactPageContent } from '../components/contact/hooks/useContactPageContent.js'
import { Logo } from '../../../shared/components/logo/Logo.jsx'
import '../styles/contact.css'
import { ContactForm } from '../components/contact/components/index.js'
import { Spinner } from '../../../shared/components/spinner/Spinner.jsx'
import { 
  fetchCompanyInfo,
  selectCompanyInfo, 
  selectSocialLinks, 
  selectSiteConfigStatus 
} from '../../../store/slices/siteConfigSlice.js';


/**
 * Componente Mejorado de la Página de Contacto que utiliza contenido personalizable
 * gestionado a través de la interfaz de administración Y datos globales del store Redux.
 *
 * @returns {JSX.Element}
 */

export const ContactPage = () => {
  const dispatch = useDispatch();

  // Cargar contenido personalizado para la página (títulos, visibilidad de secciones, config del formulario)
  const { pageContent, loading: pageLoading, getSection } = useContactPageContent()

  // Obtener datos globales del store de Redux
  const companyInfo = useSelector(selectCompanyInfo);
  const socialLinks = useSelector(selectSocialLinks);
  const siteConfigStatus = useSelector(selectSiteConfigStatus);

  // Fetch company info if needed when component mounts
  useEffect(() => {
    // Fetch only if status is idle (to avoid multiple fetches)
    // The thunk itself will handle cache validation
    if (siteConfigStatus === 'idle') {
      dispatch(fetchCompanyInfo());
      // Optionally dispatch fetchSocialLinks if needed here too, 
      // or ensure it's dispatched elsewhere (e.g., App.jsx)
    }
  }, [dispatch, siteConfigStatus]);

  // Obtener configuración para cada sección DESDE EL EDITOR DE CONTENIDO
  const headerConfig = getSection('header')
  const contactInfoConfig = getSection('contactInfo') // Aún necesario para showSocialMedia, showContactInfo
  const formConfig = getSection('form')
  const mapConfig = getSection('map')


  // Obtener ítems visibles de redes sociales (desde el store)
  const getVisibleSocialMedia = () => {
    // Filter the socialLinks from the store
    return socialLinks?.filter(link => link.visible !== false) || [];
  }

  const visibleSocialMedia = getVisibleSocialMedia() 

  // Función auxiliar para formatear la dirección desde el objeto companyInfo (del store)
  const formatAddress = () => {
    if (!companyInfo?.contact?.address) return 'Dirección no disponible';
    const { street, city, state, zipCode } = companyInfo.contact.address;
    // Formateo básico, ajustar según sea necesario
    return [street, city, state, zipCode].filter(Boolean).join(', ');
  }

  // Función auxiliar para formatear el horario de atención (desde companyInfo del store)
  const formatBusinessHours = () => {
    if (!companyInfo?.businessHours || companyInfo.businessHours.length === 0) {
      return 'Horario no disponible';
    }

    const activeHours = companyInfo.businessHours.filter(d => d.open);
    if (activeHours.length === 0) {
      return 'Cerrado'; // O 'Horario no disponible' según preferencia
    }

    // Ordenar los días según dayOrder
    const dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    // Ordenar los días según dayOrder
    activeHours.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

    // Formatear los grupos de horarios
    const groupedHours = [];
    let currentGroup = null;

    // Iterar sobre los días activos
    for (let i = 0; i < activeHours.length; i++) {
      const day = activeHours[i];
      const dayIndex = dayOrder.indexOf(day.day);
      const schedule = `${day.openingTime} - ${day.closingTime}`;

      if (currentGroup && 
          schedule === currentGroup.schedule && 
          dayIndex === dayOrder.indexOf(currentGroup.endDay) + 1) {

        // Si el horario es el mismo y el día es consecutivo, extender el grupo
        currentGroup.endDay = day.day;

      } else {
        // Si no, cerrar el grupo anterior (si existe) e iniciar uno nuevo
        if (currentGroup) {
          groupedHours.push(currentGroup);
        }
        currentGroup = {
          startDay: day.day,
          endDay: day.day,
          schedule: schedule
        };
      }
    }

    // Añadir el último grupo
    if (currentGroup) {
      groupedHours.push(currentGroup);
    }

    // Formatear los grupos en texto
    const formattedStrings = groupedHours.map(group => {
      if (group.startDay === group.endDay) {
        return `${group.startDay}: ${group.schedule}`;
      } else {
        return `${group.startDay} a ${group.endDay}: ${group.schedule}`;
      }
    });

    // Unir las cadenas formateadas, por ejemplo, con saltos de línea o comas
    // Usaremos <br /> para saltos de línea en HTML, pero necesitamos renderizarlo como HTML.
    // Por ahora, unimos con comas para texto plano.
    return formattedStrings.join(', \n'); // \n para nueva línea en texto plano
  };

  
  /**
   * Renderiza la sección de encabezado (título y subtítulo)
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
  )


  /**
   * Renderiza la tarjeta de información de contacto con enlaces de redes sociales
   */

  const renderContactInfoCard = () => {
    
    // Obtener detalles directamente desde companyInfo (del store)
    const phone = companyInfo?.contact?.phone || 'N/A';
    const email = companyInfo?.contact?.email || 'N/A';
    const whatsapp = companyInfo?.contact?.whatsapp;
    const address = formatAddress();
    const hours = formatBusinessHours();

    // Helper function to format WhatsApp URL
    const formatWhatsAppUrl = (number) => {
      if (!number) return '#';
      // Remove non-digit characters
      const digits = number.replace(/\D/g, '');
      // Basic check if it looks like a valid number
      if (digits.length < 10) return '#'; // Or handle differently
      return `https://wa.me/${digits}`;
    }

    return (
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
            <p className="info-text">{phone}</p>
          </div>
        </div>

        {/* WhatsApp Item (conditionally rendered) - MOVED HERE */}
        {whatsapp && (
          <div className="contact-info-item">
            <div className="icon-container">
              <i className="bi bi-whatsapp"></i>
            </div>
            <div className="info-content">
              <h6 className="info-title">WhatsApp</h6>
              {/* Make it a clickable link */}
              <a 
                href={formatWhatsAppUrl(whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="info-text text-white text-decoration-none"
              >
                {whatsapp}
              </a>
            </div>
          </div>
        )}

        <div className="contact-info-item">
          <div className="icon-container">
            <i className="bi bi-envelope-fill"></i>
          </div>
          <div className="info-content">
            <h6 className="info-title">Email</h6>
            <p className="info-text">{email}</p>
          </div>
        </div>
        <div className="contact-info-item">
          <div className="icon-container">
            <i className="bi bi-geo-alt-fill"></i>
          </div>
          <div className="info-content">
            <h6 className="info-title">Dirección</h6>
            <p className="info-text">{address}</p>
          </div>
        </div>
        <div className="contact-info-item">
          <div className="icon-container">
            <i className="bi bi-clock-fill"></i>
          </div>
          <div className="info-content">
            <h6 className="info-title">Horario</h6>
            {/* Renderiza el horario formateado. Nota: si usamos \n, necesita white-space: pre-line en CSS */}
            {/* O podemos dividir el string y renderizar párrafos/divs */}
            <p className="info-text" style={{ whiteSpace: 'pre-line' }}>{hours}</p>
          </div>
        </div>
      </div>

      {/* Social media links */}
      {contactInfoConfig.showSocialMedia !== false && visibleSocialMedia.length > 0 && (
        <div className="social-links mt-4">
          <h5 className="text-white-50 fw-light mb-3">Síguenos</h5>
          <div className="d-flex">
            {visibleSocialMedia.map((social) => (
              <a
                key={social.id || social.url}
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
    )
  }

  /**
   * Renderiza la tarjeta del formulario de contacto
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
  )

  /**
   * Renderiza el iframe de Google Maps
   */
  const renderMap = () => {
    if (!mapConfig.embedUrl) return null

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
    )
  }

  // Mostrar spinner de carga mientras se carga el contenido de la página O la configuración del sitio
  // Consider pageLoading (for contact page specific content) AND siteConfigStatus
  if (pageLoading || siteConfigStatus === 'loading' || siteConfigStatus === 'idle') {
    return (
      // Use a shared spinner component if available
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner /> 
      </div>
    )
  }

  /**
   * Método principal de renderizado para la página
   */
  return (
    <div className="contact-page-container">
      <div className="container">
        {/* Sección de encabezado */}
        {renderHeadingSection()}

        {/* Área de contenido principal */}
        <div className="row contact-content-wrapper">
          {/* Tarjeta de información de contacto - visibilidad controlada por editor de contenido */}
          {contactInfoConfig.showContactInfo !== false && (
            <div className="col-lg-5 mb-4 mb-lg-0">
              {renderContactInfoCard()}
            </div>
          )}

          {/* Tarjeta del formulario de contacto - visibilidad controlada por editor de contenido */}
          {formConfig.showForm !== false && (
            <div className={`col-lg-${contactInfoConfig.showContactInfo !== false ? '7' : '12'}`}>
              {renderContactFormCard()}
            </div>
          )}
        </div>
      </div>

      {/* Sección del mapa */}
      {mapConfig.showMap !== false && renderMap()}
    </div>
  )
}