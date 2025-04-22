import React from 'react';

/**
 * Componente para mostrar un badge de estado "Activo" o "Inactivo".
 * Estilo sutil usando fondo semi-transparente y texto normal (sin negrita).
 * @param {{ isActive: boolean }} props
 */
export const RuleStatusBadge = ({ isActive }) => {
  // Determinar las clases según el estado
  // Usar fondo con opacidad y texto normal (fw-normal para quitar negrita de badge)
  const baseClasses = "badge rounded-pill fw-normal"; // Añadir fw-normal
  const statusClasses = isActive 
    ? "bg-success bg-opacity-10 text-success" // Fondo verde tenue
    : "bg-secondary bg-opacity-10 text-secondary"; // Fondo gris tenue
  
  return (
    <span className={`${baseClasses} ${statusClasses}`}>
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}; 