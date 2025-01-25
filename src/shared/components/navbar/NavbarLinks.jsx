// components/NavbarLinks.jsx
import { NAV_LINKS } from '../../constants/navbarLinks.js'

export const NavbarLinks = ({ showMenu }) => (
  <div className={`collapse navbar-collapse order-lg-1 ${showMenu ? 'show' : ''}`}>
    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex flex-column flex-lg-row align-items-lg-center text-lg-end text-center">
      {NAV_LINKS.map((link, index) => (
        <li key={index} className="nav-item">
          <a className="nav-link fw-light text-dark" href={link.href}>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);