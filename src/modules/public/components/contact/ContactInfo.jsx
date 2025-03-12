import React from 'react';
import { CONTACT_INFO } from '../../../../shared/constants/footerLinks.js';

export const ContactInfo = () => {
  return (
    <div className="contact-info-card p-4 rounded">
      <h3 className="text-white mb-4">Información de Contacto</h3>
      <p className="text-white-50 mb-4">
        Envíanos un mensaje y nos pondremos en contacto contigo
      </p>

      <div className="contact-info-item d-flex align-items-center mb-3">
        <div className="icon-container me-3">
          <i className="bi bi-telephone-fill"></i>
        </div>
        <span className="text-white">{CONTACT_INFO.phone}</span>
      </div>

      <div className="contact-info-item d-flex align-items-center mb-3">
        <div className="icon-container me-3">
          <i className="bi bi-envelope-fill"></i>
        </div>
        <span className="text-white">{CONTACT_INFO.email}</span>
      </div>

      <div className="contact-info-item d-flex align-items-center mb-4">
        <div className="icon-container me-3">
          <i className="bi bi-geo-alt-fill"></i>
        </div>
        <span className="text-white">{CONTACT_INFO.address}</span>
      </div>

      <div className="social-icons mt-5">
        <a href="#" className="social-icon me-3">
          <i className="bi bi-twitter"></i>
        </a>
        <a href="#" className="social-icon me-3">
          <i className="bi bi-instagram"></i>
        </a>
        <a href="#" className="social-icon">
          <i className="bi bi-discord"></i>
        </a>
      </div>
    </div>
  );
};