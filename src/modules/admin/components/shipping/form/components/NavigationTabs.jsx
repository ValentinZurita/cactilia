import React from 'react';

/**
 * Componente de navegación por pestañas para el formulario de envío
 * Estilo similar al módulo de Orders
 */
const NavigationTabs = ({ activeSection, onSectionChange }) => {
  // Definición de las secciones
  const sections = [
    { id: 'info', label: 'Cobertura', icon: 'geo-alt-fill' },
    { id: 'price', label: 'Reglas', icon: 'tags' },
    { id: 'delivery', label: 'Métodos', icon: 'truck' },
  ];

  return (
    <div className="mb-4">
      <ul className="nav nav-tabs border-0 mb-0">
        {sections.map((section) => (
          <li className="nav-item" key={section.id}>
            <button
              type="button"
              className={`nav-link border-0 px-4 py-2 ${
                activeSection === section.id 
                  ? 'active bg-dark text-white' 
                  : 'text-secondary'
              }`}
              onClick={() => onSectionChange(section.id)}
            >
              <i className={`bi bi-${section.icon} me-2`}></i>
              {section.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="border-bottom mb-3"></div>
    </div>
  );
};

export default NavigationTabs; 