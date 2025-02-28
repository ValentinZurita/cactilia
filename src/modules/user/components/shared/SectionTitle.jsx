/**
 * SectionTitle Component
 *
 * A simple component for profile section headings with consistent styling
 *
 * @param {string} title - The title text to display
 */
export const SectionTitle = ({ title }) => {
  return (
    <h3 className="section-title">{title}</h3>
  );
};