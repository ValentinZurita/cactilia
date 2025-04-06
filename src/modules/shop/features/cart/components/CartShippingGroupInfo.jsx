import React, { useState, useEffect } from 'react';
import { processCartForShipping } from '../services/shippingGroupService';

/**
 * Componente informativo que muestra los grupos de envío optimizados en el carrito
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.cartItems - Productos en el carrito
 * @returns {JSX.Element} Información sobre los grupos de envío
 */
const CartShippingGroupInfo = ({ cartItems }) => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [combinations, setCombinations] = useState([]);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    const loadShippingGroups = async () => {
      if (!cartItems || cartItems.length === 0) {
        setGroups([]);
        setCombinations([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { groups, combinations } = await processCartForShipping(cartItems);
        setGroups(groups);
        setCombinations(combinations);
      } catch (error) {
        console.error('Error al procesar grupos de envío:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadShippingGroups();
  }, [cartItems]);
  
  // Si no hay elementos o aún está cargando, no mostrar nada
  if (!cartItems || cartItems.length === 0 || loading) {
    return null;
  }
  
  // Si no hay grupos o combinaciones, no mostrar nada
  if (groups.length === 0 || combinations.length === 0) {
    return null;
  }
  
  // Si hay una sola combinación, mostrar información simplificada
  if (groups.length === 1) {
    return (
      <div className="shipping-info mt-3 mb-4">
        <div className="alert alert-light border">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-truck me-2 text-primary"></i>
            <h6 className="mb-0">Información de envío</h6>
          </div>
          <p className="mb-0 small">
            Todos los productos se enviarán juntos
            {groups[0].isNational && <span className="ms-1 text-muted">(Envío nacional)</span>}
          </p>
          <div className="mt-2 small text-muted">
            {combinations.length > 0 && 
              <span>Costo estimado: desde ${combinations[0].totalCost.toFixed(2)}</span>
            }
          </div>
        </div>
      </div>
    );
  }
  
  // Para múltiples grupos, mostrar información detallada
  return (
    <div className="shipping-groups-info mt-3 mb-4">
      <div className={`alert ${expanded ? 'alert-light' : 'alert-info'} border`}>
        <div 
          className="d-flex justify-content-between align-items-center mb-2"
          style={{ cursor: 'pointer' }}
          onClick={() => setExpanded(!expanded)}
        >
          <div className="d-flex align-items-center">
            <i className="bi bi-boxes me-2 text-primary"></i>
            <h6 className="mb-0">Agrupación óptima de envío</h6>
          </div>
          <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`}></i>
        </div>
        
        {!expanded ? (
          <>
            <p className="mb-0 small">
              Sus productos serán enviados en {groups.length} grupos optimizados.
              <span className="text-primary ms-1 cursor-pointer" onClick={() => setExpanded(true)}>
                Ver detalles
              </span>
            </p>
            <div className="mt-2 small text-muted">
              {combinations.length > 0 && 
                <span>Costo estimado: desde ${combinations[0].totalCost.toFixed(2)}</span>
              }
            </div>
          </>
        ) : (
          <div className="mt-2">
            <p className="small text-muted mb-3">
              Sus productos serán agrupados en {groups.length} diferentes envíos 
              para optimizar costos y tiempos de entrega.
            </p>
            
            {groups.map((group, index) => (
              <div key={group.id} className="shipping-group mb-3 pb-2 border-bottom">
                <h6 className="mb-1 d-flex align-items-center">
                  <span className="badge bg-primary me-2">{index + 1}</span>
                  {group.ruleName}
                  {group.isNational && 
                    <span className="badge bg-info text-dark ms-2">Nacional</span>
                  }
                </h6>
                <div className="products-in-group small">
                  <div className="mt-1 mb-2 fw-medium">Productos:</div>
                  <div className="row g-2">
                    {group.products.map(product => (
                      <div key={`${group.id}-${product.id}`} className="col-md-6">
                        <div className="d-flex product-preview p-1 border rounded">
                          {product.image && (
                            <img 
                              src={product.image}
                              alt={product.name}
                              className="img-thumbnail me-2"
                              style={{width: '40px', height: '40px', objectFit: 'cover'}}
                            />
                          )}
                          <div className="product-name text-truncate">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="estimated-cost mt-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-medium">Costo estimado de envío:</span>
                <span className="badge bg-success p-2">
                  Desde ${combinations[0].totalCost.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 small text-muted">
                * Los costos finales se calcularán en el checkout
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartShippingGroupInfo; 