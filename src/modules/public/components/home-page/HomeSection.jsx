import { ProductsHeader } from "./ProductsHeader.jsx";

/**
 * HomeSection Component
 *
 * A reusable layout component for different homepage sections.
 * It standardizes the structure, styling, and layout across multiple sections.
 *
 * Features:
 * - Dynamically renders a title, subtitle, and an optional icon.
 * - Supports customizable vertical spacing and height.
 * - Optional background styling (light gray).
 * - Uses Bootstrap for layout and responsiveness.
 *
 * Props:
 * @param {string} title - Section title text.
 * @param {string} subtitle - Section subtitle text.
 * @param {string|null} icon - Bootstrap icon class name (optional).
 * @param {boolean} showBg - If true, applies a light gray background (`bg-light`).
 * @param {string} spacing - Controls vertical spacing (default: "py-6").
 * @param {string} height - Defines the section height (default: "auto").
 * @param {ReactNode} children - Content that will be rendered inside the section.
 */
export const HomeSection = ({
                              title,
                              subtitle,
                              icon,
                              showBg = false,
                              spacing = "py-6",
                              height = "auto",
                              children,
                            }) => {
  return (
    // Section container with dynamic classes for spacing, height, and background
    <section className={`home-section ${spacing} ${height} ${showBg ? "bg-light" : "" } d-flex flex-column justify-content-center align-items-center`}>

      {/* Section Header - Displays the icon, title, and subtitle */}
      <ProductsHeader icon={icon} title={title} subtitle={subtitle}  />

      {/* Content Wrapper - Centers the provided children */}
      <div className="container d-flex flex-column justify-content-center">
        <div className="w-100">{children}</div>
      </div>

    </section>
  );
};