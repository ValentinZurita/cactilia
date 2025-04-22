import React from 'react';

/**
 * Componente reutilizable para mostrar un indicador de carga centrado.
 * @param {{ message?: string }} props - Mensaje opcional a mostrar debajo del spinner.
 */
export const LoadingIndicator = ({ message = 'Cargando...' }) => {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-secondary" role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      {message && <p className="mt-3 text-muted">{message}</p>}
    </div>
  );
}; 