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
  const [shippingData, setShippingData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadShippingGroups = async () => {
      // Si no hay items, no hacer nada
      if (!cartItems || cartItems.length === 0) {
        setLoading(false);
        setShippingData(null);
        return;
      }
      
      try {
        setLoading(true);
        console.log('🔍 CartShippingGroupInfo: Procesando', cartItems.length, 'productos');
        
        // Calcular opciones de envío
        const result = await processCartForShipping(cartItems);
        
        console.log('📊 Resultado:', {
          grupos: result?.groups?.length || 0,
          combinaciones: result?.combinations?.length || 0
        });
        
        // Guardar datos
        setShippingData(result);
        setError(null);
      } catch (err) {
        console.error('❌ Error al procesar envíos:', err);
        setError(err.message || 'Error al calcular opciones de envío');
        setShippingData(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadShippingGroups();
  }, [cartItems]);
  
  // En carga o sin productos, no mostrar nada
  if (loading || !cartItems || cartItems.length === 0) {
    return null;
  }
  
  // Si hay error, mostrar mensaje simple
  if (error) {
    return (
      <div className="shipping-info mt-3">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No se pudieron calcular opciones de envío
        </div>
      </div>
    );
  }
  
  // Si no hay datos de envío o no hay grupos/combinaciones
  if (!shippingData || !shippingData.groups || !shippingData.combinations || 
      shippingData.groups.length === 0 || shippingData.combinations.length === 0) {
    return null;
  }
  
  // Información básica de envío
  const { groups, combinations } = shippingData;
  const cheapestOption = combinations[0];
  
  return (
    <div className="shipping-info mt-3 mb-3">
      <div className="alert alert-light border">
        <div className="d-flex align-items-center mb-2">
          <i className="bi bi-truck me-2 text-primary"></i>
          <h6 className="mb-0">Información de envío</h6>
        </div>
        
        <p className="mb-2 small">
          {groups.length > 1 
            ? `Sus productos serán enviados en ${groups.length} grupos para optimizar costos.`
            : 'Todos los productos se enviarán juntos.'}
        </p>
        
        {cheapestOption && (
          <div className="mt-2 small">
            <strong>Costo estimado:</strong> {' '}
            {cheapestOption.isAllFree 
              ? <span className="text-success">Envío gratis</span>
              : <span>desde ${(cheapestOption.totalPrice || 0).toFixed(2)}</span>
            }
            <div className="text-muted mt-1">* Los costos finales se calcularán en el checkout</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartShippingGroupInfo; 