import React from 'react';
import PropTypes from 'prop-types';

/**
 * @component TabItem
 * @description Componente compartido para renderizar un único elemento de pestaña (<li> y <button>)
 *              dentro de la navegación por pestañas del admin.
 *              Calcula las clases CSS apropiadas según si está activa.
 * 
 * @param {object} props - Propiedades del componente.
 * @param {object} props.tab - Objeto que representa la pestaña ({ id, label }).
 * @param {boolean} props.isActive - Indica si esta pestaña es la activa actualmente.
 * @param {function} props.onClick - Función a llamar cuando se hace clic en el botón (pasando el tab.id).
 * @param {string} props.iconName - Nombre del icono de Bootstrap Icons a mostrar.
 */
export const TabItem = ({ tab, isActive, onClick, iconName }) => {
  const buttonClasses = `nav-link border-0 px-4 py-2 ${
    isActive 
      ? 'active bg-dark text-white' // Estilo activo
      : 'text-secondary'          // Estilo inactivo
  }`;

  return (
    <li className="nav-item" key={tab.id}> 
      <button
        type="button"
        className={buttonClasses}
        onClick={() => onClick(tab.id)}
      >
        <i className={`bi bi-${iconName} me-2`}></i>
        {tab.label} 
      </button>
    </li>
  );
};

TabItem.propTypes = {
  tab: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  iconName: PropTypes.string.isRequired,
}; 