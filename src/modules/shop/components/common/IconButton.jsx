import React from 'react';
import PropTypes from 'prop-types';

/**
 * Botón con icono reutilizable
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.icon - Clase del icono (Bootstrap Icons)
 * @param {string} props.text - Texto del botón (opcional)
 * @param {Function} props.onClick - Función al hacer clic
 * @param {string} props.variant - Variante de estilo (primary, success, etc.)
 * @param {string} props.size - Tamaño del botón (sm, md, lg)
 * @param {boolean} props.disabled - Si el botón está deshabilitado
 * @param {string} props.className - Clases adicionales
 * @returns {JSX.Element}
 */
export const IconButton = ({
                             icon,
                             text,
                             onClick,
                             variant = 'primary',
                             size = 'md',
                             disabled = false,
                             className = '',
                             ...rest
                           }) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <button
      className={`btn btn-${variant} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      <i className={`bi ${icon} ${text ? 'me-2' : ''}`}></i>
      {text}
    </button>
  );
};

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  text: PropTypes.string,
  onClick: PropTypes.func,
  variant: PropTypes.string,
  size: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string
};