import PropTypes from 'prop-types';

/**
 * Componente Badge reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {string} props.text - Texto a mostrar
 * @param {string} props.variant - Variante de estilo (success, warning, danger, etc.)
 * @param {string} props.className - Clases adicionales
 * @param {string} props.icon - Clase del icono (Bootstrap)
 * @returns {JSX.Element}
 */
export const Badge = ({
                        text,
                        variant = 'primary',
                        className = '',
                        icon = null
                      }) => {
  return (
    <span className={`badge bg-${variant} ${className}`}>
      {icon && <i className={`bi ${icon} me-1`}></i>}
      {text}
    </span>
  );
};

Badge.propTypes = {
  text: PropTypes.string.isRequired,
  variant: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.string
};