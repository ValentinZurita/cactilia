import PropTypes from 'prop-types';

/**
 * Componente para secciones con título y contenido
 *
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido de la sección
 * @param {string} props.title - Título de la sección
 * @param {number} props.stepNumber - Número de paso (opcional)
 * @param {string} props.className - Clases adicionales
 * @returns {JSX.Element}
 */
export const Section = ({
                          children,
                          title,
                          stepNumber,
                          className = '',
                        }) => {
  return (
    <div className={`section-container ${className}`}>
      <h2 className="section-title">
        {stepNumber && <span className="step-number">{stepNumber}</span>}
        {title}
      </h2>
      <div className="section-content">
        {children}
      </div>
    </div>
  );
};

Section.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  stepNumber: PropTypes.number,
  className: PropTypes.string
};