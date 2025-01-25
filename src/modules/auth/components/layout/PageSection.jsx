// PageSection: Reusable component to organize content in responsive Bootstrap columns.
// Props:
// - children: The content that will be rendered inside the section.
// - className: Additional CSS classes that can be passed for further customization.
export const PageSection = ({ children, className = "" }) => {

  // Combine default Bootstrap classes with additional classes passed via props.
  const combinedClassName = `col-12 col-md-6 d-flex flex-column align-items-center justify-content-center text-center overflow-auto ${className}`.trim();

  return (
    // Section container with dynamic classes for responsive adjustment and content alignment.
    <div className={combinedClassName}>
      {children}
    </div>
  );

};