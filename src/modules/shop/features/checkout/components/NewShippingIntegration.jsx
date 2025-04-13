/**
 * Componente de integración para el nuevo módulo de envío (NewShipping3)
 * Se adapta a la interfaz esperada por el componente de checkout
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../../auth/hooks/useAuth';
import { ShippingManagerForCheckout } from '../../../../checkout/NewShipping3';

/**
 * Componente que integra el nuevo módulo de envío dentro del checkout
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.cartItems - Ítems del carrito
 * @param {Object} props.address - Dirección seleccionada
 * @param {Function} props.onShippingSelected - Callback para manejar la selección de opción de envío
 * @returns {JSX.Element} - Componente de integración
 */
const NewShippingIntegration = ({ cartItems, address, onShippingSelected }) => {
  const { user } = useAuth();
  const [lastGeneratedOption, setLastGeneratedOption] = useState(null);
  const lastCostRef = useRef(null);
  const addressRef = useRef(null);
  const firstLoadRef = useRef(true);
  
  // Estado para mantener información sobre productos cubiertos/no cubiertos
  const [coverageInfo, setCoverageInfo] = useState({
    coveredProductIds: [],
    unavailableProductIds: [],
    hasPartialCoverage: false
  });
  
  // Manejar cambios en el costo de envío
  const handleShippingCostChange = useCallback((cost) => {
    // Ensure cost is a valid number, default to 0 if not
    const validCost = typeof cost === 'number' && !isNaN(cost) ? cost : 0;

    // Avoid redundant updates if cost hasn't changed
    if (lastCostRef.current === validCost && lastGeneratedOption) {
      console.log(`💲 [NewShippingIntegration] Costo sin cambios ($${validCost}). No se actualiza.`);
      return;
    }
    
    // Update the cost reference
    lastCostRef.current = validCost;
    
    console.log(`💲 [NewShippingIntegration] Costo de envío actualizado: $${validCost} (tipo: ${typeof validCost})`);

    // Determine if this is the first valid cost received
    const isFirstCost = !lastGeneratedOption;
    const isFreeValue = validCost === 0;

    // Create or update the option
    let updatedOption;
    if (isFirstCost) {
      // First time receiving cost: Create the option object now using the real cost
      // Assuming ShippingManagerForCheckout provides package details eventually...
      // For now, create a placeholder structure like before but with the correct cost.
      // Ideally, ShippingManagerForCheckout should provide the package/rule details needed here.
      console.log('✨ [NewShippingIntegration] Creando opción inicial con el primer costo real.');
      updatedOption = {
        id: `shipping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'Envío calculado', // Or get name from rule if available
        price: validCost,
        totalCost: validCost,
        calculatedCost: validCost,
        isFree: isFreeValue,
        isFreeShipping: isFreeValue,
        carrierId: 'calculated',
        carrierName: '',
        deliveryTime: '', // Should be updated later if possible
        description: '',
        packages: [], // Should be populated if possible
        allProductsCovered: !coverageInfo.hasPartialCoverage, // Use current coverage info
        zoneName: 'Envío calculado',
        coveredProductIds: coverageInfo.coveredProductIds,
        unavailableProductIds: coverageInfo.unavailableProductIds,
        hasPartialCoverage: coverageInfo.hasPartialCoverage
      };
    } else {
      // Subsequent cost update: Update the existing option
      console.log('🔄 [NewShippingIntegration] Actualizando opción existente con nuevo costo.');
      updatedOption = {
        ...lastGeneratedOption,
        price: validCost,
        totalCost: validCost,
        calculatedCost: validCost,
        isFree: isFreeValue,
        isFreeShipping: isFreeValue,
        // Ensure coverage info is also up-to-date
        coveredProductIds: coverageInfo.coveredProductIds,
        unavailableProductIds: coverageInfo.unavailableProductIds,
        hasPartialCoverage: coverageInfo.hasPartialCoverage,
        allProductsCovered: !coverageInfo.hasPartialCoverage
      };
    }

    console.log('📊 [NewShippingIntegration] Opción para enviar a CheckoutContent:', {
      id: updatedOption.id,
      cost: updatedOption.totalCost,
      isFree: updatedOption.isFree,
      isFreeShipping: updatedOption.isFreeShipping
    });
    
    // Store the updated option locally
    setLastGeneratedOption(updatedOption);
    
    // Call the parent callback ONLY if it's a function
    if (typeof onShippingSelected === 'function') {
        onShippingSelected(updatedOption);
    } else {
        console.error('❌ [NewShippingIntegration] onShippingSelected no es una función!')
    }

  }, [onShippingSelected, coverageInfo, lastGeneratedOption]); // Added lastGeneratedOption dependency
  
  // Manejar cambios en la validez del envío
  const handleShippingValidChange = useCallback((isValid) => {
    console.log(`🚢 Envío válido: ${isValid ? 'Sí' : 'No'}`);
  }, []);
  
  // Manejar cambios en la cobertura de envío
  const handleShippingCoverageChange = useCallback((newCoverageInfo) => {
    console.log(`📦 Cobertura de productos actualizada:`, newCoverageInfo);
    
    // Actualizar el estado local con la nueva información de cobertura
    setCoverageInfo(newCoverageInfo);
    
    // Si hay una opción generada, actualizarla con la nueva información de cobertura
    if (lastGeneratedOption && typeof onShippingSelected === 'function') {
      const updatedOption = {
        ...lastGeneratedOption,
        coveredProductIds: newCoverageInfo.coveredProductIds,
        unavailableProductIds: newCoverageInfo.unavailableProductIds,
        hasPartialCoverage: newCoverageInfo.hasPartialCoverage,
        allProductsCovered: !newCoverageInfo.hasPartialCoverage,
        isFreeShipping: lastGeneratedOption.isFree || lastGeneratedOption.price === 0 || lastGeneratedOption.totalCost === 0
      };
      
      setLastGeneratedOption(updatedOption);
      onShippingSelected(updatedOption);
    }
  }, [lastGeneratedOption, onShippingSelected]);
  
  /**
   * Transformar un paquete a una opción de envío para que sea compatible con la interfaz esperada por el checkout
   * @param {Array} packages - Paquetes de envío generados por nuestro módulo
   * @param {number} totalCost - Costo total del envío
   * @returns {Object} - Opción de envío compatible con el checkout
   */
  const createShippingOption = useCallback((packages, totalCost) => {
    if (!packages || !packages.length) return null;
    
    // Generar un ID único basado en las propiedades de los paquetes
    const uniqueId = `shipping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Obtener información de la regla principal para los metadatos
    const mainPackage = packages[0];
    const rule = mainPackage?.rule || {};
    
    const option = {
      id: uniqueId,
      name: rule.nombre || 'Envío estándar',
      price: totalCost,
      totalCost: totalCost,
      calculatedCost: totalCost,
      isFree: totalCost === 0,
      carrierId: rule.id || uniqueId,
      carrierName: rule.carrier || '',
      deliveryTime: rule.minDays && rule.maxDays 
        ? `${rule.minDays}-${rule.maxDays} días hábiles` 
        : 'Tiempo de entrega variable',
      description: rule.descripcion || '',
      packages: packages,
      allProductsCovered: true, // Nuestro módulo ya filtra productos no enviables
      zoneName: rule.zona || 'Envío estándar'
    };
    
    return option;
  }, []);
  
  // Detectar cambios en la dirección
  useEffect(() => {
    // Comprobar si la dirección ha cambiado
    if (address && addressRef.current && 
        (addressRef.current.id !== address.id || 
         addressRef.current.zip !== address.zip || 
         addressRef.current.zipcode !== address.zipcode)) {
      console.log('🔄 Dirección cambiada, reiniciando estado de envío en NewShippingIntegration');
      // Reset local state, cost ref, and generated option
      lastCostRef.current = null;
      setLastGeneratedOption(null); 
      setCoverageInfo({ coveredProductIds: [], unavailableProductIds: [], hasPartialCoverage: false });
      firstLoadRef.current = true; // Allow initial load effect to run again if needed for other logic
      
      // DO NOT call onShippingSelected here with a temporary option
      // console.log('🚫 [NewShippingIntegration] No se llama a onShippingSelected al cambiar dirección.');
    }
    
    // Actualizar la referencia de la dirección
    addressRef.current = address;
  }, [address]); // Removed dependencies that might trigger unnecessarily
  
  // Crear una opción inicial cuando se cargan los datos por primera vez
  useEffect(() => {
    // This effect might not be strictly necessary anymore if handleShippingCostChange creates the first option.
    // Keep it for potential future logic, but ensure it doesn't call onShippingSelected prematurely.
    if (cartItems && cartItems.length > 0 && address && firstLoadRef.current) {
      console.log('🚀 [NewShippingIntegration] Carga inicial detectada (Address y CartItems disponibles).');
      firstLoadRef.current = false;
      // DO NOT call onShippingSelected here.
      // Let handleShippingCostChange handle the first selection.
    }
  }, [cartItems, address]); // Removed dependencies
  
  // Si no hay dirección válida, mostrar mensaje
  if (!address) {
    return (
      <div className="new-shipping-integration">
        <p>Seleccione una dirección de envío para ver las opciones disponibles.</p>
      </div>
    );
  }
  
  return (
    <div className="new-shipping-integration">
      <ShippingManagerForCheckout 
        cartItems={cartItems}
        selectedAddress={address}
        onShippingCostChange={handleShippingCostChange}
        onShippingValidChange={handleShippingValidChange}
        onShippingCoverageChange={handleShippingCoverageChange}
      />
    </div>
  );
};

NewShippingIntegration.propTypes = {
  cartItems: PropTypes.array.isRequired,
  address: PropTypes.object,
  onShippingSelected: PropTypes.func
};

export default NewShippingIntegration; 