import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de navegación por pestañas para el formulario de datos de empresa
 * Estilo similar al módulo de Shipping y Orders
 */
const NavigationTabs = ({ activeSection, onSectionChange }) => {
  // Definición de las secciones
  const sections = [
    { id: 'general', label: 'Información General', icon: 'building' },
    { id: 'contact', label: 'Contacto', icon: 'envelope' },
    { id: 'hours', label: 'Horarios', icon: 'clock' },
    { id: 'social', label: 'Redes Sociales', icon: 'share' },
    { id: 'payment', label: 'Pagos', icon: 'credit-card' },
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

NavigationTabs.propTypes = {
  activeSection: PropTypes.string.isRequired,
  onSectionChange: PropTypes.func.isRequired
};

export default NavigationTabs; 