import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar un estado vacío o mensaje de información
 * Útil para cuando no hay elementos para mostrar o se requiere acción del usuario
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.message - Mensaje principal a mostrar
 * @param {string} props.icon - Clase de icono Bootstrap (opcional)
 * @param {string} props.title - Título del mensaje (opcional)
 * @param {string} props.action - Texto del botón de acción (opcional)
 * @param {Function} props.onAction - Función para el botón de acción (opcional)
 * @returns {JSX.Element}
 */
export const EmptyState = ({ 
  message = "No hay información disponible", 
  icon = "bi-info-circle", 
  title = "",
  action = "", 
  onAction = null,
  className = ""
}) => {
  return (
    <div className={`text-center py-5 ${className}`}>
      <i className={`bi ${icon} fs-1 text-muted`}></i>
      
      {title && <h5 className="mt-3">{title}</h5>}
      
      <p className="text-muted mt-2">{message}</p>
      
      {action && onAction && (
        <button 
          type="button" 
          className="btn btn-primary mt-2" 
          onClick={onAction}
        >
          {action}
        </button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string,
  action: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string
};

export default EmptyState; 