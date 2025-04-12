import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar un efecto de carga shimmer
 * Utiliza CSS para crear una animación de "shimmer" sobre un elemento
 */
const Shimmer = ({ 
  width = '100%',
  height = '1rem',
  borderRadius = '4px',
  className = ''
}) => {
  return (
    <div 
      className={`shimmer-effect ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--shimmer-base-color, #e0e0e0)',
        position: 'relative',
        overflow: 'hidden'
      }}
    />
  );
};

Shimmer.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  borderRadius: PropTypes.string,
  className: PropTypes.string
};

export default Shimmer; 