import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de cabecera para páginas administrativas
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título principal de la página
 * @param {string} props.description - Descripción o subtítulo
 * @returns {JSX.Element} Componente de cabecera
 */
export const PageHeader = ({ title, description }) => {
  return (
    <header className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 className="h3 mb-2">{title}</h1>
        {description && (
          <p className="text-muted mb-0">{description}</p>
        )}
      </div>
    </header>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string
};

PageHeader.defaultProps = {
  description: ''
}; 