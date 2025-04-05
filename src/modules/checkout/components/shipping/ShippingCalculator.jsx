import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase/config';
import './ShippingCalculator.css';

/**
 * Componente para calcular y mostrar las opciones de envío en el checkout
 */
const ShippingCalculator = ({ 
  cart,
  userAddress,
  selectedShippingOption, 
  onShippingChange,
  onAvailableOptionsChange 
}) => {
  const [shippingOptions, setShippingOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packageGroups, setPackageGroups] = useState([]);
  const [availableOptions, setAvailableOptions] = useState([]);

  // Cargar opciones de envío desde Firebase
  useEffect(() => {
    const fetchShippingOptions = async () => {
      try {
        const shippingRulesRef = collection(db, 'shippingRules');
        const snapshot = await getDocs(shippingRulesRef);
        
        const options = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.shippingTypes && data.shippingTypes.length > 0) {
            options.push(...data.shippingTypes);
          }
        });
        
        setShippingOptions(options);
      } catch (error) {
        console.error('Error al cargar opciones de envío:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingOptions();
  }, []);

  // Filtrar opciones de envío según la dirección del usuario
  useEffect(() => {
    if (!userAddress || !shippingOptions.length) {
      setAvailableOptions([]);
      return;
    }

    // Filtrar opciones de envío basadas en la dirección del usuario
    const filteredOptions = shippingOptions.filter(option => {
      // Si la opción tiene zonas de cobertura, verificar si la dirección del usuario está dentro
      if (option.coverageZones && option.coverageZones.length > 0) {
        return option.coverageZones.some(zone => {
          // Verificar si el código postal está en el rango
          if (zone.zipCodes) {
            // Si es un rango de códigos postales (ej. "10000-20000")
            const zipRanges = zone.zipCodes.split(',').map(z => z.trim());
            const userZip = userAddress.zipCode;
            
            for (const range of zipRanges) {
              if (range.includes('-')) {
                const [min, max] = range.split('-').map(Number);
                if (Number(userZip) >= min && Number(userZip) <= max) {
                  return true;
                }
              } else if (range === userZip) {
                return true;
              }
            }
          }
          
          // Verificar si el estado coincide
          if (zone.states) {
            const states = zone.states.split(',').map(s => s.trim().toLowerCase());
            if (states.includes(userAddress.state.toLowerCase())) {
              return true;
            }
          }
          
          // Verificar si la ciudad coincide
          if (zone.cities) {
            const cities = zone.cities.split(',').map(c => c.trim().toLowerCase());
            if (cities.includes(userAddress.city.toLowerCase())) {
              return true;
            }
          }
          
          return false;
        });
      }
      
      // Si no hay zonas específicas, asumir que está disponible en todo el país
      return true;
    });
    
    setAvailableOptions(filteredOptions);
    
    // Notificar al componente padre sobre las opciones disponibles
    if (onAvailableOptionsChange) {
      onAvailableOptionsChange(filteredOptions);
    }
    
    // Si la opción seleccionada ya no está disponible, deseleccionarla
    if (selectedShippingOption && !filteredOptions.find(opt => opt.id === selectedShippingOption.id)) {
      onShippingChange(null);
    }
  }, [userAddress, shippingOptions, selectedShippingOption, onShippingChange, onAvailableOptionsChange]);

  // Calcular agrupación de productos y costos cuando cambia el carrito o las opciones de envío
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0 || availableOptions.length === 0) {
      setPackageGroups([]);
      return;
    }

    // Agrupar productos por regla de envío
    const calculatePackageGroups = () => {
      // Esta función simula la agrupación de productos como en Amazon
      // En un caso real, usarías la regla asignada a cada producto
      
      const groups = [];
      let currentGroup = { items: [], totalWeight: 0, totalQuantity: 0 };
      let currentGroupIndex = 0;
      
      // Simular agrupación de productos (en producción, usarías la regla real de cada producto)
      cart.items.forEach(item => {
        const productWeight = item.product.weight || 1; // Peso por unidad en kg
        const itemWeight = productWeight * item.quantity;
        
        // Si agregar este producto excedería el límite de productos o peso, crear nuevo grupo
        if (currentGroup.totalQuantity + item.quantity > 10 || 
            currentGroup.totalWeight + itemWeight > 20) {
          
          if (currentGroup.items.length > 0) {
            groups.push({
              ...currentGroup,
              id: `package-${currentGroupIndex}`
            });
            currentGroupIndex++;
            currentGroup = { items: [], totalWeight: 0, totalQuantity: 0 };
          }
        }
        
        // Agregar producto al grupo actual
        currentGroup.items.push(item);
        currentGroup.totalWeight += itemWeight;
        currentGroup.totalQuantity += item.quantity;
      });
      
      // Agregar el último grupo si tiene elementos
      if (currentGroup.items.length > 0) {
        groups.push({
          ...currentGroup,
          id: `package-${currentGroupIndex}`
        });
      }
      
      return groups;
    };
    
    const groups = calculatePackageGroups();
    setPackageGroups(groups);
  }, [cart, availableOptions]);

  // Calcular el costo total de envío para todos los paquetes
  const calculateTotalShippingCost = (option) => {
    if (!option || packageGroups.length === 0) return 0;
    
    return packageGroups.reduce((total, group) => {
      // Costo base por paquete
      let packageCost = parseFloat(option.price);
      
      // Calcular recargo por sobrepeso
      const maxWeight = parseFloat(option.maxPackageWeight) || 20;
      const extraWeightCost = parseFloat(option.extraWeightCost) || 10;
      
      if (group.totalWeight > maxWeight) {
        const extraWeight = Math.ceil(group.totalWeight - maxWeight);
        packageCost += extraWeight * extraWeightCost;
      }
      
      return total + packageCost;
    }, 0);
  };

  // Renderizar las opciones de envío
  const renderShippingOptions = () => {
    if (loading) {
      return (
        <div className="text-center p-3">
          <div className="spinner-border spinner-border-sm text-dark me-2" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span>Calculando opciones de envío...</span>
        </div>
      );
    }

    if (!userAddress) {
      return (
        <div className="alert alert-warning">
          Por favor completa tu dirección para ver las opciones de envío disponibles.
        </div>
      );
    }

    if (availableOptions.length === 0) {
      return (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No hay opciones de envío disponibles para tu ubicación.
          <div className="mt-2 small">
            Código postal: {userAddress.zipCode}<br />
            Ciudad: {userAddress.city}<br />
            Estado: {userAddress.state}
          </div>
        </div>
      );
    }

    return (
      <div className="shipping-options">
        {availableOptions.map(option => {
          const totalCost = calculateTotalShippingCost(option);
          const isSelected = selectedShippingOption && selectedShippingOption.id === option.id;
          
          return (
            <div 
              key={option.id}
              className={`shipping-option ${isSelected ? 'selected' : ''}`}
              onClick={() => onShippingChange({...option, calculatedCost: totalCost})}
            >
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="shippingOption"
                  id={`shipping-${option.id}`}
                  checked={isSelected}
                  onChange={() => {}}
                />
                <label className="form-check-label" htmlFor={`shipping-${option.id}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-medium">{option.label}</div>
                      <div className="text-muted small">
                        <span className="carrier">{option.carrier}</span>
                        <span className="mx-2">·</span>
                        <span className="delivery-time">{option.minDays}-{option.maxDays} días</span>
                      </div>
                    </div>
                    <div className="shipping-price">
                      ${totalCost.toFixed(2)}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizar los grupos de paquetes
  const renderPackageGroups = () => {
    if (packageGroups.length === 0 || !selectedShippingOption) return null;
    
    return (
      <div className="mt-4">
        <h6 className="text-dark mb-3">Detalles del envío</h6>
        
        {packageGroups.map((group, index) => {
          const maxWeight = parseFloat(selectedShippingOption.maxPackageWeight) || 20;
          const extraWeightCost = parseFloat(selectedShippingOption.extraWeightCost) || 10;
          const hasExtraWeight = group.totalWeight > maxWeight;
          
          // Calcular costos
          let packageCost = parseFloat(selectedShippingOption.price);
          let extraWeightCharge = 0;
          
          if (hasExtraWeight) {
            const extraWeight = Math.ceil(group.totalWeight - maxWeight);
            extraWeightCharge = extraWeight * extraWeightCost;
            packageCost += extraWeightCharge;
          }
          
          return (
            <div key={group.id} className="package-group mb-3">
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">
                      Paquete {index + 1}
                      <span className="badge bg-dark text-white ms-2">
                        {group.items.length} {group.items.length === 1 ? 'producto' : 'productos'}
                      </span>
                    </h6>
                    <div className="text-end">
                      <div className="fs-5 fw-medium">${packageCost.toFixed(2)}</div>
                      <div className="text-muted small">
                        {group.totalWeight.toFixed(1)} kg
                      </div>
                    </div>
                  </div>
                  
                  {group.items.map(item => (
                    <div key={item.product.id} className="d-flex py-2 border-top">
                      <div className="flex-shrink-0 me-3">
                        <div className="product-thumbnail">
                          <img 
                            src={item.product.imageUrl || '/placeholder.jpg'} 
                            alt={item.product.name}
                            className="img-fluid rounded"
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-medium">{item.product.name}</div>
                        <div className="d-flex text-muted small">
                          <div>Cantidad: {item.quantity}</div>
                          <div className="ms-3">
                            {((item.product.weight || 1) * item.quantity).toFixed(1)} kg
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {hasExtraWeight && (
                    <div className="alert alert-info mt-3 mb-0 py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <i className="bi bi-info-circle me-2"></i>
                          Recargo por sobrepeso ({(group.totalWeight - maxWeight).toFixed(1)} kg adicionales)
                        </div>
                        <div className="fw-medium">
                          +${extraWeightCharge.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="shipping-calculator">
      <h5 className="text-dark mb-3">Opciones de envío</h5>
      
      {renderShippingOptions()}
      
      {renderPackageGroups()}
    </div>
  );
};

ShippingCalculator.propTypes = {
  cart: PropTypes.object.isRequired,
  userAddress: PropTypes.object,
  selectedShippingOption: PropTypes.object,
  onShippingChange: PropTypes.func.isRequired,
  onAvailableOptionsChange: PropTypes.func
};

export default ShippingCalculator; 