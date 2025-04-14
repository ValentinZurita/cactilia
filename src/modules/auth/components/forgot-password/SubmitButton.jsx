import React from 'react';
import PropTypes from 'prop-types';
import { SubmitButton as SharedSubmitButton } from '../../../../shared/components';

/**
 * Componente atómico para el botón de envío
 * Reutiliza el componente SubmitButton compartido
 * Versión adaptada para el área de clientes
 */
export const SubmitButton = ({ loading, loadingText, text }) => {
  return (
    <SharedSubmitButton 
      text={loading ? loadingText : text}
      disabled={loading}
      isLoading={loading}
    />
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
  loadingText: 'Enviando...'
}; 