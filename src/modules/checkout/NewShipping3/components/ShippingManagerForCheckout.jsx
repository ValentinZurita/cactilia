/**
 * Variante de ShippingManager adaptada específicamente para integración con el checkout
 * Recibe la dirección directamente en lugar de seleccionarla
 */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ShippingOptions } from './ShippingOptions';
import '../styles/ShippingManager.css';

/**
 * Componente para gestionar el envío dentro del checkout
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.cartItems - Ítems del carrito
 * @param {Object} props.selectedAddress - Dirección seleccionada (proporcionada por el checkout)
 * @param {Function} props.onShippingCostChange - Callback cuando cambia el costo de envío
 * @param {Function} props.onShippingValidChange - Callback cuando cambia la validez del envío
 * @param {Function} props.onShippingCoverageChange - Callback cuando cambian los productos cubiertos
 * @returns {JSX.Element} - Componente de gestión de envío para checkout
 */
export const ShippingManagerForCheckout = ({
  cartItems = [],
  selectedAddress,
  onShippingCostChange = () => {},
  onShippingValidChange = () => {},
  onShippingCoverageChange = () => {}
}) => {
  // Usar refs para detectar cambios
  const addressRef = useRef(null);
  const cartItemsRef = useRef([]);
  const forceUpdateRef = useRef(0);
  
  // Detectar cambios en la dirección o elementos del carrito
  useEffect(() => {
    // Si la dirección o los elementos del carrito cambian, actualizar referencias
    const addressChanged = 
      !addressRef.current || 
      (selectedAddress && addressRef.current && selectedAddress.id !== addressRef.current.id);
    
    const cartItemsChanged = 
      JSON.stringify(cartItemsRef.current.map(item => item.id)) !== 
      JSON.stringify(cartItems.map(item => item.id));
    
    if (addressChanged || cartItemsChanged) {
      addressRef.current = selectedAddress;
      cartItemsRef.current = [...cartItems];
      // Incrementar para forzar la actualización en componentes descendientes
      forceUpdateRef.current += 1;
    }
  }, [selectedAddress, cartItems]);

  // Manejar cambios en la opción de envío (ahora puede ser múltiple)
  const handleShippingOptionChange = (shippingData) => {
    if (!shippingData) {
      // Si no hay datos de envío, establecer costo 0
      onShippingCostChange(0);
      // Informar que no hay productos cubiertos
      onShippingCoverageChange({ 
        coveredProductIds: [], 
        unavailableProductIds: cartItems.map(item => (item.product || item).id),
        hasPartialCoverage: false
      });
      return;
    }
    
    // Usar el costo total de todas las opciones seleccionadas
    onShippingCostChange(shippingData.totalCost || 0);
    
    // Pasar información de cobertura al checkout
    if (onShippingCoverageChange) {
      onShippingCoverageChange({
        coveredProductIds: shippingData.coveredProductIds || [],
        unavailableProductIds: shippingData.unavailableProductIds || [],
        hasPartialCoverage: shippingData.isPartial || false
      });
    }
    
    // Opcionalmente, se podría pasar más información al checkout
    console.log('Datos de envío actualizados:', shippingData);
  };

  // Si no hay una dirección seleccionada, mostrar mensaje
  if (!selectedAddress) {
    return (
      <div className="shipping-manager shipping-manager-checkout">
        <div className="shipping-no-address">
          <h3>Selecciona una dirección de envío</h3>
          <p>No se puede calcular envío sin una dirección seleccionada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shipping-manager shipping-manager-checkout">
      <ShippingOptions
        address={selectedAddress}
        cartItems={cartItems}
        onShippingOptionChange={handleShippingOptionChange}
        onShippingValidityChange={onShippingValidChange}
        forceUpdateKey={forceUpdateRef.current}
      />
    </div>
  );
};

ShippingManagerForCheckout.propTypes = {
  cartItems: PropTypes.array,
  selectedAddress: PropTypes.object,
  onShippingCostChange: PropTypes.func,
  onShippingValidChange: PropTypes.func,
  onShippingCoverageChange: PropTypes.func
}; 