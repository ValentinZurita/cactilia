import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Sección de información de contacto de la empresa
 */
const ContactSection = ({ data, onUpdate }) => {
  const [contactInfo, setContactInfo] = useState({
    email: data.email || '',
    phone: data.phone || '',
    whatsapp: data.whatsapp || '',
    address: data.address || {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedInfo = {
      ...contactInfo,
      [name]: value
    };
    
    setContactInfo(updatedInfo);
    onUpdate(updatedInfo);
  };
  
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    const updatedAddress = {
      ...contactInfo.address,
      [name]: value
    };
    
    const updatedInfo = {
      ...contactInfo,
      address: updatedAddress
    };
    
    setContactInfo(updatedInfo);
    onUpdate(updatedInfo);
  };
  
  return (
    <div className="contact-section">
      <div className="row mb-4">
        <div className="col-12 mb-4">
          <h5 className="fw-medium mb-3">
            <i className="bi bi-envelope me-2"></i>
            Información de Contacto
          </h5>
          <p className="text-muted">
            Datos de contacto que se mostrarán a tus clientes.
          </p>
        </div>
      </div>
      
      <div className="row g-4">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email de Contacto <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={contactInfo.email}
              onChange={handleChange}
              placeholder="contacto@tuempresa.com"
              required
            />
            <small className="form-text text-muted">
              Este email será visible para tus clientes y se usará para notificaciones.
            </small>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Teléfono
            </label>
            <input
              type="tel"
              className="form-control"
              id="phone"
              name="phone"
              value={contactInfo.phone}
              onChange={handleChange}
              placeholder="+52 55 1234 5678"
            />
            <small className="form-text text-muted">
              Número telefónico de contacto para clientes.
            </small>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="whatsapp" className="form-label">
              WhatsApp
            </label>
            <input
              type="tel"
              className="form-control"
              id="whatsapp"
              name="whatsapp"
              value={contactInfo.whatsapp}
              onChange={handleChange}
              placeholder="+52 55 1234 5678"
            />
            <small className="form-text text-muted">
              Número de WhatsApp para atención al cliente.
            </small>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h6 className="fw-medium mb-3">
          <i className="bi bi-geo-alt me-2"></i>
          Dirección Física
        </h6>
        
        <div className="row g-3">
          <div className="col-12">
            <div className="form-group">
              <label htmlFor="street" className="form-label">Calle y Número</label>
              <input
                type="text"
                className="form-control"
                id="street"
                name="street"
                value={contactInfo.address.street}
                onChange={handleAddressChange}
                placeholder="Av. Insurgentes Sur 1234"
              />
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="city" className="form-label">Ciudad</label>
              <input
                type="text"
                className="form-control"
                id="city"
                name="city"
                value={contactInfo.address.city}
                onChange={handleAddressChange}
                placeholder="Ciudad de México"
              />
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="state" className="form-label">Estado</label>
              <input
                type="text"
                className="form-control"
                id="state"
                name="state"
                value={contactInfo.address.state}
                onChange={handleAddressChange}
                placeholder="CDMX"
              />
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="zipCode" className="form-label">Código Postal</label>
              <input
                type="text"
                className="form-control"
                id="zipCode"
                name="zipCode"
                value={contactInfo.address.zipCode}
                onChange={handleAddressChange}
                placeholder="01000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ContactSection.propTypes = {
  data: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default ContactSection; 