import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar el tipo de cobertura geográfica de una regla
 * @param {string} type - Tipo de cobertura: 'Nacional', 'Regional', 'CP'
 */
const CoverageTypeBadge = ({ type }) => {
  // Configuración según tipo
  const config = {
    'Nacional': {
      icon: 'bi-globe-americas',
      color: 'primary',
      tooltip: 'Cobertura en todo el país'
    },
    'Regional': {
      icon: 'bi-map',
      color: 'info',
      tooltip: 'Cobertura a nivel estados'
    },
    'CP': {
      icon: 'bi-geo-alt',
      color: 'secondary',
      tooltip: 'Cobertura por códigos postales'
    }
  };

  // Usar configuración por defecto si el tipo no existe
  const { icon, color, tooltip } = config[type] || {
    icon: 'bi-question-circle',
    color: 'dark',
    tooltip: 'Tipo de cobertura desconocido'
  };
  
  return (
    <span 
      className={`badge bg-${color} bg-opacity-10 text-${color} d-inline-flex align-items-center gap-1`}
      title={tooltip}
    >
      <i className={`bi ${icon} small`}></i>
      {type}
    </span>
  );
};

CoverageTypeBadge.propTypes = {
  /** Tipo de cobertura */
  type: PropTypes.oneOf(['Nacional', 'Regional', 'CP', 'No definido']).isRequired
};

export default CoverageTypeBadge; 