import React from 'react';
import './ShippingOption.css';

/**
 * Componente que representa una opción de envío individual
 * 
 * @param {Object} props
 * @param {Object} props.option - Datos de la opción de envío
 * @param {boolean} props.isSelected - Si la opción está seleccionada
 * @param {Function} props.onSelect - Función para seleccionar esta opción
 * @param {boolean} props.isComplete - Si esta opción cubre todos los productos
 * @param {boolean} props.disabled - Si la opción está deshabilitada
 * @returns {JSX.Element}
 */
const ShippingOption = ({ option, isSelected, onSelect, isComplete = false, disabled = false }) => {
  const handleSelect = () => {
    if (!disabled && onSelect) {
      onSelect(option);
    }
  };

  const formattedPrice = option.option?.price === 0 
    ? 'Gratis' 
    : `$${parseFloat(option.option?.price || 0).toFixed(2)}`;

  return (
    <div 
      className={`shipping-option ${isSelected ? 'shipping-option--selected' : ''} ${disabled ? 'shipping-option--disabled' : ''}`}
      onClick={handleSelect}
    >
      <div className="shipping-option__radio">
        <input 
          type="radio" 
          checked={isSelected} 
          onChange={handleSelect} 
          disabled={disabled}
        />
      </div>
      
      <div className="shipping-option__content">
        <div className="shipping-option__header">
          <h4 className="shipping-option__title">
            {option.description || option.ruleName}
            {!isComplete && <span className="shipping-option__partial-badge">Parcial</span>}
          </h4>
          <span className="shipping-option__price">
            {formattedPrice}
          </span>
        </div>
        
        <div className="shipping-option__details">
          <p className="shipping-option__carrier">
            {option.option?.name}
          </p>
          <p className="shipping-option__delivery-time">
            {option.option?.estimatedDelivery}
          </p>
        </div>
        
        {option.products && (
          <div className="shipping-option__products">
            <span className="shipping-option__products-count">
              {option.products.length} producto(s)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingOption; 