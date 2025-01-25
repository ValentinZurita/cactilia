export const NavbarIcon = ({ iconClass, label, href = "#" }) => {
  return (
    <a
      className="nav-link text-dark fw-light d-flex align-items-center justify-content-center m-3"
      href={href}
    >
      {/* Icon */}
      <i className={`bi ${iconClass} fs-5 text-secondary`}></i>
      {label && <span className="ms-2">{label}</span>}
    </a>
  );
};