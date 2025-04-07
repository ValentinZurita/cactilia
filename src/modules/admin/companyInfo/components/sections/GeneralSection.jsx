import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Sección de información general de la empresa
 */
const GeneralSection = ({ data, onUpdate }) => {
  const [generalInfo, setGeneralInfo] = useState({
    name: data.name || '',
    legalName: data.legalName || '',
    rfc: data.rfc || '',
    logoUrl: data.logoUrl || '',
    description: data.description || ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedInfo = {
      ...generalInfo,
      [name]: value
    };
    
    setGeneralInfo(updatedInfo);
    onUpdate(updatedInfo);
  };
  
  return (
    <div className="general-section">
      <div className="row mb-4">
        <div className="col-12 mb-4">
          <h5 className="fw-medium mb-3">
            <i className="bi bi-building me-2"></i>
            Información General
          </h5>
          <p className="text-muted">
            Información básica sobre tu empresa que verán tus clientes.
          </p>
        </div>
      </div>
      
      <div className="row g-4">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nombre de la Empresa <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={generalInfo.name}
              onChange={handleChange}
              placeholder="Ej. Cactilia"
              required
            />
            <small className="form-text text-muted">
              Este nombre será visible en toda la tienda.
            </small>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="legalName" className="form-label">
              Razón Social
            </label>
            <input
              type="text"
              className="form-control"
              id="legalName"
              name="legalName"
              value={generalInfo.legalName}
              onChange={handleChange}
              placeholder="Ej. Cactilia México S.A. de C.V."
            />
            <small className="form-text text-muted">
              Nombre legal de la empresa para facturas.
            </small>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="rfc" className="form-label">
              RFC
            </label>
            <input
              type="text"
              className="form-control"
              id="rfc"
              name="rfc"
              value={generalInfo.rfc}
              onChange={handleChange}
              placeholder="Ej. CACT010101AAA"
            />
            <small className="form-text text-muted">
              Registro Federal de Contribuyentes.
            </small>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="logoUrl" className="form-label">
              URL del Logo
            </label>
            <input
              type="url"
              className="form-control"
              id="logoUrl"
              name="logoUrl"
              value={generalInfo.logoUrl}
              onChange={handleChange}
              placeholder="https://ejemplo.com/logo.png"
            />
            <small className="form-text text-muted">
              URL de la imagen de tu logo.
            </small>
          </div>
        </div>
        
        <div className="col-12">
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Descripción de la Empresa
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              value={generalInfo.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe brevemente tu empresa..."
            ></textarea>
            <small className="form-text text-muted">
              Esta descripción puede aparecer en el pie de página y en la sección "Acerca de".
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

GeneralSection.propTypes = {
  data: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default GeneralSection; 