import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de tarjeta reutilizable
 *
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido de la tarjeta
 * @param {string} props.title - Título de la tarjeta (opcional)
 * @param {string} props.className - Clases adicionales
 * @param {string} props.bodyClassName - Clases adicionales para el cuerpo
 * @param {boolean} props.hoverable - Si la tarjeta debe tener efecto hover
 * @returns {JSX.Element}
 */
export const Card = ({
                       children,
                       title,
                       className = '',
                       bodyClassName = '',
                       hoverable = false,
                       ...rest
                     }) => {
  return (
    <div
      className={`card ${hoverable ? 'shadow-sm hover-effect' : ''} ${className}`}
      {...rest}
    >
      {title && (
        <div className="card-header">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  hoverable: PropTypes.bool
};