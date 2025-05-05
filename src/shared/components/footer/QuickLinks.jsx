import { Link } from 'react-router-dom';
import { QUICK_LINKS } from '../../constants/footerLinks';

export const QuickLinks = () => {
  return (
    <div className="col d-flex flex-column align-items-md-start align-items-start">
      <h5 className="text-uppercase fw-bold text-start">Enlaces Rápidos</h5>
      <ul className="list-unstyled text-start">
        {QUICK_LINKS.map((link, index) => (
          <li key={index}>
            <Link to={link.url} className="text-white text-sm">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};