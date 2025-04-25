import React from 'react';
import PropTypes from 'prop-types';
import { TabItem } from './TabItem.jsx'; 



/**
 * @component NavigationTabs
 * @description Componente compartido para renderizar un conjunto de pestañas de navegación estilo Bootstrap.
 *              Delega la renderización de cada pestaña al componente `TabItem`.
 * 
 * @param {object} props - Propiedades del componente.
 * @param {string} props.activeSection - El ID de la pestaña actualmente activa.
 * @param {function} props.onSectionChange - Callback que se ejecuta al hacer clic en una pestaña.
 * @param {Array<object>} props.tabs - Array de objetos (`id`, `label`) para las pestañas.
 */

const NavigationTabs = ({ activeSection, onSectionChange, tabs }) => {


  /**
   * @function getIcon
   * @description Devuelve el nombre del icono de Bootstrap correspondiente al ID de una pestaña.
   *              ATENCIÓN: Actualmente contiene iconos específicos. Si se reutiliza este componente
   *              en otros contextos, considerar pasar los iconos como props o mover esta lógica.
   */

  const getIcon = (tabId) => {
    // Icon mapping - Currently specific to CompanyInfo sections
    const icons = {
      general: 'building',
      contact: 'envelope',
      hours: 'clock',
      social: 'share',
      payment: 'credit-card',
      seo: 'globe'
      // Add other potential icons here if known
    };
    return icons[tabId] || 'question-circle'; // Default icon
  };


  return (
    
    <div className="mb-4"> 

      {/* Navegación de Pestañas */}
      <ul className="nav nav-tabs border-0 mb-0">
        {tabs.map((tab) => (
          <TabItem
            key={tab.id} 
            tab={tab}
            isActive={activeSection === tab.id}
            onClick={onSectionChange} 
            iconName={getIcon(tab.id)} 
          />
        ))}
      </ul>

      {/* Línea divisoria */}
      <div className="border-bottom mb-3"></div> 

    </div>
  );
};


NavigationTabs.propTypes = {
  activeSection: PropTypes.string.isRequired,
  onSectionChange: PropTypes.func.isRequired,
  tabs: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
  })).isRequired 
};

export default NavigationTabs; 