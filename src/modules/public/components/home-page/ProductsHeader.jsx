/**
 * ProductsHeader - Displays the section title, subtitle, and optional icon.
 * @param {string} icon - Bootstrap icon class name (e.g., "bi-box-seam").
 * @param {string} title - The title text.
 * @param {string} subtitle - The subtitle text.
 */
export const ProductsHeader = ({ icon, title, subtitle }) => {
  return (
    <div className="text-center mb-2">

      {/* Optional section icon */}
      {icon && <i className={`bi ${icon} section-icon`}></i>}

      {/* Section title */}
      <h2 className="home-title">{title}</h2>

      {/* Section subtitle */}
      <p className="home-subtitle">{subtitle}</p>

    </div>
  );
};