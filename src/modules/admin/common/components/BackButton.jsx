import React from 'react';

/**
 * Componente reutilizable para el botón/icono "Volver".
 * @param {{ onClick: () => void }} props
 */
export const BackButton = ({ onClick }) => {
  return (
    // Usar un span o div clickeable en lugar de un botón estilizado
    <span 
      onClick={onClick}
      style={{ cursor: 'pointer' }} // Asegurar cursor de puntero
      // Cambiar color en hover usando clases de Bootstrap
      className="text-secondary link-dark" 
      title="Volver" // Tooltip para accesibilidad
    >
      {/* Icono más grande y sin margen derecho */}
      <i className="bi bi-arrow-left fs-3"></i> 
      {/* Eliminar texto "Volver" */}
    </span>
  );
}; 