import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para títulos de sección en el checkout
 * Muestra un número de paso, título, subtítulo e icono opcional
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.number - Número de paso (opcional)
 * @param {string} props.title - Título principal
 * @param {string} props.subtitle - Subtítulo (opcional)
 * @param {string} props.icon - Clase de icono Bootstrap (opcional)
 * @returns {JSX.Element}
 */
export const SectionTitle = ({ number, title, subtitle, icon }) => {
  return (
    <div className="section-title-container mb-3">
      <div className="d-flex align-items-center">
        {number && (
          <div className="step-number me-3 d-flex align-items-center justify-content-center">
            {number}
          </div>
        )}
        
        {icon && (
          <i className={`bi ${icon} me-2 fs-4 text-success`} aria-hidden="true"></i>
        )}
        
        <div>
          <h3 className="section-title mb-0">{title}</h3>
          {subtitle && (
            <p className="section-subtitle text-muted mb-0 mt-1 small">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

SectionTitle.propTypes = {
  number: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.string
};

export default SectionTitle; 