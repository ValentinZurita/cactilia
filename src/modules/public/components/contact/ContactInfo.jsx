import React from 'react';
import { CONTACT_INFO } from '../../../../shared/constants/footerLinks.js';

export const ContactInfo = () => {
  return (
    <div className="contact-details">
      <div className="contact-info-item">
        <div className="icon-container">
          <i className="bi bi-telephone-fill"></i>
        </div>
        <div className="info-content">
          <h6 className="info-title">Teléfono</h6>
          <p className="info-text">{CONTACT_INFO.phone}</p>
        </div>
      </div>

      <div className="contact-info-item">
        <div className="icon-container">
          <i className="bi bi-envelope-fill"></i>
        </div>
        <div className="info-content">
          <h6 className="info-title">Email</h6>
          <p className="info-text">{CONTACT_INFO.email}</p>
        </div>
      </div>

      <div className="contact-info-item">
        <div className="icon-container">
          <i className="bi bi-geo-alt-fill"></i>
        </div>
        <div className="info-content">
          <h6 className="info-title">Dirección</h6>
          <p className="info-text">{CONTACT_INFO.address}</p>
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
  );
};