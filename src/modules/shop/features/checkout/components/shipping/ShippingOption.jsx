import React from 'react';
import './ShippingOption.css';

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
  
  return (
    <div 
      className={`shipping-option ${selected ? 'selected' : ''}`}
      onClick={() => onSelect && onSelect(option)}
    >
      <div className="option-header">
        <div className="carrier-info">
          <span className="carrier-name">{option.carrierName || option.name || 'Servicio de envío'}</span>
          <span className="option-name">{option.optionName || option.description || ''}</span>
        </div>
        <div className="price-info">
          <span className={`price ${isFree ? 'free' : ''}`}>{formattedPrice}</span>
        </div>
      </div>
      
      {option.estimatedDelivery && (
        <div className="delivery-info">
          <span className="delivery-time">{option.estimatedDelivery}</span>
        </div>
      )}
      
      {option.products && option.products.length > 0 && (
        <div className="products-summary">
          <span className="products-count">
            {option.products.length} {option.products.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ShippingOption; 