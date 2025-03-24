export const ActionButton = ({
                               onClick,
                               icon,
                               label,
                               variant = 'secondary',
                               isProcessing = false,
                               className = ''
                             }) => (
  <button
    className={`btn btn-${variant === 'primary' ? '' : 'outline-'}${variant} ${className}`}
    onClick={onClick}
    disabled={isProcessing}
  >
    {isProcessing ? (
      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
    ) : icon && (
      <i className={`bi bi-${icon} me-2`}></i>
    )}
    {label}
  </button>
);
