import React from 'react';

/**
 * Componente auxiliar para agrupar información bajo un título con borde inferior.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título de la sección
 * @param {React.ReactNode} props.children - Contenido del bloque de información
 * @returns {JSX.Element}
 */
export const InfoBlock = ({ title, children }) => (
  <div className="mb-4">
    <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">{title}</h6>
    {children}
  </div>
); 