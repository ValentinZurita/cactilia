import PropTypes from 'prop-types';
import '../styles/checkout.css';
import { Section } from '../../../components/common/Section.jsx'

/**
 * Componente para una sección en la página de checkout
 * Envuelve el componente Section básico con estilos específicos de checkout
 *
 * @param {Object} props
 * @param {string} props.title - Título de la sección
 * @param {number} props.stepNumber - Número de paso (1-4)
 * @param {ReactNode} props.children - Contenido de la sección
 * @returns {JSX.Element}
 */
export const CheckoutSection = ({ title, stepNumber, children }) => {
  return (
    <div className="checkout-section">
      <Section title={title} stepNumber={stepNumber}>
        {children}
      </Section>
    </div>
  );
};

CheckoutSection.propTypes = {
  title: PropTypes.string.isRequired,
  stepNumber: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired
};
