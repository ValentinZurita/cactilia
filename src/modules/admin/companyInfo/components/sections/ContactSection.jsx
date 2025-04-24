import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { InputField } from '../../../common/components/InputField.jsx';

/**
 * @component ContactSection
 * @description Componente para mostrar y editar la información de contacto de la empresa,
 * incluyendo email, teléfonos y dirección física.
 * Utiliza un estado local y una función `handleChange` unificada para manejar las actualizaciones.
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
  
  /**
   * @function handleChange
   * @description Manejador unificado para cambios en los campos del formulario.
   * Detecta si el campo pertenece a la dirección anidada y actualiza el estado 
   * `contactInfo` correspondientemente antes de llamar a `onUpdate`.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    const addressFields = ['street', 'city', 'state', 'zipCode'];

    let updatedInfo;
    if (addressFields.includes(name)) {
      // Update nested address
      updatedInfo = {
        ...contactInfo,
        address: {
          ...contactInfo.address,
          [name]: value
        }
      };
    } else {
      // Update top-level field
      updatedInfo = {
        ...contactInfo,
        [name]: value
      };
    }
    
    setContactInfo(updatedInfo);
    onUpdate(updatedInfo);
  };

  return (
    <div className="contact-section">
      {/* Bloque 1: Contacto Directo */}
      <div className="border rounded p-3 mb-4">
        <h6 className="fw-medium mb-3">
           <i className="bi bi-person-lines-fill me-2"></i>
           Contacto Directo
        </h6>
        <div className="row g-4">
          <InputField 
            id="email"
            name="email"
            label="Email de Contacto"
            value={contactInfo.email}
            onChange={handleChange}
            type="email"
            placeholder="contacto@tuempresa.com"
            helpText="Este email será visible para tus clientes y se usará para notificaciones."
            required
          />
          <InputField 
            id="phone"
            name="phone"
            label="Teléfono"
            value={contactInfo.phone}
            onChange={handleChange}
            type="tel"
            placeholder="+52 55 1234 5678"
            helpText="Número telefónico de contacto para clientes."
          />
          <InputField 
            id="whatsapp"
            name="whatsapp"
            label="WhatsApp"
            value={contactInfo.whatsapp}
            onChange={handleChange}
            type="tel"
            placeholder="+52 55 1234 5678"
            helpText="Número de WhatsApp para atención al cliente."
          />
        </div>
      </div>
      
      {/* Bloque 2: Dirección Física */}
      <div className="border rounded p-3">
        <h6 className="fw-medium mb-3">
          <i className="bi bi-geo-alt me-2"></i>
          Dirección Física
        </h6>
        <div className="row g-3">
          <InputField 
            id="street"
            name="street"
            label="Calle y Número"
            value={contactInfo.address.street}
            onChange={handleChange}
            placeholder="Av. Insurgentes Sur 1234, Int. 5B"
            colWidth='col-12'
          />
           <InputField 
            id="city"
            name="city"
            label="Ciudad"
            value={contactInfo.address.city}
            onChange={handleChange}
            placeholder="Ciudad de México"
            colWidth='col-md-4'
          />
          <InputField 
            id="state"
            name="state"
            label="Estado"
            value={contactInfo.address.state}
            onChange={handleChange}
            placeholder="CDMX"
            colWidth='col-md-4'
          />
          <InputField 
            id="zipCode"
            name="zipCode"
            label="Código Postal"
            value={contactInfo.address.zipCode}
            onChange={handleChange}
            placeholder="01000"
            colWidth='col-md-4'
          />
        </div>
      </div>
    </div>
  );
};

// Prop types for ContactSection remain the same
ContactSection.propTypes = {
  data: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default ContactSection; 