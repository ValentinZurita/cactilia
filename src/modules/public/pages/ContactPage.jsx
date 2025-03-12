import React from 'react';

import { Logo } from '../../../shared/components/logo/Logo.jsx';
import '../styles/contact.css';
import { ContactForm, ContactInfo } from '../components/contact/index.js'

export const ContactPage = () => {
  return (
    <div className="contact-page-container">
      <div className="container">
        <div className="row mb-4 mb-md-5">
          <div className="col-12 text-center">
            <h1 className="contact-title">Contáctanos</h1>
            <p className="contact-subtitle">
              Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
            </p>
          </div>
        </div>

        <div className="row contact-content-wrapper">
          {/* Tarjeta de información de contacto */}
          <div className="col-lg-5 mb-4 mb-lg-0">
            <div className="contact-info-card">
              <div className="contact-info-header">
                <Logo styles={{ maxWidth: '100px'}} color="white" captionColor="text-white" />
                <h3 className="text-white mt-4 mb-3">¡Hablemos!</h3>
                <p className="text-white-50 mb-4">
                  Ponte en contacto con nosotros a través de cualquiera de estos canales.
                </p>
              </div>

              {/* Información de contacto */}
              <ContactInfo />

              {/* Redes sociales */}
              <div className="social-links mt-4">
                <h5 className="text-white-50 fw-light mb-3">Síguenos</h5>
                <div className="d-flex gap-3">
                  <a href="#" className="social-icon">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="#" className="social-icon">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="#" className="social-icon">
                    <i className="bi bi-twitter"></i>
                  </a>
                  <a href="#" className="social-icon">
                    <i className="bi bi-discord"></i>
                  </a>
                </div>
              </div>

              {/* Decoración */}
              <div className="contact-card-decoration">
                <div className="decoration-circle"></div>
                <div className="decoration-circle"></div>
              </div>
            </div>
          </div>

          {/* Tarjeta del formulario de contacto */}
          <div className="col-lg-7">
            <div className="contact-form-card">
              <h3 className="mb-4">Envíanos un mensaje</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};