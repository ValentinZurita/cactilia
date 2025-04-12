import React from 'react';
import PropTypes from 'prop-types';
import './styles/shipping.css';

/**
 * Individual shipping option component
 * @param {Object} props - Component props
 * @param {Object} props.option - Shipping option data
 * @param {boolean} props.selected - Whether this option is selected
 * @param {Function} props.onSelect - Function to call when option is selected
 */
const ShippingOption = ({ option, selected, onSelect }) => {
  if (!option) return null;
  
  const isFree = option.isFree || option.price === 0;
  const formattedPrice = isFree ? 'Gratis' : `$${(option.price || 0).toFixed(2)}`;
  
  // Calculate total weight and count products
  const totalWeight = option.totalWeight || 
    (option.products?.reduce((sum, p) => sum + parseFloat(p.weight || 0) * (p.quantity || 1), 0) || 0);
  
  const productCount = option.products?.length || 0;
  const packageCount = option.packageCount || 1;
  const isMultiPackage = packageCount > 1;
  
  // Determine delivery time display
  const minDays = option.minDays || 3;
  const maxDays = option.maxDays || 7;
  const deliveryTimeText = minDays === maxDays 
    ? `${minDays} días` 
    : `${minDays}-${maxDays} días`;
  
  return (
    <div 
      className={`shipping-option-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect && onSelect(option)}
    >
      <div className="shipping-option-header">
        <div className="shipping-option-name">
          <i className={isFree ? 'bi bi-gift' : 'bi bi-truck'}></i>
          <span className="shipping-name">{option.name || 'Servicio de envío'}</span>
          {isFree && <span className="shipping-tag free">GRATIS</span>}
          {isMultiPackage && <span className="shipping-tag packages">{packageCount} paquetes</span>}
        </div>
        <div className="shipping-option-price">
          {formattedPrice}
        </div>
      </div>
      
      <div className="shipping-option-details">
        <div className="shipping-detail-item">
          <i className="bi bi-clock"></i>
          <span>Entrega en {deliveryTimeText}</span>
        </div>
        
        <div className="shipping-detail-item">
          <i className="bi bi-box"></i>
          <span>Peso total: {totalWeight.toFixed(2)} kg</span>
        </div>
        
        {productCount > 0 && (
          <div className="shipping-detail-item">
            <i className="bi bi-cart"></i>
            <span>{productCount} productos</span>
          </div>
        )}
      </div>
      
      {option.packages && option.packages.length > 0 && (
        <div className="shipping-packages">
          <h6 className="packages-title">Detalle de paquetes:</h6>
          <div className="packages-list">
            {option.packages.map((pkg, idx) => (
              <div key={idx} className="package-item">
                <div className="package-header">
                  <span className="package-name">Paquete {idx + 1}</span>
                  <span className="package-price">
                    {pkg.isFree ? 'Gratis' : `$${(pkg.price || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="package-details">
                  <span>{pkg.productCount || pkg.products?.length || 0} productos</span>
                  <span>{(pkg.packageWeight || 0).toFixed(2)} kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {option.costBreakdown && (
        <div className="shipping-weight-summary">
          <h6 className="weight-title">Resumen por peso:</h6>
          <div className="weight-groups">
            {option.costBreakdown.map((breakdown, idx) => {
              if (!breakdown.weightSummary) return null;
              const { light, medium, heavy } = breakdown.weightSummary;
              return (
                <div key={idx} className="weight-group">
                  {light.count > 0 && (
                    <div className="weight-item light">
                      <span>{light.count} productos ligeros</span>
                      <span>{light.totalWeight.toFixed(2)} kg</span>
                    </div>
                  )}
                  {medium.count > 0 && (
                    <div className="weight-item medium">
                      <span>{medium.count} productos medianos</span>
                      <span>{medium.totalWeight.toFixed(2)} kg</span>
                    </div>
                  )}
                  {heavy.count > 0 && (
                    <div className="weight-item heavy">
                      <span>{heavy.count} productos pesados</span>
                      <span>{heavy.totalWeight.toFixed(2)} kg</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {option.description && (
        <div className="shipping-description">
          {option.description}
        </div>
      )}
    </div>
  );
};

ShippingOption.propTypes = {
  option: PropTypes.object.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default ShippingOption; 