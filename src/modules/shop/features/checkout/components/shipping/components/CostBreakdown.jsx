import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente que muestra el desglose de costos de una opción de envío
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.option - Opción de envío
 */
const CostBreakdown = ({ option }) => {
  if (!option) return null;
  
  // Si no hay desglose de costos, no mostrar nada
  if (!option.costBreakdown || option.costBreakdown.length === 0) {
    // Si es gratis, mostrar razón
    if (option.price === 0 && option.freeShippingReason) {
      return (
        <div className="cost-breakdown mt-3">
          <div className="alert alert-success p-2 mb-0">
            <small>
              <i className="bi bi-info-circle me-1"></i>
              <strong>Envío gratuito:</strong> {option.freeShippingReason}
            </small>
          </div>
        </div>
      );
    }
    return null;
  }
  
  // Mostrar desglose de costos
  return (
    <div className="cost-breakdown mt-3">
      <small className="fw-medium mb-2 d-block">
        <i className="bi bi-receipt me-1"></i>
        Desglose de costos:
      </small>
      
      <ul className="cost-list mb-0 ps-1">
        {option.costBreakdown.map((item, idx) => {
          // Cada item debe tener un concepto y un valor
          if (!item.concept && !item.amount) return null;
          
          // Obtener concepto del item
          const concept = item.concept || 
            (item.weightRange ? `Peso ${item.weightRange.min}-${item.weightRange.max} kg` : 
              (item.isBase ? 'Tarifa base' : 'Costo adicional'));
          
          // Obtener monto del item
          const amount = parseFloat(item.amount || 0).toFixed(2);
          
          return (
            <li key={idx} className="d-flex justify-content-between align-items-center">
              <span className="cost-concept">{concept}</span>
              <span className="cost-amount">${amount}</span>
            </li>
          );
        })}
        
        {/* Mostrar total si se han sumado varios costos */}
        {option.costBreakdown.length > 1 && (
          <li className="cost-total d-flex justify-content-between align-items-center">
            <span className="fw-bold">Total:</span>
            <span className="fw-bold">${parseFloat(option.price || 0).toFixed(2)}</span>
          </li>
        )}
      </ul>
    </div>
  );
};

CostBreakdown.propTypes = {
  option: PropTypes.object.isRequired
};

export default CostBreakdown; 