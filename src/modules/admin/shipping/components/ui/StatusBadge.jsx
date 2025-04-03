import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente que muestra un indicador visual del estado de una regla
 * @param {boolean} isActive - Si la regla está activa o no
 * @param {boolean} pill - Si el badge debe tener bordes redondeados
 * @param {string} size - Tamaño del badge (sm, md, lg)
 */
const StatusBadge = ({ isActive, pill = true, size = 'md' }) => {
  // Determinar clases basadas en propiedades
  const baseClasses = 'badge d-inline-flex align-items-center gap-1';
  const colorClasses = isActive 
    ? 'bg-success bg-opacity-10 text-success' 
    : 'bg-secondary bg-opacity-10 text-secondary';
  
  const pillClass = pill ? 'rounded-pill' : '';
  
  const sizeClass = size === 'sm' 
    ? 'py-1 px-2 small' 
    : size === 'lg' 
      ? 'py-2 px-3' 
      : 'py-1 px-2';
  
  return (
    <span className={`${baseClasses} ${colorClasses} ${pillClass} ${sizeClass}`}>
      <i className={`bi ${isActive ? 'bi-check-circle-fill' : 'bi-dash-circle'} small`}></i>
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
};

StatusBadge.propTypes = {
  /** Si la regla está activa o no */
  isActive: PropTypes.bool.isRequired,
  /** Si el badge debe tener bordes redondeados */
  pill: PropTypes.bool,
  /** Tamaño del badge: 'sm', 'md', 'lg' */
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default StatusBadge; 