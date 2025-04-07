import React from 'react';
import PropTypes from 'prop-types';
import { FormSection } from './FormSection';

/**
 * Sección para información general de la empresa
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.data - Datos de información general
 * @param {Function} props.onFieldChange - Función para actualizar campos
 * @returns {JSX.Element} Sección de información general
 */
export const GeneralInfoSection = ({ data, onFieldChange }) => {
  return (
    <FormSection 
      title="Información General" 
      icon="bi-building"
      description="Información básica sobre tu empresa"
    >
      <div className="row g-3">
        {/* Nombre comercial */}
        <div className="col-md-6">
          <label htmlFor="companyName" className="form-label">Nombre Comercial*</label>
          <input
            type="text"
            className="form-control"
            id="companyName"
            value={data.companyName}
            onChange={(e) => onFieldChange('companyName', e.target.value)}
            placeholder="Nombre comercial de la empresa"
            required
          />
          <small className="text-muted">Nombre que aparecerá en el sitio web</small>
        </div>
        
        {/* Razón social */}
        <div className="col-md-6">
          <label htmlFor="legalName" className="form-label">Razón Social</label>
          <input
            type="text"
            className="form-control"
            id="legalName"
            value={data.legalName}
            onChange={(e) => onFieldChange('legalName', e.target.value)}
            placeholder="Razón social para facturación"
          />
          <small className="text-muted">Nombre legal para facturación</small>
        </div>
        
        {/* RFC */}
        <div className="col-md-6">
          <label htmlFor="taxId" className="form-label">RFC</label>
          <input
            type="text"
            className="form-control"
            id="taxId"
            value={data.taxId}
            onChange={(e) => onFieldChange('taxId', e.target.value)}
            placeholder="Registro Federal de Contribuyentes"
          />
        </div>
        
        {/* Logo */}
        <div className="col-md-6">
          <label htmlFor="logo" className="form-label">URL del Logo</label>
          <input
            type="text"
            className="form-control"
            id="logo"
            value={data.logo}
            onChange={(e) => onFieldChange('logo', e.target.value)}
            placeholder="URL de la imagen del logo"
          />
          <small className="text-muted">Debe ser una URL pública accesible</small>
        </div>
        
        {/* Descripción */}
        <div className="col-12">
          <label htmlFor="description" className="form-label">Descripción de la Empresa</label>
          <textarea
            className="form-control"
            id="description"
            rows="3"
            value={data.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
            placeholder="Breve descripción de tu empresa"
          ></textarea>
          <small className="text-muted">Esta descripción aparecerá en secciones "Acerca de" en el sitio</small>
        </div>
      </div>
    </FormSection>
  );
};

GeneralInfoSection.propTypes = {
  data: PropTypes.shape({
    companyName: PropTypes.string,
    legalName: PropTypes.string,
    taxId: PropTypes.string,
    logo: PropTypes.string,
    description: PropTypes.string
  }).isRequired,
  onFieldChange: PropTypes.func.isRequired
}; 