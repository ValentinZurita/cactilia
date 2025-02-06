import { useState, useEffect, useRef } from "react";

/**
 * Dropdown component
 * @param {string} label - Text to display in the button
 * @param {string[]} options - Array of options to display in the dropdown
 * @param {string} selectedOption - Selected option
 * @param {Function} onSelect - Function to call when an option is selected
 * @param {string} className - Additional classes for the button
 * @returns {JSX.Element}
 * @constructor
 * @example
 * <Dropdown
 *  label="Ordenar Por"
 *  options={["Ninguno", "Destacados", "Menor a Mayor", "Mayor a Menor"]}
 *  selectedOption={priceOrder || "Ordenar Por"}
 *  onSelect={(option) => setPriceOrder(option)}
 *  className={`filter-button-right ${priceOrder ? 'active' : ''}`}
 *  />
 */

export const Dropdown = ({
                           label,
                           options = [],
                           selectedOption,
                           onSelect,
                           className = "",
                         }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="dropdown" ref={dropdownRef}>

      <button
        className={`btn dropdown-toggle ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        {selectedOption || label}
      </button>

      {isOpen && (
        <ul className="dropdown-menu show" role="menu">
          {options.length > 0 ? (
            options.map((option, index) => (
              <li key={index}>
                <button
                  className="dropdown-item"
                  onClick={() => handleSelect(option)}
                  tabIndex="0"
                  role="menuitem"
                >
                  {option}
                </button>
              </li>
            ))
          ) : (
            <li className="dropdown-item text-muted">Sin opciones disponibles</li>
          )}
        </ul>
      )}

    </div>
  );
};