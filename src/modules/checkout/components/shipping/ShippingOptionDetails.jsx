import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar detalles adicionales de la opción de envío seleccionada
 * Muestra información sobre los paquetes, peso y tiempo de entrega
 */
export const ShippingOptionDetails = ({ selectedOption }) => {
  if (!selectedOption) return null;
  
  const { packageGroups, totalWeight, packages } = selectedOption;
  
  return (
    <div className="shipping-details mt-4">
      <h6 className="mb-3">Detalles del envío</h6>
      
      <div className="shipping-summary mb-3">
        <div className="card border-light bg-light">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <div className="text-center mb-3 mb-md-0">
                  <div className="fs-5 fw-bold">{packages || 1}</div>
                  <div className="small text-muted">Paquete{(packages || 1) > 1 ? 's' : ''}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center mb-3 mb-md-0">
                  <div className="fs-5 fw-bold">{(totalWeight || 0).toFixed(2)} kg</div>
                  <div className="small text-muted">Peso total</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center">
                  <div className="fs-5 fw-bold">{selectedOption.minDays}-{selectedOption.maxDays}</div>
                  <div className="small text-muted">Días de entrega</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {packageGroups && packageGroups.length > 0 && (
        <div className="package-details">
          <div className="accordion">
            {packageGroups.map((group, index) => (
              <div className="accordion-item" key={group.id || index}>
                <h2 className="accordion-header">
                  <button 
                    className="accordion-button collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target={`#package-${index}`}
                    aria-expanded="false" 
                    aria-controls={`package-${index}`}
                  >
                    <div className="d-flex justify-content-between w-100 pe-3">
                      <span>{group.name || `Paquete ${index + 1}`}</span>
                      <span className="text-muted small">
                        {group.totalQuantity} productos · {group.totalWeight.toFixed(2)} kg
                      </span>
                    </div>
                  </button>
                </h2>
                <div 
                  id={`package-${index}`} 
                  className="accordion-collapse collapse" 
                >
                  <div className="accordion-body">
                    <ul className="list-group list-group-flush">
                      {group.items.map((item, itemIndex) => {
                        const product = item.product || item;
                        return (
                          <li className="list-group-item px-0 d-flex justify-content-between" key={itemIndex}>
                            <div>
                              <span className="fw-medium">{product.name}</span>
                              <span className="text-muted ms-2">× {item.quantity}</span>
                            </div>
                            <span className="text-muted">
                              {((product.weight || 1) * item.quantity).toFixed(2)} kg
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedOption.isFreeShipping && (
        <div className="alert alert-success mt-3">
          <i className="bi bi-tag-fill me-2"></i>
          ¡Envío gratuito aplicado a este pedido!
        </div>
      )}
    </div>
  );
};

ShippingOptionDetails.propTypes = {
  selectedOption: PropTypes.shape({
    id: PropTypes.string,
    carrier: PropTypes.string,
    label: PropTypes.string,
    calculatedCost: PropTypes.number,
    totalCost: PropTypes.number,
    minDays: PropTypes.number,
    maxDays: PropTypes.number,
    packages: PropTypes.number,
    totalWeight: PropTypes.number,
    packageGroups: PropTypes.array,
    isFreeShipping: PropTypes.bool
  })
};

export default ShippingOptionDetails; 