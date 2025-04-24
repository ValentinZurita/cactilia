import React from 'react';
import PropTypes from 'prop-types';

/**
 * @component TabItem
 * @description Renderiza un único elemento de pestaña (<li> y <button>) para la navegación
 *              del panel de "Datos de la Empresa".
 *              Calcula las clases CSS apropiadas según si está activa.
 * 
 * @param {object} props - Propiedades del componente.
 * @param {object} props.tab - Objeto que representa la pestaña ({ id, label }).
 * @param {boolean} props.isActive - Indica si esta pestaña es la activa actualmente.
 * @param {function} props.onClick - Función a llamar cuando se hace clic en el botón (pasando el tab.id).
 * @param {string} props.iconName - Nombre del icono de Bootstrap Icons a mostrar.
 */
export const TabItem = ({ tab, isActive, onClick, iconName }) => {
  // Lógica de clases CSS encapsulada aquí
  const buttonClasses = `nav-link border-0 px-4 py-2 ${
    isActive 
      ? 'active bg-dark text-white' // Estilo activo
      : 'text-secondary'          // Estilo inactivo
  }`;

  return (
    // Elemento de lista para cada pestaña
    <li className="nav-item" key={tab.id}> 
      {/* Botón interactivo para cada pestaña */}
      <button
        type="button"
        className={buttonClasses}
        onClick={() => onClick(tab.id)} // Llama al callback con el ID
      >
        {/* Icono */}
        <i className={`bi bi-${iconName} me-2`}></i>
        {/* Etiqueta */}
        {tab.label} 
      </button>
    </li>
  );
};

// PropTypes para el componente auxiliar
TabItem.propTypes = {
  tab: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  iconName: PropTypes.string.isRequired,
};

// Exportación nombrada es suficiente
// export default TabItem; 