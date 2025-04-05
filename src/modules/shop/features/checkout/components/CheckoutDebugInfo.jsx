import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar información de diagnóstico durante el checkout
 * Útil durante el desarrollo y pruebas
 */
const CheckoutDebugInfo = ({ 
  cart, 
  shippingDetails, 
  shippingGroups = [], 
  shippingRules = [],
  shippingOptions = [],
  selectedShippingOption = null 
}) => {
  if (!cart) return null;
  
  const { 
    subtotal = 0,
    taxes = 0,
    shipping = 0,
    finalTotal = 0,
    isFreeShipping = false
  } = cart;
  
  return (
    <div className="checkout-debug bg-light border rounded p-3 mb-4">
      <h5 className="fw-bold mb-3">Diagnóstico de Checkout</h5>
      
      <div className="mb-3">
        <h6 className="fw-bold">Totales del Carrito:</h6>
        <pre className="bg-white p-2 rounded border mt-2 overflow-auto">
          {JSON.stringify({
            subtotal: subtotal.toFixed(2),
            impuestos: taxes.toFixed(2),
            envío: shipping.toFixed(2),
            total: finalTotal.toFixed(2),
            envío_gratis: isFreeShipping
          }, null, 2)}
        </pre>
      </div>
      
      <hr className="mb-3" />
      
      <div className="mb-3">
        <h6 className="fw-bold">Detalles de Envío:</h6>
        <pre className="bg-white p-2 rounded border mt-2 overflow-auto">
          {JSON.stringify(shippingDetails || {}, null, 2)}
        </pre>
      </div>
      
      <hr className="mb-3" />
      
      <div className="mb-3">
        <h6 className="fw-bold">Grupos de Envío ({shippingGroups.length}):</h6>
        <pre className="bg-white p-2 rounded border mt-2 overflow-auto" style={{ maxHeight: '200px' }}>
          {JSON.stringify(shippingGroups.map(group => ({
            id: group.id,
            nombre: group.name,
            tipo: group.type,
            reglas: (group.rules || []).map(rule => ({
              id: rule.id,
              zona: rule.zona,
              totalOpciones: rule.opciones_mensajeria?.length || 0
            })),
            totalProductos: group.items?.length || 0,
            pesoTotal: group.totalWeight || 0,
            cantidadTotal: group.totalQuantity || 0
          })), null, 2)}
        </pre>
      </div>
      
      <hr className="mb-3" />
      
      <div className="mb-3">
        <h6 className="fw-bold">Reglas de Envío ({shippingRules.length}):</h6>
        <pre className="bg-white p-2 rounded border mt-2 overflow-auto" style={{ maxHeight: '200px' }}>
          {JSON.stringify(shippingRules.map(rule => ({
            id: rule.id,
            zona: rule.zona,
            activo: rule.activo,
            envio_gratis: rule.envio_gratis,
            zipcodes: Array.isArray(rule.zipcodes) ? rule.zipcodes.length : 0,
            opciones: (rule.opciones_mensajeria || []).map(opcion => ({
              nombre: opcion.nombre,
              precio: opcion.precio,
              tiempoEntrega: opcion.tiempo_entrega
            }))
          })), null, 2)}
        </pre>
      </div>
      
      <hr className="mb-3" />
      
      <div className="mb-3">
        <h6 className="fw-bold">Opciones de Envío ({shippingOptions.length}):</h6>
        <pre className="bg-white p-2 rounded border mt-2 overflow-auto" style={{ maxHeight: '200px' }}>
          {JSON.stringify(shippingOptions.map(option => ({
            id: option.id,
            label: option.label,
            carrier: option.carrier,
            costo: option.totalCost || option.calculatedCost,
            esSeleccionada: selectedShippingOption?.id === option.id,
            isFreeShipping: option.isFreeShipping
          })), null, 2)}
        </pre>
      </div>
      
      {selectedShippingOption && (
        <>
          <hr className="mb-3" />
          <div>
            <h6 className="fw-bold">Opción de Envío Seleccionada:</h6>
            <pre className="bg-white p-2 rounded border mt-2 overflow-auto">
              {JSON.stringify({
                id: selectedShippingOption.id,
                etiqueta: selectedShippingOption.label,
                transportista: selectedShippingOption.carrier,
                costoTotal: selectedShippingOption.totalCost || selectedShippingOption.calculatedCost,
                tiempoEstimado: selectedShippingOption.tiempo_entrega || 
                  `${selectedShippingOption.minDays || '?'}-${selectedShippingOption.maxDays || '?'} días`,
                envioGratis: selectedShippingOption.isFreeShipping,
                ruleId: selectedShippingOption.ruleId,
                ruleName: selectedShippingOption.ruleName
              }, null, 2)}
            </pre>
          </div>
        </>
      )}
      
      <hr className="mb-3" />
      
      <div className="mb-3">
        <h6 className="fw-bold">Productos en Carrito:</h6>
        <pre className="bg-white p-2 rounded border mt-2 overflow-auto" style={{ maxHeight: '300px' }}>
          {JSON.stringify(cart.items?.map(item => {
            const product = item.product || item;
            return {
              id: product.id,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              shippingRuleId: product.shippingRuleId,
              shippingRuleIds: product.shippingRuleIds,
              weight: product.weight
            };
          }), null, 2)}
        </pre>
      </div>
      
      <div className="mt-3 p-2 bg-warning text-dark rounded">
        <strong>NOTA:</strong> Si aparecen opciones de envío pero no aparecen grupos,
        es posible que estés usando opciones hardcodeadas en lugar de calcularlas desde Firestore.
      </div>
    </div>
  );
};

CheckoutDebugInfo.propTypes = {
  cart: PropTypes.object,
  shippingDetails: PropTypes.object,
  shippingGroups: PropTypes.array,
  shippingRules: PropTypes.array,
  shippingOptions: PropTypes.array,
  selectedShippingOption: PropTypes.object
};

export default CheckoutDebugInfo; 