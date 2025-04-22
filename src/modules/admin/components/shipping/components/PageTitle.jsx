import React from 'react';

/**
 * Componente simple para renderizar el título principal de una página.
 * @param {{ title: string }} props
 */
export const PageTitle = ({ title }) => {
  return (
    <h3 className="page-title fw-medium mb-0">
      {title}
    </h3>
  );
}; 