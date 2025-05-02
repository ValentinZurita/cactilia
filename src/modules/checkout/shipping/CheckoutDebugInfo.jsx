import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de diagnóstico para mostrar información crítica en la página de checkout
 * Muestra detalles sobre dirección, productos y reglas de envío
 */
const CheckoutDebugInfo = ({ cart, userAddress }) => {
  useEffect(() => {
    // Log forzado en el montaje del componente
    console.warn('🚨🚨🚨 COMPONENTE DE DIAGNÓSTICO MONTADO 🚨🚨🚨');
    
    if (userAddress) {
      console.warn('🏠 DATOS DE DIRECCIÓN DETECTADOS', {
        cp: userAddress.zipCode || userAddress.postalCode || 'NO DEFINIDO',
        estado: userAddress.state || 'NO DEFINIDO',
        ciudad: userAddress.city || 'NO DEFINIDA'
      });
    } else {
      console.warn('🏠 NO HAY DIRECCIÓN DEFINIDA');
    }
    
    if (cart && cart.items && cart.items.length > 0) {
      console.warn('🛒 PRODUCTOS EN CARRITO', cart.items.length);
      cart.items.forEach((item, index) => {
        const product = item.product || item;
        console.warn(`📦 PRODUCTO ${index + 1}:`, {
          id: product.id,
          nombre: product.name,
          shippingRuleId: product.shippingRuleId || 'NO TIENE',
          shippingRuleIds: product.shippingRuleIds || [],
          peso: product.weight || 'NO DEFINIDO'
        });
      });
    } else {
      console.warn('🛒 NO HAY PRODUCTOS EN EL CARRITO');
    }
  }, [cart, userAddress]);

  // MODIFICADO: Siempre renderizar el componente
  // if (!cart || !userAddress || process.env.NODE_ENV === 'production') {
  //   return null;
  // }

  // Contar productos con reglas de envío
  let productsWithRules = 0;
  if (cart && cart.items) {
    productsWithRules = cart.items.filter(item => {
      const product = item.product || item;
      return product.shippingRuleId || (product.shippingRuleIds && product.shippingRuleIds.length > 0);
    }).length;
  }

  return (
    <div className="checkout-debug bg-danger text-white p-3 mb-4" style={{ fontSize: '14px', position: 'sticky', top: '0', zIndex: '1000' }}>
      <h5 className="border-bottom pb-2 mb-3">DIAGNÓSTICO DE ENVÍO</h5>
      
      <div className="row">
        {/* Dirección */}
        <div className="col-md-6 mb-3">
          <h6>🏠 DIRECCIÓN:</h6>
          <div className="bg-dark p-2 rounded">
            {userAddress ? (
              <>
                <div><strong>CP:</strong> {userAddress.zipCode || userAddress.postalCode || 'NO DEFINIDO'}</div>
                <div><strong>Estado:</strong> {userAddress.state || 'NO DEFINIDO'}</div>
                <div><strong>Ciudad:</strong> {userAddress.city || 'NO DEFINIDA'}</div>
              </>
            ) : (
              <div className="text-warning">⚠️ NO HAY DIRECCIÓN DEFINIDA</div>
            )}
          </div>
        </div>
        
        {/* Productos */}
        <div className="col-md-6 mb-3">
          <h6>🛒 PRODUCTOS:</h6>
          <div className="bg-dark p-2 rounded">
            {cart && cart.items ? (
              <>
                <div><strong>Total:</strong> {cart.items.length} items</div>
                <div><strong>Con reglas:</strong> {productsWithRules} de {cart.items.length}</div>
                {productsWithRules === 0 && cart.items.length > 0 && (
                  <div className="bg-warning text-dark p-1 mt-1 rounded">
                    ⚠️ NINGÚN PRODUCTO TIENE REGLAS DE ENVÍO
                  </div>
                )}
              </>
            ) : (
              <div className="text-warning">⚠️ NO HAY PRODUCTOS EN EL CARRITO</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Detalle de productos */}
      {cart && cart.items && cart.items.length > 0 && (
        <>
          <h6 className="mt-2">📦 DETALLE DE PRODUCTOS:</h6>
          <div className="bg-dark p-2 rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {cart.items.map((item, idx) => {
              const product = item.product || item;
              const hasRule = !!product.shippingRuleId || !!(product.shippingRuleIds && product.shippingRuleIds.length > 0);
              
              return (
                <div key={idx} className={`mb-2 p-1 rounded ${hasRule ? 'bg-success bg-opacity-25' : 'bg-danger bg-opacity-25'}`}>
                  <div><strong>{product.name}</strong> ({hasRule ? '✅ Con reglas' : '❌ Sin reglas'})</div>
                  <div className="small">
                    <div><strong>ID:</strong> {product.id}</div>
                    <div><strong>Regla:</strong> {product.shippingRuleId || 'No tiene'}</div>
                    <div><strong>Reglas múltiples:</strong> {(product.shippingRuleIds && product.shippingRuleIds.length > 0) ? 
                      product.shippingRuleIds.join(', ') : 'No tiene'}</div>
                    <div><strong>Peso:</strong> {product.weight || 'No definido'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      
      <div className="mt-3 text-center">
        <button 
          className="btn btn-sm btn-light"
          onClick={() => console.warn('🚨 DATOS COMPLETOS', { cart, userAddress })}
        >
          Mostrar todos los datos en consola
        </button>
      </div>
    </div>
  );
};

CheckoutDebugInfo.propTypes = {
  cart: PropTypes.object,
  userAddress: PropTypes.object
};

export default CheckoutDebugInfo; 