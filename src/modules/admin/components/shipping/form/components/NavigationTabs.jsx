import React from 'react';

/**
 * Tabs de navegación entre las diferentes secciones del formulario
 */
const NavigationTabs = ({ activeSection, setActiveSection }) => {
  // Definición de las secciones del formulario
  const sections = [
    { id: 'basic', label: 'Información Básica', icon: 'tag' },
    { id: 'services', label: 'Servicios', icon: 'truck' },
    { id: 'advanced', label: 'Avanzado', icon: 'gear' }
  ];

  return (
    <div className="mb-4">
      <ul className="nav nav-tabs">
        {sections.map((section) => (
          <li className="nav-item" key={section.id}>
            <button
              type="button"
              className={`nav-link ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <i className={`bi bi-${section.icon} me-2`}></i>
              {section.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavigationTabs; 