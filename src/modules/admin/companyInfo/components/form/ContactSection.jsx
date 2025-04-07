import React from 'react';
import PropTypes from 'prop-types';
import { FormSection } from './FormSection';

/**
 * Sección para información de contacto
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.data - Datos de contacto
 * @param {Function} props.onFieldChange - Función para actualizar campos
 * @param {Function} props.onUpdate - Función para actualizar la sección completa
 * @returns {JSX.Element} Sección de contacto
 */
export const ContactSection = ({ data, onFieldChange, onUpdate }) => {
  // Manejar cambios en la dirección
  const handleAddressChange = (field, value) => {
    const updatedAddress = {
      ...data.address,
      [field]: value
    };
    
    onUpdate(updatedAddress);
  };
  
  return (
    <FormSection 
      title="Información de Contacto" 
      icon="bi-envelope"
      description="Datos de contacto que estarán disponibles para tus clientes"
    >
      <div className="row g-3">
        {/* Email */}
        <div className="col-md-6">
          <label htmlFor="contactEmail" className="form-label">Email de Contacto*</label>
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-envelope"></i></span>
            <input
              type="email"
              className="form-control"
              id="contactEmail"
              value={data.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              placeholder="correo@tuempresa.com"
              required
            />
          </div>
          <small className="text-muted">Correo principal para contacto y formularios</small>
        </div>
        
        {/* Teléfono */}
        <div className="col-md-6">
          <label htmlFor="contactPhone" className="form-label">Teléfono</label>
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-telephone"></i></span>
            <input
              type="tel"
              className="form-control"
              id="contactPhone"
              value={data.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              placeholder="55 1234 5678"
            />
          </div>
        </div>
        
        {/* WhatsApp */}
        <div className="col-md-6">
          <label htmlFor="contactWhatsapp" className="form-label">WhatsApp</label>
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-whatsapp"></i></span>
            <input
              type="tel"
              className="form-control"
              id="contactWhatsapp"
              value={data.whatsapp}
              onChange={(e) => onFieldChange('whatsapp', e.target.value)}
              placeholder="521234567890 (formato internacional)"
            />
          </div>
          <small className="text-muted">Incluir código de país (52 para México)</small>
        </div>
        
        {/* Dirección */}
        <div className="col-12">
          <h6 className="mb-3">Dirección Física</h6>
          
          {/* Calle y número */}
          <div className="mb-3">
            <label htmlFor="addressStreet" className="form-label">Calle y Número</label>
            <input
              type="text"
              className="form-control"
              id="addressStreet"
              value={data.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              placeholder="Av. Ejemplo #123"
            />
          </div>
          
          <div className="row g-3">
            {/* Ciudad */}
            <div className="col-md-6">
              <label htmlFor="addressCity" className="form-label">Ciudad</label>
              <input
                type="text"
                className="form-control"
                id="addressCity"
                value={data.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="Ciudad"
              />
            </div>
            
            {/* Estado */}
            <div className="col-md-4">
              <label htmlFor="addressState" className="form-label">Estado</label>
              <input
                type="text"
                className="form-control"
                id="addressState"
                value={data.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                placeholder="Estado"
              />
            </div>
            
            {/* Código Postal */}
            <div className="col-md-2">
              <label htmlFor="addressZipCode" className="form-label">C.P.</label>
              <input
                type="text"
                className="form-control"
                id="addressZipCode"
                value={data.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                placeholder="12345"
              />
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

ContactSection.propTypes = {
  data: PropTypes.shape({
    email: PropTypes.string,
    phone: PropTypes.string,
    whatsapp: PropTypes.string,
    address: PropTypes.shape({
      street: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      zipCode: PropTypes.string,
      country: PropTypes.string
    })
  }).isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired
}; 