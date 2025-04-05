import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de diagnóstico para la página de checkout
 * Muestra información detallada sobre el estado del checkout
 * 
 * @param {Object} props - Props del componente
 * @param {Object} props.cartInfo - Información del carrito
 * @param {Object} props.checkoutInfo - Información del checkout
 * @returns {JSX.Element}
 */
export const CheckoutDebugInfo = ({ cartInfo, checkoutInfo }) => {
  // Extraer información de envío si está disponible
  const shippingDetails = cartInfo?.shippingDetails || {};
  const shippingGroups = cartInfo?.shippingGroups || [];
  const shippingRules = cartInfo?.shippingRules || [];
  
  return (
    <div className="checkout-debug bg-light border rounded p-3 mb-4">
      <h5 className="border-bottom pb-2 mb-3">Datos Técnicos (Debug)</h5>
      
      <div className="row">
        <div className="col-md-6">
          <h6 className="text-secondary">Información del Carrito</h6>
          <div className="bg-white p-2 rounded border mb-3">
            <p className="m-0"><strong>Productos en carrito:</strong> {cartInfo?.items?.length || 0}</p>
            <p className="m-0"><strong>Cantidad total de items:</strong> {cartInfo?.itemsCount || 0}</p>
            <p className="m-0"><strong>Subtotal:</strong> ${cartInfo?.subtotal?.toFixed(2) || '0.00'}</p>
            <p className="m-0"><strong>Impuestos:</strong> ${cartInfo?.taxes?.toFixed(2) || '0.00'}</p>
            <p className="m-0"><strong>Envío:</strong> ${cartInfo?.shipping?.toFixed(2) || '0.00'}</p>
            <p className="m-0"><strong>Total:</strong> ${cartInfo?.finalTotal?.toFixed(2) || '0.00'}</p>
            <p className="m-0"><strong>Envío gratuito:</strong> {cartInfo?.isFreeShipping ? 'Sí' : 'No'}</p>
            <p className="m-0"><strong>Cargando reglas de envío:</strong> {cartInfo?.isLoadingShipping ? 'Sí' : 'No'}</p>
          </div>
          
          {/* Información de reglas de envío */}
          {shippingRules && shippingRules.length > 0 && (
            <div className="bg-white p-2 rounded border mb-3">
              <h6 className="text-primary mb-2">Reglas de envío ({shippingRules.length})</h6>
              {shippingRules.map((rule, index) => (
                <div key={rule.id || index} className="mb-2 border-bottom pb-2">
                  <p className="m-0"><strong>ID:</strong> {rule.id}</p>
                  <p className="m-0"><strong>Zona:</strong> {rule.zona || 'Sin zona'}</p>
                  {rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0 && (
                    <div className="ps-2 mt-1">
                      <p className="m-0"><strong>Opciones de envío:</strong></p>
                      {rule.opciones_mensajeria.map((option, i) => (
                        <div key={i} className="ps-2 small">
                          <p className="m-0">- {option.nombre}: ${option.precio || '0'}</p>
                          {option.configuracion_paquetes && (
                            <p className="m-0 text-muted">
                              Máx: {option.configuracion_paquetes.peso_maximo_paquete || 20}kg / 
                              {option.configuracion_paquetes.maximo_productos_por_paquete || 10} productos
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Detalles de cálculo de envío */}
          {shippingDetails && (
            <div className="bg-white p-2 rounded border mb-3">
              <h6 className="text-secondary">Detalles de Cálculo de Envío</h6>
              <p className="m-0"><strong>Grupos de envío:</strong> {shippingGroups?.length || 0}</p>
              <p className="m-0"><strong>Costo base total:</strong> ${shippingDetails.baseCost?.toFixed(2) || '0.00'}</p>
              <p className="m-0"><strong>Costo por sobrepeso:</strong> ${shippingDetails.extraWeightCost?.toFixed(2) || '0.00'}</p>
              <p className="m-0"><strong>Costo total envío:</strong> ${shippingDetails.totalCost?.toFixed(2) || '0.00'}</p>
              <p className="m-0 text-danger"><strong>Costo final envío:</strong> ${cartInfo?.shipping?.toFixed(2) || '0.00'} {cartInfo?.isFreeShipping ? '(¡Gratis!)' : ''}</p>
              
              {/* Detalles por grupo */}
              {shippingDetails.groupDetails && shippingDetails.groupDetails.length > 0 && (
                <div className="mt-2">
                  <h6 className="text-secondary">Detalles por Grupo</h6>
                  {shippingDetails.groupDetails.map((group, index) => (
                    <div key={index} className="border-start border-primary ps-2 mb-2">
                      <p className="m-0"><strong>Grupo:</strong> {group.groupName || `Grupo ${index + 1}`}</p>
                      <p className="m-0"><strong>Regla:</strong> {group.ruleName || 'Sin nombre'}</p>
                      <p className="m-0"><strong>Envío:</strong> {group.shippingName || 'Estándar'}</p>
                      <p className="m-0"><strong>Peso:</strong> {group.totalWeight || 0}kg</p>
                      <p className="m-0"><strong>Cantidad:</strong> {group.totalQuantity || 0} unidades</p>
                      <p className="m-0"><strong>Paquetes:</strong> {group.totalPackages || 1}</p>
                      <p className="m-0"><strong>Costo base:</strong> ${group.baseCost?.toFixed(2) || '0.00'}</p>
                      <p className="m-0"><strong>Sobrepeso:</strong> ${group.extraWeightCost?.toFixed(2) || '0.00'}</p>
                      <p className="m-0 fw-bold">Total: ${group.totalCost?.toFixed(2) || '0.00'}</p>
                      
                      {/* Productos en este grupo */}
                      {group.items && group.items.length > 0 && (
                        <div className="ps-2 mt-1 small">
                          <p className="m-0"><strong>Productos ({group.items.length}):</strong></p>
                          <ul className="list-unstyled ps-2 m-0">
                            {group.items.map((item, i) => (
                              <li key={i}>- {item.name} (x{item.quantity})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="col-md-6">
          <h6 className="text-secondary">Información del Checkout</h6>
          <pre className="bg-dark text-light p-2 rounded" style={{fontSize: '0.8rem', maxHeight: '200px', overflow: 'auto'}}>
            {JSON.stringify(checkoutInfo, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-3">
        <button 
          className="btn btn-warning"
          onClick={() => {
            console.warn('DATOS COMPLETOS PARA DEBUGGING:', {
              cart: cartInfo,
              checkout: checkoutInfo,
              shippingGroups,
              shippingRules
            });
            alert('Datos de diagnóstico enviados a la consola');
          }}
        >
          Mostrar Datos en Consola
        </button>
      </div>
    </div>
  );
};

CheckoutDebugInfo.propTypes = {
  cartInfo: PropTypes.object,
  checkoutInfo: PropTypes.object
};

CheckoutDebugInfo.defaultProps = {
  cartInfo: {},
  checkoutInfo: {}
}; 