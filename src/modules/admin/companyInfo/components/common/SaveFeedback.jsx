import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar feedback de operaciones de guardado
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.success - Si la operación fue exitosa
 * @param {string|null} props.error - Mensaje de error si hubo un problema
 * @param {Function} props.onDismiss - Función para cerrar el feedback
 * @returns {JSX.Element} Componente de feedback
 */
export const SaveFeedback = ({ success, error, onDismiss }) => {
  if (!success && !error) return null;
  
  const alertClass = success ? 'alert-success' : 'alert-danger';
  const icon = success ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
  const message = success 
    ? 'La información se guardó correctamente' 
    : (error || 'Ocurrió un error al guardar la información');
  
  return (
    <div className={`alert ${alertClass} alert-dismissible fade show mb-4`} role="alert">
      <div className="d-flex align-items-center">
        <i className={`bi ${icon} me-2`}></i>
        <span>{message}</span>
      </div>
      <button 
        type="button" 
        className="btn-close" 
        aria-label="Cerrar" 
        onClick={onDismiss}
      ></button>
    </div>
  );
};

SaveFeedback.propTypes = {
  success: PropTypes.bool,
  error: PropTypes.string,
  onDismiss: PropTypes.func.isRequired
};

SaveFeedback.defaultProps = {
  success: false,
  error: null
}; 