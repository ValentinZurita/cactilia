import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de spinner para mostrar estados de carga
 */
const Spinner = ({ 
  size = 'medium', 
  color = 'primary',
  centered = false,
  fullHeight = false,
  className = '' 
}) => {
  const sizeMap = {
    small: '1rem',
    medium: '2rem',
    large: '3rem'
  };

  const spinnerSize = sizeMap[size] || size;
  
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: centered ? 'center' : 'flex-start',
    height: fullHeight ? '100%' : 'auto'
  };

  return (
    <div 
      className={`spinner-container ${className}`} 
      style={containerStyle}
    >
      <div 
        className={`spinner spinner-${color}`}
        style={{
          width: spinnerSize,
          height: spinnerSize
        }}
      />
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  centered: PropTypes.bool,
  fullHeight: PropTypes.bool,
  className: PropTypes.string
};

// Exportar tanto como default como named export
export { Spinner };
export default Spinner; 