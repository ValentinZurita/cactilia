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
 * @param {Function} props.onTotalCostChange - Callback para manejar cambios en el costo total de envío
 * @returns {JSX.Element} - Componente de integración
 */
const NewShippingIntegration = ({ cartItems, address, onShippingSelected, onTotalCostChange }) => {
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
  
  // PARCHE: Nuevo ref para el último costo válido que aún no ha sido procesado
  const pendingCostRef = useRef(null);
  // PARCHE: Flag para indicar si se debería esperar a que llegue la información de cobertura antes de notificar
  const waitingForCoverageRef = useRef(false);
  
  // Función para notificar la opción al padre, centralizada para evitar duplicación
  const notifyOption = useCallback((option) => {
    if (!option) return;
    
    console.log(`🔄 [PARCHE] Notificando opción al padre:`, {
      id: option.id,
      hasPartialCoverage: option.hasPartialCoverage,
      unavailableProductIds: option.unavailableProductIds?.length || 0
    });
    
    setLastGeneratedOption(option);
    
    if (typeof onShippingSelected === 'function') {
      onShippingSelected(option);
    }
  }, [onShippingSelected]);
  
  // Manejar cambios en el costo de envío
  const handleShippingCostChange = useCallback((cost) => {
    // Ensure cost is a valid number, default to 0 if not
    const validCost = typeof cost === 'number' && !isNaN(cost) ? cost : 0;

    // Mostrar advertencia si no hay datos de envío
    if (cost === null || cost === undefined) {
      console.log(`⚠️ [PARCHE] handleShippingCostChange: No hay datos de envío, estableciendo costo a 0`);
      // Notificar solo el cambio de costo total, pero no crear una opción aún
      if (typeof onTotalCostChange === 'function') {
        onTotalCostChange(0);
      }
      return;
    }
    
    // Avoid redundant updates if cost hasn't changed
    if (lastCostRef.current === validCost) {
      console.log(`💲 [NewShippingIntegration] Costo sin cambios ($${validCost}). No se actualiza.`);
      return;
    }
    
    // Update the cost reference
    lastCostRef.current = validCost;
    pendingCostRef.current = validCost;
    
    console.log(`💲 [NewShippingIntegration] Costo de envío actualizado: $${validCost} (tipo: ${typeof validCost})`);

    // Use the onTotalCostChange callback directly
    if (typeof onTotalCostChange === 'function') {
      onTotalCostChange(validCost);
    }

    // PARCHE: Verificar si tenemos información de cobertura válida
    const hasCoverageInfo = coverageInfo.coveredProductIds.length > 0 || 
                           coverageInfo.unavailableProductIds.length > 0;
    
    // Si no tenemos info de cobertura, marcamos que estamos esperando
    if (!hasCoverageInfo && cartItems.length > 0) {
      console.log(`⏳ [PARCHE] Esperando información de cobertura antes de crear la opción...`);
      waitingForCoverageRef.current = true;
      return; // Salimos y esperamos a que llegue la cobertura
    }
    
    // Si tenemos una opción previa, actualizarla
    if (lastGeneratedOption && typeof onShippingSelected === 'function') {
      // Asegurarse de que se mantiene la información de productos no disponibles
      const updatedOption = {
        ...lastGeneratedOption,
        price: validCost,
        totalCost: validCost,
        calculatedCost: validCost,
        isFree: validCost === 0,
        isFreeShipping: validCost === 0,
        coveredProductIds: coverageInfo.coveredProductIds || [],
        unavailableProductIds: coverageInfo.unavailableProductIds || [],
        hasPartialCoverage: coverageInfo.hasPartialCoverage || false,
        allProductsCovered: !(coverageInfo.hasPartialCoverage || false)
      };
      
      console.log(`🔄 [PARCHE] Actualizando opción con productos no disponibles:`, {
        unavailableCount: coverageInfo.unavailableProductIds?.length || 0,
        hasPartialCoverage: coverageInfo.hasPartialCoverage || false
      });
      
      notifyOption(updatedOption);
      waitingForCoverageRef.current = false;
    } else if (typeof onShippingSelected === 'function') {
      // First time receiving cost: Create a minimal option object with coverage info
      const newOption = {
        id: `shipping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'Envío calculado', 
        price: validCost,
        totalCost: validCost,
        calculatedCost: validCost,
        isFree: validCost === 0,
        isFreeShipping: validCost === 0,
        carrierId: 'calculated',
        coveredProductIds: coverageInfo.coveredProductIds || [],
        unavailableProductIds: coverageInfo.unavailableProductIds || [],
        hasPartialCoverage: coverageInfo.hasPartialCoverage || false,
        allProductsCovered: !(coverageInfo.hasPartialCoverage || false)
      };
      
      console.log(`🔰 [PARCHE] Creando nueva opción con datos de cobertura actuales:`, {
        unavailableCount: coverageInfo.unavailableProductIds?.length || 0,
        hasPartialCoverage: coverageInfo.hasPartialCoverage || false,
        coveredCount: coverageInfo.coveredProductIds?.length || 0
      });
      
      notifyOption(newOption);
      waitingForCoverageRef.current = false;
    }
  }, [onShippingSelected, onTotalCostChange, coverageInfo, lastGeneratedOption, cartItems.length, notifyOption]);
  
  // Manejar cambios en la validez del envío
  const handleShippingValidChange = useCallback((isValid) => {
    console.log(`🚢 Envío válido: ${isValid ? 'Sí' : 'No'}`);
  }, []);
  
  // Manejar cambios en la cobertura de envío
  const handleShippingCoverageChange = useCallback((newCoverageInfo) => {
    // Debugging detallado
    console.log(`🔍 [PARCHE] NewShippingIntegration recibió cobertura:`, {
      cubiertos: newCoverageInfo.coveredProductIds?.length || 0,
      noCubiertos: newCoverageInfo.unavailableProductIds?.length || 0,
      hayCoberturaParcial: newCoverageInfo.hasPartialCoverage
    });
    
    // Guardar estado previo para diagnóstico
    const prevCoverage = { ...coverageInfo };
    
    // Actualizar el estado con la nueva información
    setCoverageInfo(newCoverageInfo);
    
    // Si estamos esperando cobertura para crear/actualizar la opción, procesarla ahora
    if (waitingForCoverageRef.current && pendingCostRef.current !== null) {
      console.log(`🔄 [PARCHE] Procesando costo pendiente después de recibir cobertura: $${pendingCostRef.current}`);
      
      // Crear la opción con la cobertura recién recibida
      const validCost = pendingCostRef.current;
      
      // Si hay una opción previa, actualizarla
      if (lastGeneratedOption) {
        const updatedOption = {
          ...lastGeneratedOption,
          price: validCost,
          totalCost: validCost,
          calculatedCost: validCost,
          isFree: validCost === 0,
          isFreeShipping: validCost === 0,
          coveredProductIds: newCoverageInfo.coveredProductIds || [],
          unavailableProductIds: newCoverageInfo.unavailableProductIds || [],
          hasPartialCoverage: newCoverageInfo.hasPartialCoverage || false,
          allProductsCovered: !(newCoverageInfo.hasPartialCoverage || false)
        };
        
        // Notificar la opción actualizada
        setTimeout(() => {
          console.log(`⏰ [PARCHE] Notificando opción actualizada con cobertura recién recibida:`, {
            unavailableCount: newCoverageInfo.unavailableProductIds?.length || 0,
            hasPartialCoverage: newCoverageInfo.hasPartialCoverage || false
          });
          notifyOption(updatedOption);
        }, 0);
      } else {
        // Crear una nueva opción
        const newOption = {
          id: `shipping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'Envío calculado', 
          price: validCost,
          totalCost: validCost,
          calculatedCost: validCost,
          isFree: validCost === 0,
          isFreeShipping: validCost === 0,
          carrierId: 'calculated',
          coveredProductIds: newCoverageInfo.coveredProductIds || [],
          unavailableProductIds: newCoverageInfo.unavailableProductIds || [],
          hasPartialCoverage: newCoverageInfo.hasPartialCoverage || false,
          allProductsCovered: !(newCoverageInfo.hasPartialCoverage || false)
        };
        
        // Notificar la nueva opción
        setTimeout(() => {
          console.log(`⏰ [PARCHE] Notificando nueva opción con cobertura recién recibida:`, {
            unavailableCount: newCoverageInfo.unavailableProductIds?.length || 0,
            hasPartialCoverage: newCoverageInfo.hasPartialCoverage || false
          });
          notifyOption(newOption);
        }, 0);
      }
      
      // Limpiar estado de espera
      waitingForCoverageRef.current = false;
      pendingCostRef.current = null;
    } 
    // Si ya tenemos una opción, actualizar sus datos de cobertura
    else if (lastGeneratedOption) {
      const hasCoverageChanged = 
        prevCoverage.hasPartialCoverage !== newCoverageInfo.hasPartialCoverage ||
        prevCoverage.unavailableProductIds?.length !== newCoverageInfo.unavailableProductIds?.length ||
        prevCoverage.coveredProductIds?.length !== newCoverageInfo.coveredProductIds?.length;
      
      if (hasCoverageChanged) {
        console.log(`🔍 [PARCHE] Detectado cambio en cobertura, actualizando opción:`);
        
        const updatedOption = {
          ...lastGeneratedOption,
          coveredProductIds: newCoverageInfo.coveredProductIds || [],
          unavailableProductIds: newCoverageInfo.unavailableProductIds || [],
          hasPartialCoverage: newCoverageInfo.hasPartialCoverage || false,
          allProductsCovered: !(newCoverageInfo.hasPartialCoverage || false),
          isPartial: newCoverageInfo.hasPartialCoverage || false
        };
        
        setTimeout(() => {
          console.log(`⏰ [PARCHE] Notificando opción con cobertura actualizada:`, {
            unavailableCount: newCoverageInfo.unavailableProductIds?.length || 0,
            hasPartialCoverage: newCoverageInfo.hasPartialCoverage || false
          });
          notifyOption(updatedOption);
        }, 0);
      }
    }
  }, [coverageInfo, lastGeneratedOption, notifyOption]);
  
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
      pendingCostRef.current = null;
      waitingForCoverageRef.current = false;
      setLastGeneratedOption(null); 
      setCoverageInfo({ coveredProductIds: [], unavailableProductIds: [], hasPartialCoverage: false });
      firstLoadRef.current = true; // Allow initial load effect to run again if needed for other logic
    }
    
    // Actualizar la referencia de la dirección
    addressRef.current = address;
  }, [address]);
  
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
  onShippingSelected: PropTypes.func,
  onTotalCostChange: PropTypes.func
};

export default NewShippingIntegration; 