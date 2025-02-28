/**
 * ProfileCard Component
 *
 * A styled card component for profile sections with hover effects
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Card content
 * @param {string} props.title - Card title (optional)
 * @param {string} props.className - Additional classes (optional)
 */
export const ProfileCard = ({ children, title, className = '' }) => {
  return (
    <div className={`card profile-card shadow-sm mb-4 ${className}`}>
      {title && (
        <div className="card-header bg-light border-0">
          <h5 className="mb-0">{title}</h5>
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};