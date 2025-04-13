/**
 * Componente para mostrar un paquete de envío individual
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from 'utils/format';
import '../styles/ShippingPackage.css';

/**
 * Componente que muestra un paquete de envío
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.packageData - Datos del paquete
 * @param {boolean} props.selected - Si está seleccionado
 * @param {Array} props.cartItems - Items del carrito para identificar productos incluidos
 */
export const ShippingPackage = ({ packageData, selected = false, cartItems = [], onSelect }) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  
  if (!packageData) return null;

  // Extraer datos del paquete
  const { 
    name, 
    carrier, 
    serviceType, 
    estimatedDelivery,
    deliveryTime,
    tiempo_entrega,
    totalCost,
    description,
    products = [],  // IDs de productos en este paquete
    maxProductsPerPackage,
    maxWeightPerPackage,
    rule_id,
    zoneType,
    packagesCount = 1,
    packagesInfo: externalPackagesInfo = [],
    price = 0
  } = packageData;

  // Debug para ver qué nombre recibe el componente
  console.log(`📦 ShippingPackage recibe nombre: "${name}"`);

  // Obtener el tiempo de entrega desde cualquier fuente disponible
  const displayDeliveryTime = deliveryTime || tiempo_entrega || '';

  // Obtener detalles de los productos incluidos en este paquete
  const packProducts = cartItems
    .filter(item => {
      const productId = (item.product ? item.product.id : item.id);
      return products.includes(productId);
    })
    .map(item => {
      const product = item.product || item;
      return {
        id: product.id,
        name: product.name || product.nombre || '',
        quantity: item.quantity || 1,
        weight: product.weight || product.peso || 0,
        price: product.price || product.precio || 0
      };
    });
    
  // Calcular la cantidad total de productos incluyendo cantidades
  const totalProductUnits = packProducts.reduce((sum, product) => {
    return sum + product.quantity;
  }, 0);
  
  // Calcular peso total para mostrar en la UI
  const totalWeight = packProducts.reduce((sum, product) => {
    return sum + (parseFloat(product.weight) * product.quantity);
  }, 0).toFixed(2);
  
  // Determinar el tipo de envío para mostrar el icono correcto
  const getShippingIcon = () => {
    if (zoneType === 'express') return <i className="bi bi-truck shipping-express"></i>;
    if (zoneType === 'local') return <i className="bi bi-truck"></i>;
    if (zoneType === 'nacional') return <i className="bi bi-truck"></i>;
    return <i className="bi bi-box"></i>;
  };

  // Distribuir productos en paquetes según restricciones
  const calculatePackages = () => {
    // Si hay restricción de 1 producto por paquete, distribuimos incluyendo cantidades
    if (maxProductsPerPackage === 1) {
      let packages = [];
      
      // Distribuir cada unidad como paquete independiente
      packProducts.forEach(product => {
        for (let i = 0; i < product.quantity; i++) {
          packages.push({
            id: `pkg_${packages.length + 1}`,
            products: [{...product, quantity: 1}],
            weight: parseFloat(product.weight),
            price: price || (totalCost / (totalProductUnits || 1))
          });
        }
      });
      
      return packages;
    }
    // Si hay otra restricción diferente o información externa, usar eso
    else if (externalPackagesInfo && externalPackagesInfo.length > 0) {
      return externalPackagesInfo.map((pkg, index) => {
        const pkgProducts = packProducts.filter(p => pkg.products.includes(p.id));
        const weight = pkgProducts.reduce((sum, p) => sum + (parseFloat(p.weight) * p.quantity), 0);
        
        return {
          ...pkg,
          id: pkg.id || `pkg_${index + 1}`,
          products: pkgProducts,
          weight,
          price: price || (totalCost / externalPackagesInfo.length)
        };
      });
    }
    // Si no hay restricciones, todos en un solo paquete
    else {
      return [{
        id: 'pkg_1',
        products: packProducts,
        weight: parseFloat(totalWeight),
        price: totalCost
      }];
    }
  };
  
  const packages = calculatePackages();
  
  // Calcular el costo total como la suma de todos los paquetes
  const calculatedTotalCost = packages.reduce((sum, pkg) => sum + pkg.price, 0);
  
  // Formatear costos
  const formattedTotalCost = calculatedTotalCost === 0 
    ? 'GRATIS' 
    : new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
      }).format(calculatedTotalCost);
  
  // Formatear el precio por paquete individual
  const formatPackagePrice = (price) => {
    return price === 0 
      ? 'GRATIS' 
      : new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 2
        }).format(price);
  };
  
  // Manejar la selección de esta opción
  const handleSelect = () => {
    onSelect && onSelect(packageData.id);
  };
  
  // Alternar la visualización de detalles
  const toggleDetails = (e) => {
    e.stopPropagation();
    setDetailsExpanded(!detailsExpanded);
  };

  // Determine delivery time text based on available data
  const getDeliveryTimeText = () => {
    // Si hay un texto de tiempo de entrega ya formateado, usarlo directamente
    if (displayDeliveryTime) {
      return displayDeliveryTime;
    }
    
    // Si hay datos de estimatedDelivery como objeto, formatearlos
    if (estimatedDelivery) {
      if (estimatedDelivery.min === estimatedDelivery.max) {
        return `${estimatedDelivery.min} ${estimatedDelivery.timeUnit}`;
      }
      
      return `${estimatedDelivery.min} a ${estimatedDelivery.max} ${estimatedDelivery.timeUnit}`;
    }
    
    // Si no hay datos, mostrar mensaje genérico
    return "Tiempo de entrega no disponible";
  };

  return (
    <div 
      className={`shipping-package ${selected ? 'selected' : ''}`}
      onClick={handleSelect}
    >
      <div className="shipping-package-header">
        <div className="shipping-package-icon">
          {getShippingIcon()}
        </div>
        <div className="shipping-package-info">
          <h3>{name} {carrier && `- ${carrier}`}</h3>
          <div className="shipping-package-details">
            {displayDeliveryTime ? (
              <div className="shipping-delivery-time">
                <i className="bi bi-clock"></i>
                <span>{getDeliveryTimeText()}</span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="shipping-package-price">
          {calculatedTotalCost === 0 ? (
            <span className="free-shipping">GRATIS</span>
          ) : (
            <span>{formattedTotalCost}</span>
          )}
        </div>
      </div>
      
      <div className="shipping-package-body">
        <div className="shipping-package-summary">
          <div className="summary-pill">
            <i className="bi bi-boxes"></i>
            <span>{totalProductUnits} producto{totalProductUnits !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="summary-pill">
            <i className="bi bi-weight"></i>
            <span>{totalWeight} kg</span>
          </div>
          
          {maxProductsPerPackage && (
            <div className="summary-pill">
              <i className="bi bi-box"></i>
              <span>Máx. {maxProductsPerPackage} producto{maxProductsPerPackage !== 1 ? 's' : ''}/paquete</span>
            </div>
          )}
          
          {maxWeightPerPackage && (
            <div className="summary-pill">
              <i className="bi bi-weight"></i>
              <span>Máx. {maxWeightPerPackage} kg/paquete</span>
            </div>
          )}
          
          <button className="details-toggle" onClick={toggleDetails}>
            {detailsExpanded ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>}
            <span>{detailsExpanded ? 'Ocultar detalles' : 'Ver detalles'}</span>
          </button>
        </div>
        
        {detailsExpanded && (
          <div className="shipping-package-expanded">
            <h4>Productos incluidos:</h4>
            <div className="products-breakdown">
              {packages.map((pkg, index) => (
                <div key={pkg.id} className="package-breakdown">
                  {packages.length > 1 && (
                    <div className="package-header-breakdown">
                      <h5>Paquete {index + 1}:</h5>
                      <span className="package-price">{formatPackagePrice(pkg.price)}</span>
                    </div>
                  )}
                  <ul className="product-list">
                    {pkg.products.map(product => (
                      <li key={`${pkg.id}_${product.id}`} className="product-item">
                        <div className="product-details">
                          <span className="product-name">{product.name} {product.quantity > 1 ? `(${product.quantity})` : ''}</span>
                          {product.weight > 0 && (
                            <span className="product-weight">{(parseFloat(product.weight) * product.quantity).toFixed(2)} kg</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            {packages.length > 1 && (
              <div className="shipping-cost-summary">
                <span>Total envío:</span>
                <span className="shipping-total-price">{formattedTotalCost}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ShippingPackage.propTypes = {
  packageData: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    carrier: PropTypes.string,
    serviceType: PropTypes.string,
    estimatedDelivery: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
      timeUnit: PropTypes.string
    }),
    totalCost: PropTypes.number,
    products: PropTypes.array,
    packages: PropTypes.array,
    zoneType: PropTypes.string
  }).isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired
};

ShippingPackage.defaultProps = {
  selected: false
};

export default ShippingPackage; 