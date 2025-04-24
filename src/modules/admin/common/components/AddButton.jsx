import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * @component AddButton
 * @description Un botón circular personalizable, generalmente para acciones de "añadir", 
 *              con un icono centrado y efecto de escala al pasar el ratón.
 * @param {object} props - Propiedades del componente.
 * @param {function} props.onClick - Función a ejecutar al hacer clic. Requerida.
 * @param {string} [props.size='40px'] - Tamaño del botón (ancho y alto).
 * @param {string} [props.buttonClass='btn-dark'] - Clases de Bootstrap para el color del botón (e.g., 'btn-dark', 'btn-primary').
 * @param {string} [props.iconClass='bi-plus-lg'] - Clase del icono Bootstrap a mostrar.
 * @param {number} [props.hoverScale=1.15] - Factor de escala al pasar el ratón.
 * @param {string} [props.title='Añadir'] - Texto para el atributo 'title' (accesibilidad).
 * @param {string} [props.className=''] - Clases CSS adicionales para el div contenedor (e.g., para márgenes).
 */
export const AddButton = ({
  onClick,
  size = '40px',
  buttonClass = 'btn-dark',
  iconClass = 'bi-plus-lg',
  hoverScale = 1.15,
  title = 'Añadir',
  className = '', // Para el div contenedor
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyles = {
    width: size,
    height: size,
    transition: 'transform 0.15s ease-in-out',
    transform: isHovered ? `scale(${hoverScale})` : 'scale(1)',
  };

  // Construye las clases del botón combinando las necesarias y las proporcionadas
  const combinedButtonClasses = [
    'btn',
    buttonClass, // Clase de color/estilo principal
    'rounded-circle',
    'd-inline-flex',
    'align-items-center',
    'justify-content-center',
    'p-0' // Quitar padding interno para controlar tamaño exacto con width/height
  ].filter(Boolean).join(' ');

  return (
    // Div contenedor para aplicar clases externas como márgenes
    <div className={className}> 
      <button
        type="button"
        className={combinedButtonClasses}
        onClick={onClick}
        style={buttonStyles}
        title={title}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <i className={iconClass}></i>
      </button>
    </div>
  );
};

AddButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  size: PropTypes.string,
  buttonClass: PropTypes.string,
  iconClass: PropTypes.string,
  hoverScale: PropTypes.number,
  title: PropTypes.string,
  className: PropTypes.string,
};

// Exportación default opcional si prefieres importarlo sin llaves
// export default AddButton; 