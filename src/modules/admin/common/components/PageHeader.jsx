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
    <div className="d-flex align-items-center mb-4">
      {showBackButton && onBackClick && (
        <div className="me-3">
          <BackButton onClick={onBackClick} />
        </div>
      )}
      
      <PageTitle title={title} />
    </div>
  );
}; 