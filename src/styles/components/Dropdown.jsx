

import { useState, useEffect, useRef } from "react";

export const Dropdown = ({ label, options = [], selectedOption, onSelect, className = "" }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Cierra el dropdown si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onSelect(option);
    setShowDropdown(false);
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className={`btn dropdown-toggle ${className}`} // 🔥 Se agrega la prop className
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        {selectedOption || label}
      </button>

      {showDropdown && (
        <ul className="dropdown-menu show">
          {options.length > 0 ? (
            options.map((option, index) => (
              <li key={index}>
                <button
                  className="dropdown-item"
                  onClick={() => handleSelect(option)}
                  tabIndex="0"
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