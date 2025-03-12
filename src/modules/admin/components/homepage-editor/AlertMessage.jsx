import React, { useEffect } from 'react';

/**
 * Componente para mostrar alertas temporales flotantes
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.show - Indica si la alerta debe mostrarse
 * @param {string} props.type - Tipo de alerta: 'success', 'warning', 'danger'
 * @param {string} props.message - Mensaje a mostrar
 * @param {Function} props.onClose - Función para cerrar la alerta
 * @param {number} [props.autoCloseTime=3000] - Tiempo en ms para el cierre automático (0 para desactivar)
 * @returns {JSX.Element|null}
 */
export const AlertMessage = ({
                               show,
                               type,
                               message,
                               onClose,
                               autoCloseTime = 3000
                             }) => {
  useEffect(() => {
    // Si debe cerrarse automáticamente
    if (show && autoCloseTime > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);

      return () => clearTimeout(timer);
    }
  }, [show, autoCloseTime, onClose]);

  if (!show) return null;

  return (
    <div
      className={`alert alert-${type} alert-dismissible fade show`}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 1050,
        maxWidth: '90%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
      role="alert"
    >
      <div className="d-flex align-items-center">
        <i className={`bi ${
          type === 'success' ? 'bi-check-circle' :
            type === 'warning' ? 'bi-exclamation-triangle' :
              'bi-exclamation-circle'
        } fs-5 me-2`}></i>
        <div>{message}</div>
      </div>
      <button
        type="button"
        className="btn-close"
        onClick={onClose}
        aria-label="Cerrar"
      ></button>
    </div>
  );
};