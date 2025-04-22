import React from 'react';
import { PageTitle } from './PageTitle';
import { BackButton } from './BackButton';

/**
 * Componente reutilizable para el encabezado estándar de las páginas de gestión.
 * Muestra el título y, opcionalmente, un botón "Volver".
 * @param {{ 
 *   title: string, 
 *   showBackButton?: boolean, 
 *   onBackClick?: () => void 
 * }} props
 */
export const PageHeader = ({ title, showBackButton = false, onBackClick }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <PageTitle title={title} />
      
      {showBackButton && onBackClick && (
        <BackButton onClick={onBackClick} />
      )}
    </div>
  );
}; 