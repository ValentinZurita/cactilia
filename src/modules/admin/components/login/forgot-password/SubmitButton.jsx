import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para botón de envío de formulario
 * Incluye estado de carga con spinner y texto personalizado
 */
export const SubmitButton = ({ loading, loadingText, text }) => {
  return (
    <button 
      type="submit" 
      className="btn btn-primary w-100"
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {loadingText}
        </>
      ) : text}
    </button>
  );
};

SubmitButton.propTypes = {
  // Indica si el botón está en estado de carga
  loading: PropTypes.bool,
  // Texto a mostrar durante la carga
  loadingText: PropTypes.string,
  // Texto normal del botón
  text: PropTypes.string.isRequired
};

SubmitButton.defaultProps = {
  loading: false,
  loadingText: 'Cargando...'
}; 