// PageLayout: Reusable component to provide a structured container for page layouts.
// It ensures a full-height viewport and eliminates unnecessary padding/margins.

// Props:
// - children: The content to be rendered inside the layout.
export const PageLayout = ({ children }) => {
  return (

    // Main container with Bootstrap's full-height and no padding/margin for a clean layout.
    <div className="container-fluid vh-100 d-flex p-0 " style={{ marginTop: '55px' }}>
      {children}
    </div>
  );
};