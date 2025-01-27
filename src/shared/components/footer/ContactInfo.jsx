import { CONTACT_INFO } from '../../constants/footerLinks';

export const ContactInfo = () => {
  return (
    <div className="col d-flex flex-column align-items-md-start align-items-start">
      <h5 className="text-uppercase fw-bold text-start">Contacto</h5>
      <div className="d-flex flex-column align-items-start">
        <div className="d-flex align-items-center mb-2">
          <i className="bi bi-telephone-fill me-2"></i>
          <span className="text-sm">{CONTACT_INFO.phone}</span>
        </div>
        <div className="d-flex align-items-center mb-2">
          <i className="bi bi-envelope-fill me-2"></i>
          <span className="text-sm">{CONTACT_INFO.email}</span>
        </div>
        <div className="d-flex align-items-center">
          <i className="bi bi-geo-alt-fill me-2"></i>
          <span className="text-sm">{CONTACT_INFO.address}</span>
        </div>
      </div>
    </div>
  );
};