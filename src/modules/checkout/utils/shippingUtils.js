/**
 * Shipping Utilities - Efficient and modular shipping calculation functions
 */

/**
 * Calculate shipping cost based on package details and shipping option
 * @param {number} weight - Total weight of the package in kg
 * @param {number} quantity - Total quantity of items 
 * @param {Object} shippingOption - Selected shipping option with pricing rules
 * @returns {Object} Calculated shipping costs
 */
export const calculateShippingCost = (weight, quantity, shippingOption) => {
  if (!shippingOption) return { totalCost: 0 };
  
  // Extract shipping parameters with safe defaults
  const basePrice = parseFloat(shippingOption.price) || 0;
  const maxWeight = parseFloat(shippingOption.maxPackageWeight) || 20;
  const extraWeightCost = parseFloat(shippingOption.extraWeightCost) || 10;
  const maxProducts = parseInt(shippingOption.maxProductsPerPackage) || 10;
  
  // Calculate required packages based on both weight and quantity constraints
  const packagesByWeight = Math.ceil(weight / maxWeight);
  const packagesByQuantity = Math.ceil(quantity / maxProducts);
  const totalPackages = Math.max(packagesByWeight, packagesByQuantity, 1);
  
  // Calculate base cost for all packages
  const totalBaseCost = basePrice * totalPackages;
  
  // Calculate extra cost for overweight
  let extraCost = 0;
  if (weight > maxWeight * totalPackages) {
    const overweight = weight - (maxWeight * totalPackages);
    extraCost = Math.ceil(overweight) * extraWeightCost;
  }
  
  // Calculate total cost
  const totalCost = totalBaseCost + extraCost;
  
  return {
    baseCost: totalBaseCost,
    extraCost,
    totalCost,
    packages: totalPackages,
    details: {
      maxPackageWeight: maxWeight,
      extraWeightCost,
      maxProductsPerPackage: maxProducts
    }
  };
};

/**
 * Extract and normalize only the necessary shipping options
 * @param {Array} rules - Shipping rules with options
 * @returns {Array} Simplified shipping options
 */
export const extractShippingOptions = (rules) => {
  if (!rules || !Array.isArray(rules) || rules.length === 0) {
    return [];
  }
  
  const options = [];
  
  rules.forEach(rule => {
    if (!rule.opciones_mensajeria || !Array.isArray(rule.opciones_mensajeria)) {
      return;
    }
    
    rule.opciones_mensajeria.forEach((option, index) => {
      // Skip invalid options
      if (!option.nombre || !option.precio) return;
      
      const price = parseFloat(option.precio);
      if (isNaN(price) || price <= 0) return;
      
      // Extract only needed configuration values with defaults
      options.push({
        id: `${rule.id}-${index}`,
        ruleId: rule.id,
        carrier: option.nombre,
        label: option.nombre,
        price,
        tiempo_entrega: option.tiempo_entrega || '3-5 días',
        maxPackageWeight: parseFloat(option.configuracion_paquetes?.peso_maximo_paquete) || 20,
        extraWeightCost: parseFloat(option.configuracion_paquetes?.costo_por_kg_extra) || 10,
        maxProductsPerPackage: parseInt(option.configuracion_paquetes?.maximo_productos_por_paquete) || 10
      });
    });
  });
  
  // Sort by price for better user experience
  return options.sort((a, b) => a.price - b.price);
};

/**
 * Validate an address for shipping
 * @param {Object} address - User address
 * @returns {Object} Validation result with any errors
 */
export const validateShippingAddress = (address) => {
  if (!address) {
    return { valid: false, error: 'Missing address information' };
  }
  
  const errors = {};
  
  // Basic required fields validation
  if (!address.fullName || !address.fullName.trim()) {
    errors.fullName = 'Full name is required';
  }
  
  if (!address.street || !address.street.trim()) {
    errors.street = 'Street address is required';
  }
  
  if (!address.city || !address.city.trim()) {
    errors.city = 'City is required';
  }
  
  if (!address.state) {
    errors.state = 'State is required';
  }
  
  if (!address.zipCode) {
    errors.zipCode = 'Zip/Postal code is required';
  } else if (!/^\d{5}$/.test(address.zipCode)) {
    errors.zipCode = 'Zip/Postal code must be 5 digits';
  }
  
  return { 
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Check if a shipping rule applies to a given address
 * @param {Object} rule - Shipping rule
 * @param {Object} address - User address
 * @returns {boolean} True if rule applies
 */
export const isShippingRuleValidForAddress = (rule, address) => {
  if (!address || !address.zipCode) {
    return false;
  }
  
  if (!rule.zipcodes || rule.zipcodes.length === 0) {
    return true; // Assume national shipping if no zip codes specified
  }
  
  // First check exact zip code match
  if (rule.zipcodes.includes(address.zipCode)) {
    return true;
  }
  
  // Then check zip code ranges
  for (const zipPattern of rule.zipcodes) {
    if (zipPattern.includes('-')) {
      const [min, max] = zipPattern.split('-').map(Number);
      const userZip = Number(address.zipCode);
      
      if (userZip >= min && userZip <= max) {
        return true;
      }
    }
  }
  
  // Check state-level matches (format: "estado_STATECODE")
  const statePattern = `estado_${address.state}`;
  return rule.zipcodes.includes(statePattern);
};

/**
 * Handles any shipping calculation errors
 * @param {Error} error - The error that occurred
 * @param {Object} context - Additional context info
 * @returns {Object} Error information
 */
export const handleShippingError = (error, context = {}) => {
  // Only log errors that need attention
  console.error('Shipping calculation error:', error.message, context);
  
  return {
    error: true,
    message: error.message,
    context,
    timestamp: new Date().toISOString()
  };
}; 