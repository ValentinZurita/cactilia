import PropTypes from 'prop-types';

/**
 * Componente de spinner de carga reutilizable
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.size - Tamaño del spinner (sm, md, lg)
 * @param {string} props.text - Texto a mostrar (opcional)
 * @param {string} props.className - Clases adicionales
 * @returns {JSX.Element}
 */
export const LoadingSpinner = ({
                                 size = 'md',
                                 text = 'Cargando...',
                                 className = '',
                               }) => {
  const spinnerSize = size === 'sm' ? 'spinner-border-sm' :
    size === 'lg' ? 'spinner-lg' : '';

  return (
    <div className={`text-center ${className}`}>
      <div className={`spinner-border ${spinnerSize}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <p className="mt-2">{text}</p>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.string,
  text: PropTypes.string,
  className: PropTypes.string
};
