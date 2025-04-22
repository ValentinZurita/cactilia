import React from 'react';

/**
 * Componente reutilizable para mostrar mensajes de estado vacío (sin datos, sin resultados).
 * @param {{ 
 *   iconClass?: string, 
 *   title: string, 
 *   message?: string, 
 *   children?: React.ReactNode 
 * }} props
 */
export const EmptyState = ({ 
  iconClass = "bi bi-info-circle", 
  title,
  message,
  children // Para añadir botones u otro contenido opcionalmente
}) => {
  return (
    <div className="card border-0 shadow-sm overflow-hidden">
      <div className="card-body p-5 text-center">
        {iconClass && (
          <i className={`${iconClass} fs-1 text-secondary opacity-50 d-block mb-3`}></i>
        )}
        <h5 className="text-secondary fw-normal">{title}</h5>
        {message && <p className="text-muted">{message}</p>}
        {children && <div className="mt-4">{children}</div>} 
      </div>
    </div>
  );
}; 