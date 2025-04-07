import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente reutilizable para secciones de formulario
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título de la sección
 * @param {string} props.icon - Clase de icono Bootstrap (bi-*)
 * @param {string} props.description - Descripción de la sección
 * @param {React.ReactNode} props.children - Contenido del formulario
 * @returns {JSX.Element} Sección de formulario
 */
export const FormSection = ({ title, icon, description, children }) => {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-light py-3">
        <div className="d-flex align-items-center">
          {icon && <i className={`bi ${icon} me-2`}></i>}
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        {description && (
          <p className="card-text small text-muted mt-1 mb-0">{description}</p>
        )}
      </div>
      <div className="card-body p-4">
        {children}
      </div>
    </div>
  );
};

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node.isRequired
};

FormSection.defaultProps = {
  icon: '',
  description: ''
}; 