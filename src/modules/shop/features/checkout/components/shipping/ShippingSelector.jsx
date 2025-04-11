import React, { useState } from 'react';
import ShippingGroupSelector from './ShippingGroupSelector';
import './ShippingSelector.css';
import { allProductsCovered } from '../../services/shipping/RuleService';

/**
 * Adapter component for shipping selection
 * Handles selection state and validation
 */
const ShippingSelector = ({ 
  cartItems, 
  onOptionSelect, 
  selectedOptionId,
  userAddress,
  onCombinationsCalculated,
  shippingOptions = []
}) => {
  // State for incomplete shipping warning
  const [incompleteShipping, setIncompleteShipping] = useState(false);
  
  // Callback for option selection
  const handleOptionSelect = (option) => {
    // Determine if the selected option covers all products
    let isComplete = false;
    
    // For options from our new service with combination property
    if (option && option.combination?.isComplete) {
      isComplete = true;
    }
    // For options from original system with ruleId
    else if (option && option.ruleId) {
      // Check if this rule can handle all products
      const rulesInCart = new Set();
      cartItems.forEach(item => {
        const product = item.product || item;
        // If a product has a single shipping rule and it matches our option's rule, it's covered
        if (product.shippingRuleId === option.ruleId) {
          rulesInCart.add(product.id);
        }
        // If a product has multiple shipping rules and one matches our option's rule, it's covered
        else if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds)) {
          if (product.shippingRuleIds.includes(option.ruleId)) {
            rulesInCart.add(product.id);
          }
        }
      });
      
      // If all products are covered, set isComplete to true
      isComplete = rulesInCart.size === cartItems.length;
      console.log(`👁️ Opción ${option.id}: cubre ${rulesInCart.size}/${cartItems.length} productos`);
    }
    // For options with explicit coversAllProducts flag
    else if (option && option.coversAllProducts) {
      isComplete = true;
    }
    
    setIncompleteShipping(!isComplete);
    console.log(`👁️ Opción ${option.id || option.optionId}: ${isComplete ? '✅ cubre todos los productos' : '❌ NO cubre todos los productos'}`);
    
    // Add coverage information to the option
    const optionWithCoverage = {
      ...option,
      coversAllProducts: isComplete
    };
    
    // Call the original callback
    if (onOptionSelect) {
      onOptionSelect(optionWithCoverage);
    }
  };
  
  return (
    <>
      <ShippingGroupSelector
        cartItems={cartItems}
        onOptionSelect={handleOptionSelect}
        selectedOptionId={selectedOptionId}
        userAddress={userAddress}
        shippingOptions={shippingOptions}
      />
      
      {incompleteShipping && (
        <div className="shipping-incomplete-warning">
          <strong>Envío incompleto:</strong> La opción seleccionada no cubre todos los productos de tu carrito.
          Por favor, seleccione una combinación que incluya todos los productos para continuar.
        </div>
      )}
    </>
  );
};

export default ShippingSelector; 