import React from 'react';
import PropTypes from 'prop-types';
import { useShippingOptions } from '../hooks/useShippingOptions';
import '../styles/shipping.css';

const ShippingOption = ({ option, isSelected, onSelect }) => {
  const formattedPrice = option.isFree 
    ? 'GRATIS' 
    : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(option.price);
  
  return (
    <div 
      className={`shipping-option ${isSelected ? 'shipping-option-selected' : ''}`}
      onClick={() => onSelect(option.id)}
    >
      <div className="shipping-option-header">
        <div className="shipping-option-radio">
          <input 
            type="radio" 
            checked={isSelected} 
            onChange={() => onSelect(option.id)} 
            id={`shipping-option-${option.id}`}
          />
          <label htmlFor={`shipping-option-${option.id}`}>
            <div className="shipping-option-name">{option.name}</div>
          </label>
        </div>
        <div className="shipping-option-price">{formattedPrice}</div>
      </div>
      
      {option.deliveryTime && (
        <div className="shipping-option-delivery">
          <span className="delivery-label">Entrega estimada:</span> {option.deliveryTime}
        </div>
      )}
      
      {option.description && (
        <div className="shipping-option-description">{option.description}</div>
      )}
      
      {option.isFree && (
        <div className="shipping-option-tag shipping-free-tag">Envío gratis</div>
      )}
      
      {option.carrierName && (
        <div className="shipping-option-carrier">
          <span className="carrier-label">Mensajería:</span> {option.carrierName}
        </div>
      )}
    </div>
  );
};

const ShippingOptionsGroup = ({ title, options, selectedOption, onSelectOption }) => {
  if (!options || options.length === 0) return null;
  
  return (
    <div className="shipping-options-group">
      <h3 className="shipping-group-title">{title}</h3>
      <div className="shipping-options-list">
        {options.map(option => (
          <ShippingOption 
            key={option.id}
            option={option}
            isSelected={selectedOption === option.id}
            onSelect={onSelectOption}
          />
        ))}
      </div>
    </div>
  );
};

const ShippingOptionsList = ({ cartItems, address, onShippingSelected }) => {
  const { 
    loading, 
    error, 
    options, 
    selectedOption, 
    selectOption,
    selectedShippingOption,
    refreshOptions
  } = useShippingOptions(cartItems, address);
  
  // Agrupar opciones por tipo de zona
  const groupedOptions = options.reduce((groups, option) => {
    // Usamos zoneName que proviene del campo "zona" en Firestore
    const zoneKey = option.zoneName ? option.zoneName.toLowerCase() : 'otros';
    if (!groups[zoneKey]) {
      groups[zoneKey] = [];
    }
    groups[zoneKey].push(option);
    return groups;
  }, {});
  
  // Manejar la selección de opción
  const handleOptionSelect = (optionId) => {
    if (selectOption(optionId) && onShippingSelected) {
      const option = options.find(opt => opt.id === optionId);
      onShippingSelected(option);
    }
  };
  
  // Si está cargando, mostrar estado de carga
  if (loading) {
    return (
      <div className="shipping-options-container">
        <div className="shipping-loading">
          <div className="shipping-shimmer"></div>
          <div className="shipping-shimmer"></div>
          <div className="shipping-shimmer"></div>
        </div>
      </div>
    );
  }
  
  // Si hay un error, mostrar mensaje
  if (error) {
    return (
      <div className="shipping-options-container">
        <div className="shipping-error">
          <p>{error}</p>
          <button onClick={refreshOptions} className="refresh-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  
  // Si no hay opciones, mostrar mensaje
  if (options.length === 0) {
    return (
      <div className="shipping-options-container">
        <div className="shipping-empty">
          <p>No hay opciones de envío disponibles para tu dirección.</p>
          <button onClick={refreshOptions} className="refresh-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  
  // Renderizar todas las opciones disponibles agrupadas por zona
  return (
    <div className="shipping-options-container">
      {Object.keys(groupedOptions).map(groupKey => {
        // Obtenemos el nombre de zona del primer elemento del grupo
        const groupTitle = groupedOptions[groupKey][0].zoneName || 'Otras opciones';
        
        return (
          <ShippingOptionsGroup
            key={groupKey}
            title={groupTitle}
            options={groupedOptions[groupKey]}
            selectedOption={selectedOption}
            onSelectOption={handleOptionSelect}
          />
        );
      })}
    </div>
  );
};

ShippingOptionsList.propTypes = {
  cartItems: PropTypes.array.isRequired,
  address: PropTypes.object.isRequired,
  onShippingSelected: PropTypes.func
};

ShippingOptionsGroup.propTypes = {
  title: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  selectedOption: PropTypes.string,
  onSelectOption: PropTypes.func.isRequired
};

ShippingOption.propTypes = {
  option: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default ShippingOptionsList; 