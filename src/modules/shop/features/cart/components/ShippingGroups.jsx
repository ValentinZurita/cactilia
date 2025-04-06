import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { processCartForShipping } from '../services/shippingGroupService';

/**
 * Componente que muestra los grupos de envío y sus opciones
 */
const ShippingGroups = () => {
  const cartItems = useSelector(state => state.cart.items);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingGroups, setShippingGroups] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  // Cargar grupos de envío cuando cambia el carrito
  useEffect(() => {
    const loadShippingGroups = async () => {
      if (!cartItems || cartItems.length === 0) {
        setShippingGroups([]);
        setRecommendations([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { groups, recommendations } = await processCartForShipping(cartItems);
        setShippingGroups(groups);
        setRecommendations(recommendations);
        setError(null);
      } catch (err) {
        console.error('Error al procesar opciones de envío:', err);
        setError('No se pudieron cargar las opciones de envío');
      } finally {
        setLoading(false);
      }
    };
    
    loadShippingGroups();
  }, [cartItems]);
  
  // Si el carrito está vacío, no mostrar nada
  if (cartItems.length === 0) {
    return null;
  }
  
  // Mientras se cargan los datos
  if (loading) {
    return (
      <div className="shipping-groups-container p-4 border rounded mt-4">
        <h3 className="text-lg font-semibold mb-3">Opciones de envío</h3>
        <p>Calculando opciones disponibles...</p>
      </div>
    );
  }
  
  // Si hay error
  if (error) {
    return (
      <div className="shipping-groups-container p-4 border rounded mt-4">
        <h3 className="text-lg font-semibold mb-3">Opciones de envío</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  // Si no hay grupos
  if (shippingGroups.length === 0) {
    return (
      <div className="shipping-groups-container p-4 border rounded mt-4">
        <h3 className="text-lg font-semibold mb-3">Opciones de envío</h3>
        <p>No hay opciones de envío disponibles para estos productos</p>
      </div>
    );
  }
  
  return (
    <div className="shipping-groups-container p-4 border rounded mt-4">
      <h3 className="text-xl font-semibold mb-4">Opciones de envío</h3>
      
      {/* Grupos de envío */}
      {shippingGroups.map(group => (
        <div key={group.id} className="shipping-group mb-6 p-3 border rounded">
          <h4 className="text-lg font-medium mb-2">{group.name}</h4>
          
          <div className="products-in-group mb-3">
            <p className="text-sm text-gray-600 mb-2">Productos en este grupo:</p>
            <ul className="list-disc pl-5">
              {group.items.map(item => {
                const product = item.product || item;
                return (
                  <li key={product.id} className="text-sm">
                    {product.name} x {item.quantity}
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Opciones de envío para este grupo */}
          <div className="shipping-options mt-3">
            <p className="text-sm font-medium mb-2">Opciones disponibles:</p>
            
            {group.shippingOptions && group.shippingOptions.length > 0 ? (
              <div className="options-list">
                {group.shippingOptions.map(option => (
                  <div key={option.id} className="option-card p-2 border rounded mb-2 flex justify-between items-center">
                    <div className="option-info">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.carrier} • {option.deliveryTime}</p>
                    </div>
                    <div className="option-price text-right">
                      {option.isFreeShipping ? (
                        <span className="text-green-600 font-semibold">Gratis</span>
                      ) : (
                        <span className="font-semibold">${option.totalCost.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-500">No hay opciones disponibles para este grupo</p>
            )}
          </div>
        </div>
      ))}
      
      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <div className="shipping-recommendations mt-4 p-3 bg-gray-50 rounded">
          <h4 className="text-lg font-medium mb-2">Recomendación</h4>
          <div className="recommendation-card">
            <p className="text-sm mb-2">La opción más económica para enviar todos tus productos:</p>
            <div className="recommended-options">
              {recommendations[0].options.map(item => (
                <div key={item.groupId} className="recommended-option mb-2">
                  <p className="text-sm">
                    <span className="font-medium">{item.groupName}:</span> {item.option.label} - 
                    {item.option.isFreeShipping ? (
                      <span className="text-green-600 ml-1">Gratis</span>
                    ) : (
                      <span className="ml-1">${item.cost.toFixed(2)}</span>
                    )}
                  </p>
                </div>
              ))}
              <div className="total-cost mt-2 pt-2 border-t">
                <p className="font-semibold text-right">
                  Total envío: ${recommendations[0].totalCost.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Información adicional */}
      <div className="shipping-info mt-4 text-xs text-gray-500">
        <p>* Los costos de envío son calculados en base a las reglas configuradas para cada producto.</p>
        <p>* El precio final puede variar según la dirección de envío y método seleccionado en el checkout.</p>
      </div>
    </div>
  );
};

export default ShippingGroups; 