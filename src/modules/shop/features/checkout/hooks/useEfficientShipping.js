import { useState, useEffect } from 'react';
import { prepareShippingOptions, groupItemsIntoPackages } from '../../../../../modules/checkout/utils/shippingCalculator';
import { validateShippingAddress } from '../../../../../modules/checkout/utils/shippingUtils';
import { getShippingRuleById } from '../../../../admin/services/shippingRuleService';

/**
 * Hook para gestionar las opciones de envío utilizando el sistema mejorado
 * @param {Array} cartItems - Items en el carrito
 * @param {string} selectedAddressId - ID de la dirección seleccionada
 * @returns {Object} - Opciones de envío y funciones relacionadas
 */
export const useEfficientShipping = (cartItems, selectedAddressId) => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [shippingRules, setShippingRules] = useState([]);
  const [userAddress, setUserAddress] = useState(null);
  const [error, setError] = useState(null);
  
  // Get user address based on selected address ID
  useEffect(() => {
    if (!selectedAddressId) {
      setUserAddress(null);
      return;
    }
    
    const getUserAddress = async () => {
      try {
        // Get address from localStorage (in production, this would be from your database)
        const addresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
        const address = addresses.find(addr => addr.id === selectedAddressId);
        
        if (address) {
          setUserAddress(address);
        }
      } catch (error) {
        console.error('Error al obtener dirección:', error);
      }
    };
    
    getUserAddress();
  }, [selectedAddressId]);
  
  // Load shipping rules based on products in cart
  useEffect(() => {
    if (!cartItems?.length) {
      setShippingRules([]);
      setLoading(false);
      return;
    }
    
    const fetchShippingRules = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Get all shipping rule IDs from products
        const shippingRuleIds = new Set();
        
        cartItems.forEach(item => {
          const product = item.product || item;
          
          if (product.shippingRuleId) {
            shippingRuleIds.add(product.shippingRuleId);
          }
          
          if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds)) {
            product.shippingRuleIds.forEach(id => shippingRuleIds.add(id));
          }
        });
        
        // 2. Fetch rules from Firebase
        const rulesToFetch = Array.from(shippingRuleIds);
        
        if (rulesToFetch.length === 0) {
          // No shipping rules found for products
          console.warn('No se encontraron reglas de envío para los productos en el carrito');
          setError('No se encontraron reglas de envío para los productos seleccionados');
          setShippingRules([]);
          setLoading(false);
          return;
        }
        
        // Log the shipping rule IDs we're trying to fetch
        console.log('🚚 Intentando obtener reglas de envío:', rulesToFetch);
        
        const rulesPromises = rulesToFetch.map(id => getShippingRuleById(id));
        const rulesResults = await Promise.all(rulesPromises);
        
        // 3. Filter valid rules
        const validRules = rulesResults
          .filter(result => result.ok && result.data)
          .map(result => result.data);
        
        if (validRules.length === 0) {
          console.warn('No se pudieron obtener reglas de envío válidas');
          setError('No se pudieron obtener reglas de envío válidas para los productos seleccionados');
        }
        
        console.log('✅ Reglas de envío obtenidas:', validRules.length);
        setShippingRules(validRules);
      } catch (error) {
        console.error('Error al obtener reglas de envío:', error);
        setError(`Error al obtener reglas de envío: ${error.message}`);
        setShippingRules([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShippingRules();
  }, [cartItems]);
  
  // Calculate shipping options using our improved shipping utilities
  useEffect(() => {
    if (!shippingRules.length || !cartItems?.length) {
      setOptions([]);
      setLoading(false);
      return;
    }
    
    if (!userAddress) {
      setOptions([]);
      setLoading(false);
      return;
    }
    
    // Validate address first
    const addressValidation = validateShippingAddress(userAddress);
    if (!addressValidation.valid) {
      setOptions([]);
      setLoading(false);
      return;
    }
    
    // Use our improved shipping calculator
    const result = prepareShippingOptions(cartItems, userAddress, shippingRules);
    
    // Check for free shipping threshold
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    
    let freeShippingApplied = false;
    
    // Check if any rule has free shipping
    const freeShippingRule = shippingRules.find(rule => {
      // Check for unconditional free shipping
      if (rule.envio_gratis === true) return true;
      
      // Check for free shipping by minimum amount
      if (rule.envio_gratis_monto_minimo) {
        const minAmount = parseFloat(rule.envio_gratis_monto_minimo);
        if (!isNaN(minAmount) && subtotal >= minAmount) return true;
      }
      
      return false;
    });
    
    // Apply free shipping if needed
    let finalOptions = result.options;
    if (freeShippingRule) {
      freeShippingApplied = true;
      finalOptions = finalOptions.map(option => ({
        ...option,
        calculatedCost: 0,
        totalCost: 0,
        details: `${option.details} · ¡GRATIS!`,
        isFreeShipping: true
      }));
    }
    
    // Format options for the UI
    const formattedOptions = finalOptions.map(option => ({
      id: option.id,
      ruleId: option.ruleId,
      carrier: option.carrier,
      label: option.label,
      calculatedCost: option.totalCost,
      totalCost: option.totalCost,
      tiempo_entrega: option.tiempo_entrega,
      minDays: option.minDays,
      maxDays: option.maxDays,
      packages: option.packages,
      details: option.details,
      isFreeShipping: !!option.isFreeShipping,
      maxPackageWeight: option.maxPackageWeight,
      extraWeightCost: option.extraWeightCost,
      maxProductsPerPackage: option.maxProductsPerPackage,
      totalWeight: result.totalWeight
    }));
    
    // Sort options: free shipping first, then by price
    formattedOptions.sort((a, b) => {
      if (a.isFreeShipping && !b.isFreeShipping) return -1;
      if (!a.isFreeShipping && b.isFreeShipping) return 1;
      return a.totalCost - b.totalCost;
    });
    
    setOptions(formattedOptions);
    
    // Auto-select the cheapest option if none selected
    if (formattedOptions.length > 0 && !selectedOption) {
      setSelectedOption(formattedOptions[0]);
    }
    
    setLoading(false);
  }, [shippingRules, cartItems, userAddress, selectedOption]);
  
  // Function to select a shipping option
  const selectShippingOption = (option) => {
    if (!option) {
      setSelectedOption(null);
      return;
    }
    
    // Create package groups for the selected option
    const packageGroups = groupItemsIntoPackages(cartItems, option);
    
    // Set the selected option with package groups
    setSelectedOption({
      ...option,
      packageGroups
    });
  };
  
  return {
    loading,
    options,
    selectedOption,
    selectShippingOption,
    shippingRules,
    userAddress,
    error
  };
}; 