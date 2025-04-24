import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de navegación por pestañas para el formulario de datos de empresa
 * Estilo similar al módulo de Shipping y Orders
 */
const NavigationTabs = ({ activeSection, onSectionChange, tabs = [] }) => {
  // Definición de las secciones (Eliminar lista interna)
  // const sections = [
  //   { id: 'general', label: 'Información General', icon: 'building' },
  //   ...
  // ];

  // Usar la prop 'tabs' o un array vacío si no se proporciona
  const sectionsToRender = tabs && tabs.length > 0 ? tabs : [
    // Proporcionar un fallback básico si es necesario, o dejar vacío
    { id: 'general', label: 'General' } // Ejemplo de fallback mínimo
  ]; 

  // Añadir iconos por defecto si no vienen en la prop tabs (opcional pero útil)
  const getIcon = (tabId) => {
    const icons = {
      general: 'building',
      contact: 'envelope',
      hours: 'clock',
      social: 'share',
      payment: 'credit-card',
      seo: 'globe' 
    };
    return icons[tabId] || 'question-circle'; // Icono por defecto
  };

  return (
    <div className="mb-4">
      <ul className="nav nav-tabs border-0 mb-0">
        {/* Iterar sobre la prop 'tabs' (renombrada a sectionsToRender) */}
        {sectionsToRender.map((section) => (
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
              {/* Usar getIcon para mostrar icono */}
              <i className={`bi bi-${getIcon(section.id)} me-2`}></i>
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
  onSectionChange: PropTypes.func.isRequired,
  // Añadir propType para tabs
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })).isRequired // Marcar como requerido ya que lo pasamos desde CompanyInfoPage
};

export default NavigationTabs; 