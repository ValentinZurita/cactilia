import React from 'react';
import PropTypes from 'prop-types';
import ProductDetails from './ProductDetails';
import CostBreakdown from './CostBreakdown';
import { Shimmer } from '../../common';
import { 
  formatPrice, 
  calculateDeliveryTime, 
  getDisplayName, 
  isFreeShipping 
} from '../../../utils/shippingUtils';

/**
 * Componente que renderiza una opción individual de envío
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.option - Datos de la opción de envío
 * @param {function} props.onSelect - Función para seleccionar esta opción
 * @param {boolean} props.isSelected - Indica si esta opción está seleccionada
 * @param {Array} props.cartItems - Items del carrito para mostrar detalles
 * @param {boolean} props.loading - Indica si está en estado de carga
 */
const ShippingOption = ({ 
  option, 
  onSelect, 
  isSelected, 
  cartItems = [],
  loading = false
}) => {
  // Si está cargando, mostrar versión shimmer del componente
  if (loading) {
    return (
      <Shimmer 
        height={140} 
        borderRadius={8} 
        className="shipping-option-card"
      />
    );
  }
  
  // Preparar clases y estados
  const cardClasses = `shipping-option-card ${isSelected ? 'selected' : ''}`;
  
  // Calcular propiedades de la opción
  const free = isFreeShipping(option);
  const isMultiPackage = option.packages && option.packages.length > 1;
  
  // Calcular peso total
  const totalWeight = option.packages && option.packages.length > 0
    ? option.packages.reduce((total, pkg) => total + (pkg.packageWeight || pkg.totalWeight || 0), 0)
    : option.weight || option.totalWeight || 0;
    
  // Calcular número de productos
  const productCount = option.packages && option.packages.length > 0
    ? option.packages.reduce((total, pkg) => total + (pkg.products?.length || pkg.items?.length || 0), 0)
    : option.products?.length || 0;
  
  // Calcular precio total
  const calculateTotalPrice = () => {
    if (free) return 0;
    
    if (option.packages && option.packages.length > 0) {
      return option.packages.reduce((total, pkg) => total + (pkg.price || option.price || 0), 0);
    }
    
    return option.price || option.totalCost || option.calculatedCost || 0;
  };
  
  return (
    <div 
      key={option.id || option.optionId} 
      className={cardClasses}
      onClick={() => onSelect(option)}
    >
      <div className="shipping-option-header">
        <div className="shipping-option-name">
          <i className={free ? 'bi bi-gift' : 'bi bi-truck'}></i>
          <span className="shipping-name">{getDisplayName(option)}</span>
          {free && <span className="shipping-tag free">GRATIS</span>}
          {isMultiPackage && <span className="shipping-tag packages">{option.packageCount || option.packages.length} paquetes</span>}
        </div>
        <div className="shipping-option-price">
          {!free ? 
            <span>{formatPrice(calculateTotalPrice())}</span> : 
            <span className="text-success">Gratis</span>
          }
        </div>
      </div>
      
      <div className="shipping-option-details">
        <div className="shipping-detail-item">
          <i className="bi bi-clock"></i>
          <span>{calculateDeliveryTime(option)}</span>
        </div>
        
        {totalWeight > 0 && (
          <div className="shipping-detail-item">
            <i className="bi bi-box"></i>
            <span>Peso total: {totalWeight.toFixed(2)} kg</span>
          </div>
        )}
        
        {productCount > 0 && (
          <div className="shipping-detail-item">
            <i className="bi bi-cart"></i>
            <span>{productCount} productos</span>
          </div>
        )}
      </div>
      
      <ProductDetails option={option} cartItems={cartItems} />
      <CostBreakdown option={option} />
      
      {option.packages && option.packages.length > 0 && (
        <div className="shipping-packages">
          <div className="package-summary d-flex align-items-center justify-content-between mb-2">
            <div>
              <i className="bi bi-boxes me-2"></i>
              <strong>{option.packages.length > 1 ? 
                `Envío en ${option.packages.length} paquetes` : 
                'Detalle del paquete'}
              </strong>
            </div>
            
            <div className="d-flex align-items-center">
              <div className="package-detail-item me-3">
                <i className="bi bi-box me-1"></i>
                <span>{(option.packages.reduce((sum, pkg) => sum + (pkg.packageWeight || pkg.totalWeight || 0), 0)).toFixed(2)} kg</span>
              </div>
              <div className="package-detail-item">
                <i className="bi bi-cart me-1"></i>
                <span>{option.packages.reduce((sum, pkg) => sum + (pkg.products?.length || pkg.items?.length || 0), 0)} productos</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ShippingOption.propTypes = {
  option: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  cartItems: PropTypes.array,
  loading: PropTypes.bool
};

export default ShippingOption; 