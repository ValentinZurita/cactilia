/**
 * ProductsHeader - Responsive component for section headers
 * Optimized for all device sizes from mobile to desktop.
 *
 * @param {string} icon - Bootstrap icon class name (e.g., "bi-box-seam").
 * @param {string} title - The title text.
 * @param {string} subtitle - The subtitle text.
 */
export const ProductsHeader = ({ icon, title, subtitle }) => {
  return (
    <div className="text-center mb-2 px-3 px-sm-0">
      {/* Optional section icon - responsive size */}
      {icon && (
        <i className={`bi ${icon}`} style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          color: 'var(--green-3, #34C749)',
          display: 'block',
          marginBottom: '8px'
        }}></i>
      )}

      {/* Section title - responsive font size */}
      <h2 style={{
        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
        fontWeight: 'bold',
        color: 'var(--green-3, #34C749)',
        textAlign: 'center'
      }}>
        {title}
      </h2>

      {/* Section subtitle - responsive */}
      <p style={{
        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
        color: 'var(--gray-500, #6c757d)',
        textAlign: 'center',
        marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)'
      }}>
        {subtitle}
      </p>
    </div>
  );
};