import PropTypes from 'prop-types';

/**
 * Componente Button reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {string} props.text - Texto del botón
 * @param {Function} props.onClick - Función al hacer clic
 * @param {string} props.variant - Variante de estilo
 * @param {string} props.size - Tamaño del botón (sm, md, lg)
 * @param {boolean} props.disabled - Si el botón está deshabilitado
 * @param {boolean} props.isLoading - Si muestra estado de carga
 * @param {string} props.icon - Clase del icono (Bootstrap)
 * @param {string} props.className - Clases adicionales
 * @param {React.ReactNode} props.children - Contenido del botón
 * @returns {JSX.Element}
 */
export const Button = ({
                         text,
                         onClick,
                         variant = 'primary',
                         size = 'md',
                         disabled = false,
                         isLoading = false,
                         icon = null,
                         className = '',
                         children,
                         ...rest
                       }) => {
  // Determinar clases de tamaño
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <button
      className={`btn btn-${variant} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Procesando...
        </>
      ) : (
        <>
          {icon && <i className={`bi ${icon} ${text || children ? 'me-2' : ''}`}></i>}
          {text || children}
        </>
      )}
    </button>
  );
};

Button.propTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func,
  variant: PropTypes.string,
  size: PropTypes.string,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  icon: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node
};