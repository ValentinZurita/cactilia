import React from 'react';
import PropTypes from 'prop-types';
import '../styles/checkout.css';

/**
 * Componente para una sección en la página de checkout
 * Proporciona una estructura consistente con título y contenido
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
      <h2 className="section-title">
        <span className="step-number">{stepNumber}</span>
        {title}
      </h2>
      <div className="section-content">
        {children}
      </div>
    </div>
  );
};

CheckoutSection.propTypes = {
  title: PropTypes.string.isRequired,
  stepNumber: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired
};