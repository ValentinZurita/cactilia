import React, { useEffect, useState } from 'react'
import { useContactPageContent } from '../components/contact/hooks/useContactPageContent.js'
import { Logo } from '../../../shared/components/logo/Logo.jsx'
import '../styles/contact.css'
import { ContactForm } from '../components/contact/components/index.js'
import { getSocialMediaLinks } from '../../../services/firebase/companyInfoService'
import { useCompanyInfo } from '../../admin/companyInfo/hooks/useCompanyInfo.js'

/**
 * Enhanced Contact Page component that uses the customizable content
 * managed through the admin interface AND company info settings
 *
 * @returns {JSX.Element}
 */

export const ContactPage = () => {
  // Load customized content for the page (titles, sections visibility, form config)
  const { pageContent, loading: pageLoading, getSection } = useContactPageContent()
  // Load company info (for phone, email, address, hours, social links)
  const { companyInfo, loading: companyInfoLoading } = useCompanyInfo()

  const [socialLinks, setSocialLinks] = useState([])
  const [socialLinksLoading, setSocialLinksLoading] = useState(true)

  // Get configuration for each section FROM CONTENT EDITOR
  const headerConfig = getSection('header')
  const contactInfoConfig = getSection('contactInfo') // Still needed for showSocialMedia, showContactInfo
  const formConfig = getSection('form')
  const mapConfig = getSection('map')
  // socialMediaConfig is no longer used here as links come from companyInfoService/useCompanyInfo

  // Fetch social media links from Firestore (this might be redundant if useCompanyInfo already provides them)
  // TODO: Check if useCompanyInfo hook can be updated to provide processed social links directly
  useEffect(() => {
    const fetchLinks = async () => {
      setSocialLinksLoading(true)
      try {
        // Using the direct service call for now
        const linksFromDb = await getSocialMediaLinks()
        const visibleLinks = linksFromDb.filter(link => link.visible !== false)
        setSocialLinks(visibleLinks)
      } catch (error) {
        console.error('Error fetching social media links for Contact Page:', error)
        setSocialLinks([]) // Set to empty array on error
      } finally {
        setSocialLinksLoading(false)
      }
    }
    fetchLinks()
  }, [])

  // Get visible social media items (using state populated by useEffect)
  const getVisibleSocialMedia = () => {
    return socialLinks
  }

  const visibleSocialMedia = getVisibleSocialMedia() // Still used

  // Helper function to format address from companyInfo object
  const formatAddress = () => {
    if (!companyInfo?.contact?.address) return 'Dirección no disponible';
    const { street, city, state, zipCode } = companyInfo.contact.address;
    // Basic formatting, adjust as needed
    return [street, city, state, zipCode].filter(Boolean).join(', ');
  }

  // Helper function to format business hours
  const formatBusinessHours = () => {
    if (!companyInfo?.businessHours || companyInfo.businessHours.length === 0) {
      return 'Horario no disponible';
    }
    // Example formatting: Find first open day range, or just list Monday-Friday if typical
    const weekdays = companyInfo.businessHours.filter(
      (d) => ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].includes(d.day) && d.open
    );
    if (weekdays.length === 5 && weekdays.every(d => d.openingTime === weekdays[0].openingTime && d.closingTime === weekdays[0].closingTime)) {
      return `Lunes a Viernes: ${weekdays[0].openingTime} - ${weekdays[0].closingTime}`;
    }
    // Fallback to a simpler representation or list all days
    // This part might need more complex logic based on desired display
    return 'Consulte nuestro horario detallado'; // Placeholder
  }

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
  )

  /**
   * Renders the contact information card with social media links
   */
  const renderContactInfoCard = () => {
    // Get details directly from companyInfo
    const phone = companyInfo?.contact?.phone || 'N/A';
    const email = companyInfo?.contact?.email || 'N/A';
    const address = formatAddress();
    const hours = formatBusinessHours();

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
            <p className="info-text">{hours}</p>
          </div>
        </div>
      </div>

      {/* Social media links */}
      {contactInfoConfig.showSocialMedia !== false && !socialLinksLoading && visibleSocialMedia.length > 0 && (
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
  )

  /**
   * Renders the Google Maps iframe
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

  // Show loading spinner while page content OR company info OR social links are loading
  if (pageLoading || companyInfoLoading || socialLinksLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
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
          {/* Contact info card - visibility controlled by content editor */}
          {contactInfoConfig.showContactInfo !== false && (
            <div className="col-lg-5 mb-4 mb-lg-0">
              {renderContactInfoCard()}
            </div>
          )}

          {/* Contact form card - visibility controlled by content editor */}
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
  )
}