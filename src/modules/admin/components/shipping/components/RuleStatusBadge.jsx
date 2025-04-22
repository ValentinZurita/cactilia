import React from 'react';

/**
 * Componente para mostrar un badge de estado "Activo" o "Inactivo".
 * @param {{ isActive: boolean }} props
 */
export const RuleStatusBadge = ({ isActive }) => {
  return isActive ? (
    <span className="badge bg-success bg-opacity-10 text-success">Activo</span>
  ) : (
    <span className="badge bg-secondary bg-opacity-10 text-secondary">Inactivo</span>
  );
}; 