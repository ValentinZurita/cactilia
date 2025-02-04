import { Link } from 'react-router-dom';

export const NavbarIcon = ({ iconClass, label, href, hideLabelOnMobile = false }) => {

  return (
    <Link className="nav-link d-flex align-items-center px-2 text-dark navbar-hover" to={href}>

      {/* Icon */}
      <i className={`${iconClass} fs-5 me-1 text-muted fw-light`}/>

      {/* Label */}
      <span className={`fw-light d-none d-lg-inline ${hideLabelOnMobile ? "d-none d-lg-inline" : ""}` }>
        {label}
      </span>

    </Link>
  )}