export const AdminCard = ({
                            icon,
                            title,
                            className = '',
                            children
                          }) => (
  <div className={`card border-0 shadow-sm rounded-4 ${className}`}>
    {title && (
      <div className="card-header bg-white border-0 py-3">
        <h5 className="mb-0 fw-normal d-flex align-items-center">
          {icon && <i className={`bi bi-${icon} me-2 text-secondary`}></i>}
          {title}
        </h5>
      </div>
    )}
    <div className="card-body">
      {children}
    </div>
  </div>
);
