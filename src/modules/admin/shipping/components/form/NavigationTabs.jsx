import React from 'react';
import PropTypes from 'prop-types';
import { FORM_STEPS } from '../../constants';

/**
 * Pestañas de navegación para el formulario de reglas de envío
 * @param {number} currentStep - Paso actual del formulario
 * @param {function} onTabClick - Función para cambiar de pestaña
 */
const NavigationTabs = ({ currentStep, onTabClick }) => {
  // Definición de las secciones
  const sections = [
    { 
      key: FORM_STEPS.BASIC_INFO, 
      label: 'Cobertura', 
      icon: 'bi-geo-alt' 
    },
    { 
      key: FORM_STEPS.RULES, 
      label: 'Reglas', 
      icon: 'bi-gear' 
    },
    { 
      key: FORM_STEPS.METHODS, 
      label: 'Métodos', 
      icon: 'bi-truck' 
    }
  ];
  
  return (
    <div className="mb-4">
      <nav className="shipping-tabs d-flex flex-nowrap overflow-auto pb-2">
        {sections.map(section => (
          <button
            key={section.key}
            type="button"
            className={`btn me-2 px-3 py-2 rounded-3 ${
              currentStep === section.key 
                ? 'btn-dark' 
                : 'btn-outline-secondary'
            }`}
            onClick={() => onTabClick(section.key)}
          >
            <i className={`bi ${section.icon} me-2`}></i>
            {section.label}
          </button>
        ))}
      </nav>
      <div className="border-bottom mb-4"></div>
    </div>
  );
};

NavigationTabs.propTypes = {
  /** Paso actual del formulario */
  currentStep: PropTypes.number.isRequired,
  /** Función para cambiar de pestaña */
  onTabClick: PropTypes.func.isRequired
};

export default NavigationTabs; 