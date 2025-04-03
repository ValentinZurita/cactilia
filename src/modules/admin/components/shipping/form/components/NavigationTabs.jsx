import React from 'react';

/**
 * Componente para las pestañas de navegación del formulario
 */
export const NavigationTabs = ({ activeSection, setActiveSection }) => {
  return (
    <nav className="nav nav-tabs flex-nowrap mb-4 overflow-auto">
      <button
        className={`nav-link border-0 ${activeSection === 'basic' ? 'active bg-dark text-white fw-medium' : 'text-secondary'}`}
        onClick={() => setActiveSection('basic')}
        type="button"
      >
        <i className={`bi bi-info-circle me-2 ${activeSection === 'basic' ? 'text-white' : ''}`}></i>
        <span className="d-none d-sm-inline">Información Básica</span>
      </button>
      <button
        className={`nav-link border-0 ${activeSection === 'services' ? 'active bg-dark text-white fw-medium' : 'text-secondary'}`}
        onClick={() => setActiveSection('services')}
        type="button"
      >
        <i className={`bi bi-truck me-2 ${activeSection === 'services' ? 'text-white' : ''}`}></i>
        <span className="d-none d-sm-inline">Servicios</span>
      </button>
      <button
        className={`nav-link border-0 ${activeSection === 'advanced' ? 'active bg-dark text-white fw-medium' : 'text-secondary'}`}
        onClick={() => setActiveSection('advanced')}
        type="button"
      >
        <i className={`bi bi-gear me-2 ${activeSection === 'advanced' ? 'text-white' : ''}`}></i>
        <span className="d-none d-sm-inline">Configuración Avanzada</span>
      </button>
    </nav>
  );
}; 