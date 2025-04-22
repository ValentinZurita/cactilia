import React, { useState } from 'react';

/**
 * Componente para un botón de acción individual dentro de un ActionButtonsContainer.
 * Configurable con icono, tooltip, acción, confirmación opcional y estilo.
 * Permite cambiar el color del icono al pasar el ratón por encima.
 * @param {{ 
 *   iconClass: string, 
 *   title: string, 
 *   onClick: () => void, 
 *   confirmMessage?: string, 
 *   variant?: string, // e.g., 'light', 'outline-secondary', 'danger' etc.
 *   textColor?: string, // e.g., 'secondary', 'danger'
 *   hoverTextColor?: string, // Color opcional para el icono en hover
 *   disabled?: boolean,
 *   className?: string,
 *   isFirst?: boolean, // Para manejar redondeo izquierdo dentro del container
 *   isLast?: boolean   // Para manejar redondeo derecho dentro del container
 * }} props
 */
export const ActionButton = ({
  iconClass,
  title,
  onClick,
  confirmMessage,
  variant = 'light', // Estilo por defecto: fondo gris claro
  textColor = 'secondary', // Color de icono por defecto: gris secundario
  hoverTextColor, // Nueva prop
  disabled = false,
  className = '',
  isFirst = false, // No es el primero por defecto
  isLast = false   // No es el último por defecto
}) => {
  // Estado para controlar el hover sobre este botón específico
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (disabled) return;

    if (confirmMessage) {
      if (window.confirm(confirmMessage)) {
        onClick();
      }
    } else {
      onClick();
    }
  };

  // Construir clases del botón
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    className
  ].filter(Boolean).join(' ');

  // Determinar el color del icono basado en el estado hover y las props
  const currentIconColor = isHovered && hoverTextColor ? hoverTextColor : textColor;

  // Construir clases del icono
  const iconClasses = [
    iconClass, 
    currentIconColor ? `text-${currentIconColor}` : '' // Aplicar color dinámico
  ].filter(Boolean).join(' ');

  // Estilos para heredar el redondeo del contenedor padre con borde
  const buttonStyle = {
    borderTopLeftRadius: isFirst ? 'inherit' : undefined,
    borderBottomLeftRadius: isFirst ? 'inherit' : undefined,
    borderTopRightRadius: isLast ? 'inherit' : undefined,
    borderBottomRightRadius: isLast ? 'inherit' : undefined,
  };

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={handleClick}
      title={title}
      disabled={disabled}
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)} // Actualizar estado en hover
      onMouseLeave={() => setIsHovered(false)} // Actualizar estado al salir
    >
      <i className={iconClasses}></i>
    </button>
  );
}; 