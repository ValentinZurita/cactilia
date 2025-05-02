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
  selectedShippingOption = null,
  excludedProducts = []
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
        {shippingGroups.length > 0 && shippingOptions.length === 0 && (
          <div className="alert alert-info py-2 px-3 mb-2">
            ℹ️ Hay grupos de envío disponibles pero no se han calculado opciones concretas.
            <br />
            <strong>Causa probable:</strong> No hay dirección seleccionada o es necesario seleccionar una dirección con código postal válido.
          </div>
        )}
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
        {shippingGroups.length > 0 && shippingOptions.length === 0 && (
          <div className="alert alert-warning py-2 px-3 mb-2">
            ⚠️ No hay opciones de envío calculadas a pesar de tener reglas de envío.
            <br />
            <strong>Para calcular opciones:</strong> Es necesario seleccionar una dirección de envío con código postal válido.
          </div>
        )}
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
      
      {excludedProducts.length > 0 && (
        <>
          <hr className="mb-3" />
          <div className="mb-3">
            <h6 className="fw-bold">Productos Excluidos del Envío ({excludedProducts.length}):</h6>
            <div className="alert alert-warning text-dark py-2 px-3 mb-2">
              ⚠️ Estos productos no tienen reglas de envío asignadas o sus reglas no son válidas.
            </div>
            <pre className="bg-white p-2 rounded border mt-2 overflow-auto" style={{ maxHeight: '200px' }}>
              {JSON.stringify(excludedProducts.map(product => ({
                id: product.id,
                nombre: product.name,
                precio: product.price,
                cantidad: product.quantity || 1,
                shippingRuleId: product.shippingRuleId,
                shippingRuleIds: product.shippingRuleIds
              })), null, 2)}
            </pre>
          </div>
        </>
      )}
      
      <div className="mt-3 p-2 bg-warning text-dark rounded">
        <strong>NOTA:</strong> Si aparecen opciones de envío pero no aparecen grupos,
        es posible que estés usando opciones hardcodeadas en lugar de calcularlas desde Firestore.
      </div>

      {shippingGroups.length > 0 && shippingOptions.length === 0 && (
        <div className="mt-3 p-2 bg-info text-dark rounded">
          <strong>INFORMACIÓN DEL PROCESO:</strong> 
          <ul className="mb-0 mt-1">
            <li>Las reglas y grupos de envío se cargan correctamente desde Firestore.</li>
            <li>Para calcular las opciones concretas de envío, se necesita seleccionar una dirección de envío.</li>
            <li>Verifica que la dirección seleccionada tenga un código postal (zipCode) válido.</li>
          </ul>
        </div>
      )}
    </div>
  );
};

CheckoutDebugInfo.propTypes = {
  cart: PropTypes.object,
  shippingDetails: PropTypes.object,
  shippingGroups: PropTypes.array,
  shippingRules: PropTypes.array,
  shippingOptions: PropTypes.array,
  selectedShippingOption: PropTypes.object,
  excludedProducts: PropTypes.array
};

export default CheckoutDebugInfo; 