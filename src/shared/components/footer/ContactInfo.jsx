import React from 'react';
import { useSelector } from 'react-redux';
import { selectCompanyInfo } from '../../../store/slices/siteConfigSlice.js';
// Removed unused import: import { CONTACT_INFO } from '../../constants/footerLinks';

export const ContactInfo = () => {
  // Get company info from Redux store
  const companyInfo = useSelector(selectCompanyInfo);

  // Extract contact details with fallbacks
  const phone = companyInfo?.contact?.phone || 'Teléfono no disponible';
  const email = companyInfo?.contact?.email || 'Email no disponible';
  // Format address similarly to ContactPage
  const formatAddress = () => {
    if (!companyInfo?.contact?.address) return 'Dirección no disponible';
    const { street, city, state, zipCode } = companyInfo.contact.address;
    return [street, city, state, zipCode].filter(Boolean).join(', ');
  }
  const address = formatAddress();

  return (
    <div className="col d-flex flex-column align-items-md-start align-items-start">
      <h5 className="text-uppercase fw-bold text-start">Contacto</h5>
      <div className="d-flex flex-column align-items-start">
        <div className="d-flex align-items-center mb-2">
          <i className="bi bi-telephone-fill me-2"></i>
          <span className="text-sm">{phone}</span>
        </div>
        <div className="d-flex align-items-center mb-2">
          <i className="bi bi-envelope-fill me-2"></i>
          <span className="text-sm">{email}</span>
        </div>
        <div className="d-flex align-items-center">
          <i className="bi bi-geo-alt-fill me-2"></i>
          <span className="text-sm">{address}</span>
        </div>
        {/* We could potentially add WhatsApp and Hours here too if desired */}
      </div>
    </div>
  );
};