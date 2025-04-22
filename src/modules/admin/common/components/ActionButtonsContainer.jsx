import React from 'react';

/**
 * Contenedor visual para agrupar componentes ActionButton.
 * Proporciona el estilo de btn-group con un borde sutil.
 * @param {{ 
 *   children: React.ReactNode, 
 *   size?: 'sm' | 'lg', 
 *   ariaLabel?: string,
 *   className?: string
 * }} props
 */
export const ActionButtonsContainer = ({
  children,
  size = 'sm', // Tamaño por defecto
  ariaLabel = "Acciones",
  className = ""
}) => {
  const groupSizeClass = size ? `btn-group-${size}` : '';

  return (
    // Wrapper con borde y redondeo
    <div className={`d-inline-block border rounded ${className}`} style={{ lineHeight: 0 }}> 
      {/* Grupo de botones de Bootstrap */}
      <div className={`btn-group ${groupSizeClass}`} role="group" aria-label={ariaLabel}>
        {children} {/* Renderiza los botones ActionButton pasados como hijos */}
      </div>
    </div>
  );
}; 