import React, { useState, useEffect } from 'react';
import { processCartForShipping } from '../../../cart/services/shippingGroupService';

/**
 * Componente para seleccionar opciones de envío agrupadas por reglas
 * Muestra los diferentes grupos de envío optimizados y permite seleccionar una combinación
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.cartItems - Productos en el carrito
 * @param {Function} props.onOptionSelect - Función llamada al seleccionar una opción
 * @param {string} props.selectedOptionId - ID de la opción seleccionada
 * @param {Object} props.userAddress - Dirección del usuario (opcional)
 */
const ShippingGroupSelector = ({ 
  cartItems, 
  onOptionSelect, 
  selectedOptionId,
  userAddress = null
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingGroups, setShippingGroups] = useState([]);
  const [combinations, setCombinations] = useState([]);
  const [debugInfo, setDebugInfo] = useState({});
  
  // Cargar grupos de envío cuando cambian los productos o la dirección
  useEffect(() => {
    const loadShippingOptions = async () => {
      if (!cartItems || cartItems.length === 0) {
        setShippingGroups([]);
        setCombinations([]);
        setLoading(false);
        setDebugInfo({ message: "No hay productos en el carrito" });
        console.log("⚠️ ShippingGroupSelector: No hay productos en el carrito");
        return;
      }
      
      try {
        setLoading(true);
        console.log('⏳ Calculando opciones óptimas de envío...');
        console.log('ℹ️ Productos en carrito:', cartItems.length);
        console.log('ℹ️ Dirección usuario:', userAddress ? `${userAddress.zip}, ${userAddress.state}` : 'No disponible');
        
        const { groups, combinations } = await processCartForShipping(cartItems);
        
        if (!groups || groups.length === 0) {
          console.error('❌ No se generaron grupos de envío');
          setDebugInfo({ message: "No se generaron grupos de envío", groups, combinations });
        } else if (!combinations || combinations.length === 0) {
          console.error('❌ No se generaron combinaciones de envío');
          setDebugInfo({ 
            message: "No se generaron combinaciones de envío", 
            groupsCount: groups.length,
            groupsWithOptions: groups.filter(g => g.shippingOptions && g.shippingOptions.length > 0).length
          });
        } else {
          console.log(`✅ Opciones calculadas: ${groups.length} grupos, ${combinations.length} combinaciones`);
          setDebugInfo({
            groupsCount: groups.length,
            combinationsCount: combinations.length,
            firstGroupName: groups[0]?.ruleName || 'N/A',
            firstCombinationCost: combinations[0]?.totalCost || 'N/A'
          });
        }
        
        setShippingGroups(groups || []);
        setCombinations(combinations || []);
        setError(null);
      } catch (err) {
        console.error('❌ Error al procesar opciones de envío:', err);
        setError('No se pudieron cargar las opciones de envío');
        setDebugInfo({ error: err.message });
      } finally {
        setLoading(false);
      }
    };
    
    loadShippingOptions();
  }, [cartItems, userAddress]);
  
  // Seleccionar automáticamente la primera opción si no hay ninguna seleccionada
  useEffect(() => {
    if (combinations.length > 0 && !selectedOptionId && onOptionSelect) {
      console.log('🔄 Seleccionando automáticamente la primera opción:', combinations[0].name);
      // Seleccionar la opción más económica por defecto
      onOptionSelect({
        id: combinations[0].id,
        label: combinations[0].name,
        totalCost: combinations[0].totalCost,
        details: generateDetailsText(combinations[0])
      });
    }
  }, [combinations, selectedOptionId, onOptionSelect]);
  
  // Manejar selección de opción
  const handleOptionSelect = (combinationId) => {
    const selected = combinations.find(combo => combo.id === combinationId);
    if (selected && onOptionSelect) {
      console.log('👆 Usuario seleccionó opción:', selected.name);
      onOptionSelect({
        id: selected.id,
        label: selected.name,
        totalCost: selected.totalCost,
        details: generateDetailsText(selected)
      });
    }
  };
  
  // Generar texto detallado para una combinación
  const generateDetailsText = (combination) => {
    if (!combination || !combination.groups) return '';
    
    return combination.groups.map(({ group, option }) => 
      `${group.ruleName}: ${option.label} (${option.carrier}) - ${option.isFreeShipping ? 'Gratis' : `$${option.totalCost.toFixed(2)}`}`
    ).join('\n');
  };
  
  // Si el carrito está vacío, no mostrar nada
  if (!cartItems || cartItems.length === 0) {
    return null;
  }
  
  // Mientras se cargan los datos
  if (loading) {
    return (
      <div className="shipping-options-loading text-center p-3">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
          <span className="visually-hidden">Calculando opciones...</span>
        </div>
        <span>Calculando opciones de envío óptimas...</span>
      </div>
    );
  }
  
  // Si hay error
  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
        <div className="mt-2 small">
          <strong>Detalles técnicos:</strong> {debugInfo.error || 'Error desconocido'}
        </div>
      </div>
    );
  }
  
  // Si no hay combinaciones disponibles
  if (combinations.length === 0) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-info-circle me-2"></i>
        No hay opciones de envío disponibles para estos productos.
        
        <div className="mt-2 small">
          <strong>Información de diagnóstico:</strong><br/>
          Grupos: {shippingGroups.length}<br/>
          Mensaje: {debugInfo.message || 'No se pudieron generar combinaciones'}
        </div>
        
        <div className="mt-3">
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="shipping-group-selector">
      {/* Opciones de envío combinadas (Tabla optimizada) */}
      <div className="optimized-shipping-options mb-4">
        <h5 className="mb-3">Opciones de envío disponibles</h5>
        <div className="table-responsive">
          <table className="table table-hover border">
            <thead className="table-light">
              <tr>
                <th scope="col">Opción</th>
                <th scope="col">Detalles</th>
                <th scope="col" className="text-end">Costo</th>
                <th scope="col" className="text-center">Selección</th>
              </tr>
            </thead>
            <tbody>
              {combinations.map((combination, index) => (
                <tr 
                  key={combination.id}
                  className={selectedOptionId === combination.id ? 'table-primary' : ''}
                >
                  <td>
                    <div className="fw-medium">Opción {index + 1}</div>
                    <small className="text-muted">{combination.name}</small>
                  </td>
                  <td>
                    {combination.groups.map(({ group, option }) => (
                      <div key={`${group.id}-${option.id}`} className="option-detail small">
                        <span className="fw-medium">{group.ruleName}</span>: {option.label}
                        <span className="text-muted"> ({option.carrier})</span>
                        <div className="text-muted">Entrega: {option.deliveryTime}</div>
                      </div>
                    ))}
                  </td>
                  <td className="text-end">
                    <span className={`badge ${combination.totalCost === 0 ? 'bg-success' : 'bg-primary'}`}>
                      {combination.totalCost === 0 ? 'Gratis' : `$${combination.totalCost.toFixed(2)}`}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="form-check d-flex justify-content-center">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="shipping-option" 
                        id={`option-${combination.id}`}
                        checked={selectedOptionId === combination.id}
                        onChange={() => handleOptionSelect(combination.id)}
                      />
                      <label className="form-check-label visually-hidden" htmlFor={`option-${combination.id}`}>
                        Seleccionar
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <small className="text-muted mb-3 d-block">
          * Se muestra la opción óptima (menor costo y menor número de envíos) primero
        </small>
      </div>
      
      {/* Información detallada de grupos (Acordeón colapsable) */}
      <div className="shipping-groups-details mt-4">
        <h5>Detalles por grupo de envío</h5>
        <p className="text-muted small">Haga clic para ver los productos incluidos en cada grupo</p>
        
        <div className="accordion accordion-flush" id="shippingGroupsAccordion">
          {shippingGroups.map(group => (
            <div className="accordion-item" key={group.id}>
              <h2 className="accordion-header" id={`heading-${group.id}`}>
                <button 
                  className="accordion-button collapsed" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target={`#collapse-${group.id}`} 
                  aria-expanded="false" 
                  aria-controls={`collapse-${group.id}`}
                >
                  <span className="fw-medium">{group.ruleName}</span>
                  <span className="badge bg-secondary ms-2">
                    {group.products.length} {group.products.length === 1 ? 'producto' : 'productos'}
                  </span>
                  {group.isNational && (
                    <span className="badge bg-info text-dark ms-2">Nacional</span>
                  )}
                </button>
              </h2>
              <div 
                id={`collapse-${group.id}`} 
                className="accordion-collapse collapse" 
                aria-labelledby={`heading-${group.id}`} 
                data-bs-parent="#shippingGroupsAccordion"
              >
                <div className="accordion-body">
                  {/* Productos en este grupo */}
                  <div className="group-products mb-3">
                    <h6 className="mb-2">Productos en este grupo:</h6>
                    <ul className="list-group list-group-flush">
                      {group.products.map(product => (
                        <li key={`${group.id}-${product.id}`} className="list-group-item px-0 py-2">
                          <div className="d-flex">
                            {product.image && (
                              <div className="product-image me-2">
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="img-thumbnail" 
                                  style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                />
                              </div>
                            )}
                            <div className="product-info">
                              <div className="product-name fw-medium">{product.name}</div>
                              <div className="product-quantity text-muted small">
                                Cantidad: {product.quantity} | 
                                Peso: {product.weight}kg | 
                                Precio: ${product.price}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Opciones de envío para este grupo */}
                  <div className="group-options">
                    <h6 className="mb-2">Opciones de envío disponibles:</h6>
                    {group.shippingOptions && group.shippingOptions.length > 0 ? (
                      <div className="list-group">
                        {group.shippingOptions.map(option => (
                          <div key={option.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="option-info">
                                <div className="option-name fw-medium">{option.label}</div>
                                <div className="option-details text-muted small">
                                  {option.carrier} • {option.deliveryTime}
                                </div>
                              </div>
                              <div className="option-price">
                                {option.isFreeShipping ? (
                                  <span className="badge bg-success">Gratis</span>
                                ) : (
                                  <span className="badge bg-primary">${option.totalCost.toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-warning py-2">
                        No hay opciones disponibles para este grupo
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShippingGroupSelector; 