import PropTypes from 'prop-types';
import { Card } from '../../../shared/components/Card.jsx'

/**
 * Componente para mostrar una tarjeta de detalles en la página de orden
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título de la sección
 * @param {React.ReactNode} props.children - Contenido de la tarjeta
 * @param {string} props.className - Clases adicionales
 * @returns {JSX.Element}
 */
export const OrderDetailsCard = ({ title, children, className = '' }) => {
  return (
    <div className={`order-details-section ${className}`}>
      <h3>{title}</h3>
      <Card className="bg-light" bodyClassName="p-4">
        {children}
      </Card>
    </div>
  );
};

OrderDetailsCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};
