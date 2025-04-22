import React, { useState } from 'react';

/**
 * Componente reutilizable para un botón estándar de "Crear Nuevo".
 * Puede renderizarse como un botón normal o como un Floating Action Button (FAB).
 * El FAB tiene un efecto de crecimiento al pasar el ratón.
 * @param {{ 
 *   onClick: () => void,
 *   text?: string,
 *   iconClass?: string,
 *   isFab?: boolean, // Indica si se debe renderizar como FAB
 *   fabPositionClasses?: string // Clases CSS para posicionar el FAB (e.g., 'position-fixed bottom-0 end-0 m-3')
 * }} props
 */
export const CreateButton = ({
  onClick,
  text = "Nuevo",
  iconClass = "bi bi-plus-lg",
  isFab = false, // Por defecto no es un FAB
  fabPositionClasses = "position-fixed bottom-0 end-0 m-3" // Posición por defecto para FAB
}) => {
  // Estado para el hover del FAB
  const [isHovered, setIsHovered] = useState(false);

  // Determinar clases y contenido basado en si es FAB
  const buttonClasses = [
    'btn',
    isFab ? 'btn-dark' : 'btn-dark', // Mantener btn-dark o elegir otro color para FAB?
    isFab ? 'rounded-circle' : '',
    isFab ? 'btn-lg' : '', // Hacer el FAB más grande
    isFab ? fabPositionClasses : '', // Aplicar clases de posición solo si es FAB
    isFab ? 'shadow' : '' // Añadir sombra al FAB
  ].filter(Boolean).join(' '); // Filtra vacíos y une

  const buttonContent = isFab ? (
    // Solo icono para FAB
    <i className={iconClass}></i>
  ) : (
    // Icono y texto para botón normal
    <>
      {iconClass && <i className={`${iconClass} me-2`}></i>}
      {text}
    </>
  );

  // Determinar el title para accesibilidad
  const buttonTitle = isFab ? text : undefined; // Usar el texto como title para el FAB

  // Estilos base para el FAB, incluyendo la transición
  const fabBaseStyle = isFab 
    ? { 
        width: '56px', 
        height: '56px', 
        zIndex: 1050, 
        transition: 'transform 0.15s ease-in-out' // Transición suave
      } 
    : {};

  // Estilo de transformación condicional basado en el hover
  const fabHoverStyle = isFab 
    ? { 
        transform: isHovered ? 'scale(1.15)' : 'scale(1)' // Escala en hover
      } 
    : {};

  // Combinar estilos
  const finalButtonStyle = { ...fabBaseStyle, ...fabHoverStyle };

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={onClick}
      title={buttonTitle} // Añadir title para FABs (solo icono)
      style={finalButtonStyle} // Aplicar estilos combinados
      onMouseEnter={() => isFab && setIsHovered(true)} // Activar hover solo si es FAB
      onMouseLeave={() => isFab && setIsHovered(false)} // Desactivar hover solo si es FAB
    >
      {buttonContent}
    </button>
  );
}; 