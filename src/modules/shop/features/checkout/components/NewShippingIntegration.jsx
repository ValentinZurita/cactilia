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
  
  // Manejar cambios en el costo de envío
  const handleShippingCostChange = useCallback((cost) => {
    // Comprobar si el costo ya se ha procesado para evitar actualizaciones múltiples
    if (lastCostRef.current === cost) {
      return;
    }
    
    // Actualizar la referencia del costo
    lastCostRef.current = cost;
    
    console.log(`💲 Costo de envío actualizado: $${cost}`);
    
    // Si hay una opción generada, actualizarla con el nuevo costo
    if (lastGeneratedOption && typeof onShippingSelected === 'function') {
      const updatedOption = {
        ...lastGeneratedOption,
        price: cost,
        totalCost: cost,
        calculatedCost: cost,
        isFree: cost === 0
      };
      
      setLastGeneratedOption(updatedOption);
      onShippingSelected(updatedOption);
    }
  }, [lastGeneratedOption, onShippingSelected]);
  
  // Manejar cambios en la validez del envío
  const handleShippingValidChange = useCallback((isValid) => {
    console.log(`🚢 Envío válido: ${isValid ? 'Sí' : 'No'}`);
  }, []);
  
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
        addressRef.current.id !== address.id) {
      console.log('🔄 Dirección cambiada, reiniciando opciones de envío');
      // Reset del costo para forzar un nuevo cálculo
      lastCostRef.current = null;
      
      // Crear una opción inicial temporal
      const initialOption = createShippingOption([{ 
        rule: { nombre: 'Calculando...', id: 'initial' },
        items: cartItems
      }], 0);
      
      // Actualizar la opción seleccionada
      if (initialOption && typeof onShippingSelected === 'function') {
        setLastGeneratedOption(initialOption);
        onShippingSelected(initialOption);
      }
    }
    
    // Actualizar la referencia de la dirección
    addressRef.current = address;
  }, [address, cartItems, createShippingOption, onShippingSelected]);
  
  // Crear una opción inicial cuando se cargan los datos por primera vez
  useEffect(() => {
    if (cartItems && cartItems.length > 0 && address && 
        typeof onShippingSelected === 'function' && 
        firstLoadRef.current) {
      
      firstLoadRef.current = false;
      
      const initialOption = createShippingOption([{ 
        rule: { nombre: 'Calculando...', id: 'initial' },
        items: cartItems
      }], 0);
      
      if (initialOption) {
        setLastGeneratedOption(initialOption);
        onShippingSelected(initialOption);
      }
    }
  }, [cartItems, address, onShippingSelected, createShippingOption]);
  
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