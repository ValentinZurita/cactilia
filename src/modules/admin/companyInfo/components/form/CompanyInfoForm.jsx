import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ContactSection } from './ContactSection';
import { GeneralInfoSection } from './GeneralInfoSection';
import { BusinessHoursSection } from './BusinessHoursSection';
import { SocialMediaSection } from './SocialMediaSection';

/**
 * Formulario principal para gestionar datos de la empresa
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.initialData - Datos iniciales para el formulario
 * @param {Function} props.onSave - Función para guardar los datos
 * @param {boolean} props.isSaving - Si está guardando actualmente
 * @returns {JSX.Element} Formulario de datos de empresa
 */
export const CompanyInfoForm = ({ initialData, onSave, isSaving }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    // Información general
    companyName: '',
    legalName: '',
    taxId: '',
    logo: '',
    description: '',
    
    // Contacto
    email: '',
    phone: '',
    whatsapp: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'México'
    },
    
    // Horarios
    businessHours: [
      { day: 'Lunes', open: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'Martes', open: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'Miércoles', open: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'Jueves', open: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'Viernes', open: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'Sábado', open: true, openTime: '10:00', closeTime: '14:00' },
      { day: 'Domingo', open: false, openTime: '00:00', closeTime: '00:00' }
    ],
    
    // Redes sociales
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: '',
      pinterest: ''
    },
  });
  
  // Cargar datos iniciales si existen
  useEffect(() => {
    if (initialData) {
      setFormData(prevData => ({
        ...prevData,
        ...initialData
      }));
    }
  }, [initialData]);

  /**
   * Actualizar una sección específica del formulario
   * @param {string} section - Nombre de la sección
   * @param {Object} data - Nuevos datos para la sección
   */
  const handleSectionUpdate = (section, data) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: data
    }));
  };
  
  /**
   * Actualizar un campo específico del formulario
   * @param {string} field - Nombre del campo
   * @param {any} value - Nuevo valor
   */
  const handleFieldChange = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };
  
  /**
   * Manejar envío del formulario
   * @param {Event} e - Evento de formulario
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="company-info-form">
      {/* Información general */}
      <GeneralInfoSection 
        data={{
          companyName: formData.companyName,
          legalName: formData.legalName,
          taxId: formData.taxId,
          logo: formData.logo,
          description: formData.description
        }}
        onFieldChange={handleFieldChange}
      />
      
      {/* Información de contacto */}
      <ContactSection 
        data={{
          email: formData.email,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          address: formData.address
        }}
        onUpdate={(data) => handleSectionUpdate('address', data)}
        onFieldChange={handleFieldChange}
      />
      
      {/* Horarios */}
      <BusinessHoursSection 
        data={formData.businessHours}
        onUpdate={(data) => handleSectionUpdate('businessHours', data)}
      />
      
      {/* Redes sociales */}
      <SocialMediaSection 
        data={formData.socialMedia}
        onUpdate={(data) => handleSectionUpdate('socialMedia', data)}
      />
      
      {/* Botones de acción */}
      <div className="d-flex justify-content-end mt-4 border-top pt-4">
        <button
          type="button"
          className="btn btn-outline-secondary me-2"
          onClick={() => setFormData({ ...initialData })}
          disabled={isSaving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-dark"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Guardando...
            </>
          ) : (
            <>
              <i className="bi bi-save me-2"></i>
              Guardar Información
            </>
          )}
        </button>
      </div>
    </form>
  );
};

CompanyInfoForm.propTypes = {
  initialData: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool
};

CompanyInfoForm.defaultProps = {
  initialData: null,
  isSaving: false
}; 