import React from 'react';
import '../styles/contact.css';
import { ContactForm, ContactInfo } from '../components/contact/index.js'

export const ContactPage = () => {
  return (
    <div className="contact-page container py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-4">Contáctanos</h1>
          <p className="text-center text-muted mb-5">
            Estamos aquí para ayudarte. Rellena el formulario y nos pondremos en contacto contigo lo antes posible.
          </p>
        </div>
      </div>

      <div className="row">
        {/* En móviles: ContactInfo arriba, ContactForm abajo */}
        {/* En desktop: ContactInfo a la izquierda, ContactForm a la derecha */}
        <div className="col-lg-5 mb-4 mb-lg-0">
          <ContactInfo />
        </div>

        <div className="col-lg-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
};