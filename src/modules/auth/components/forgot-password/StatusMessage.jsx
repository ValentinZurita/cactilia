import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente reutilizable para mostrar mensajes de estado
 * Muestra alertas con diferentes estilos según el tipo (success, danger, etc.)
 * Versión para el área de clientes
 */
export const StatusMessage = ({ type, icon, message }) => {
  return (
    <div className={`alert alert-${type} d-flex align-items-center w-100 mb-3`}>
      <i className={`bi ${icon} me-2`} />
      <div>{message}</div>
    </div>
  );
};

StatusMessage.propTypes = {
  // Tipo de alerta (success, danger, warning, info)
  type: PropTypes.oneOf(['success', 'danger', 'warning', 'info']).isRequired,
  // Ícono de Bootstrap a mostrar
  icon: PropTypes.string.isRequired,
  // Mensaje a mostrar
  message: PropTypes.string.isRequired
}; 