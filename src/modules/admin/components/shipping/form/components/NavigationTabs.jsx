import React from 'react';

/**
 * Componente de navegación por pestañas para el formulario de envío
 * Estilo similar al módulo de Orders
 */
const NavigationTabs = ({ activeSection, onSectionChange }) => {
  // Definición de las secciones
  const sections = [
    { id: 'info', label: 'Información', icon: 'info-circle' },
    { id: 'price', label: 'Precio', icon: 'currency-dollar' },
    { id: 'delivery', label: 'Entrega', icon: 'truck' },
  ];

  return (
    <ul className="nav nav-tabs border-bottom-0 mb-3">
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
  );
};

export default NavigationTabs; 