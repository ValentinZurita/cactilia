// ContentWrapper: A reusable component that serves as a responsive row container
// using Bootstrap's grid system. It ensures full width and height coverage
// while removing unnecessary spacing.

// Props:
// - children: The content to be placed inside the row.
export const ContentWrapper = ({ children }) => {
  return (
    // Bootstrap row with full width, full height, and no gutter spacing
    <div className="row w-100 h-100 g-0">
      {children}
    </div>
  );
};