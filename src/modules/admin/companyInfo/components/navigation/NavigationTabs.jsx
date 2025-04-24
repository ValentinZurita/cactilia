import React from 'react';
import PropTypes from 'prop-types';
import { TabItem } from './TabItem.jsx'; 

/**
 * @component NavigationTabs
 * @description Renderiza un conjunto de pestañas de navegación estilo Bootstrap.
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
   *              (Podría moverse a utils si se usa en más lugares)
   */
  const getIcon = (tabId) => {
    const icons = {
      general: 'building',
      contact: 'envelope',
      // hours: 'clock', // Mantenido comentado por si se reactiva
      social: 'share',
      payment: 'credit-card',
      seo: 'globe'
    };
    return icons[tabId] || 'question-circle'; 
  };

  return (
    // Contenedor principal del componente de pestañas
    <div className="mb-4"> 
      {/* Lista no ordenada que representa las pestañas (nav-tabs de Bootstrap) */}
      <ul className="nav nav-tabs border-0 mb-0">
        {/* Mapea los datos de las pestañas y renderiza un componente TabItem para cada una */}
        {/* Key se aplica ahora directamente al componente TabItem */}
        {tabs.map((tab) => (
          <TabItem
            key={tab.id} 
            tab={tab}
            isActive={activeSection === tab.id} // Calcula si está activa aquí
            onClick={onSectionChange} // Pasa la función directamente
            iconName={getIcon(tab.id)} // Obtiene el nombre del icono
          />
        ))}
      </ul>
      {/* Línea divisoria restaurada debajo de las pestañas */}
      <div className="border-bottom mb-3"></div> 
    </div>
  );
};

// PropTypes para NavigationTabs
NavigationTabs.propTypes = {
  activeSection: PropTypes.string.isRequired,
  onSectionChange: PropTypes.func.isRequired,
  tabs: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
      // Se podría añadir icon aquí si quisiéramos permitir pasarlo opcionalmente
  })).isRequired 
};

export default NavigationTabs; 