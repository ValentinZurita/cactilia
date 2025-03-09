import { ProductsHeader } from "./ProductsHeader.jsx";

/**
 * HomeSection Component
 *
 * A fully responsive, reusable layout component for different homepage sections.
 * Optimized for all device sizes from mobile to desktop.
 *
 * Features:
 * - Mobile-first design with full responsiveness
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
  // Clase de altura responsive: en móviles usa altura automática
  const heightClass = height === "auto" ? "auto" : "min-vh-50 " + height;

  return (
    // Section container with responsive classes for mobile-first design
    <section
      className={`home-section ${spacing} ${showBg ? "bg-light" : ""} d-flex flex-column justify-content-center align-items-center w-100`}
      style={{ minHeight: height === "auto" ? "auto" : undefined }}
    >
      {/* Section Header - Displays the icon, title, and subtitle */}
      <ProductsHeader icon={icon} title={title} subtitle={subtitle} />

      {/* Content Wrapper - Centers the provided children with responsive padding */}
      <div className="container px-3 px-sm-4 d-flex flex-column justify-content-center">
        <div className="w-100">{children}</div>
      </div>
    </section>
  );
};