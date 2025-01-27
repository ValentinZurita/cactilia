import { SOCIAL_MEDIA_LINKS } from '../../constants/footerLinks';

export const SocialMediaLinks = () => {
  return (
    <div className="col d-flex flex-column align-items-md-start align-items-start">
      <h5 className="text-uppercase fw-bold text-start">Síguenos</h5>
      <div className="d-flex align-items-start">
        {SOCIAL_MEDIA_LINKS.map((social, index) => (
          <a key={index} href={social.url} className="text-white mx-2">
            <i className={`bi ${social.icon} fs-3`}></i>
          </a>
        ))}
      </div>
    </div>
  );
};