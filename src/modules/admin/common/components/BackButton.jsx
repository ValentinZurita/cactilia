import React from 'react';

/**
 * Componente reutilizable para el botón "Volver".
 * @param {{ onClick: () => void }} props
 */
export const BackButton = ({ onClick }) => {
  return (
    <button
      className="btn btn-outline-secondary rounded-3"
      onClick={onClick}
    >
      <i className="bi bi-arrow-left me-2"></i>
      Volver
    </button>
  );
}; 