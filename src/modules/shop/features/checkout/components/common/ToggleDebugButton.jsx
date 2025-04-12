import React from 'react';
import PropTypes from 'prop-types';
import { useDebugMode } from '../../hooks/useDebugMode';

/**
 * Botón flotante para activar/desactivar el modo de depuración
 */
const ToggleDebugButton = ({ componentName = 'checkout' }) => {
  const [isDebugMode, toggleDebugMode] = useDebugMode(componentName);

  return (
    <button
      className={`debug-toggle-button ${isDebugMode ? 'active' : ''}`}
      onClick={toggleDebugMode}
      aria-label={isDebugMode ? 'Disable debug mode' : 'Enable debug mode'}
      title={isDebugMode ? 'Disable debug mode' : 'Enable debug mode'}
    >
      <i className={`bi ${isDebugMode ? 'bi-bug-fill' : 'bi-bug'}`}></i>
    </button>
  );
};

ToggleDebugButton.propTypes = {
  componentName: PropTypes.string
};

export default ToggleDebugButton; 