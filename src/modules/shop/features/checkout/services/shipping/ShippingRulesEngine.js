/**
 * Shipping Rules Engine
 *
 * This file implements a shipping rules algorithm that:
 * 1. Filters applicable rules by product location
 * 2. Generates all valid product-to-rule assignments
 * 3. Groups products by rule and checks constraints
 * 4. Evaluates all assignments to find optimal shipping options
 */

/**
 * Determines if a shipping rule's coverage matches the given address
 * @param {Object} rule - The shipping rule with coverage information
 * @param {Object} address - User's address with zip, state, etc.
 * @returns {boolean} - True if the rule applies to the address
 */
export const coverageMatches = (rule, address) => {
  if (!rule || !address) return false;

  // Extract coverage type and values
  const coverageType = rule.coverage_type || '';
  const coverageValues = rule.coverage_values || [];
  
  // Coverage by postal code
  if (coverageType === 'por_codigo_postal' && address.zip) {
    return coverageValues.includes(address.zip);
  }
  
  // Coverage by state
  if (coverageType === 'por_estado' && address.state) {
    return coverageValues.includes(address.state);
  }
  
  // National coverage (applies to all addresses)
  if (coverageType === 'nacional') {
    return true;
  }
  
  // Alternative fields that might be used in the DB schema
  if (rule.cobertura_cp && Array.isArray(rule.cobertura_cp) && address.zip) {
    return rule.cobertura_cp.includes(address.zip);
  }
  
  if (rule.cobertura_estados && Array.isArray(rule.cobertura_estados) && address.state) {
    return rule.cobertura_estados.includes(address.state);
  }
  
  return false;
};

/**
 * Filters valid shipping rules for each product based on address coverage
 * @param {Array} cartItems - Cart items with products
 * @param {Object} address - User's address
 * @param {Object} allRules - Map of all shipping rules (id -> rule)
 * @returns {Object} - Map of valid rules per product: { productId: [ruleId1, ruleId2, ...] }
 */
export const filterValidRulesPerProduct = (cartItems, address, allRules) => {
  if (!cartItems || !address || !allRules) {
    return {};
  }
  
  const validRulesByProduct = {};
  
  // Process each product in the cart
  for (const item of cartItems) {
    const product = item.product || item;
    const productId = product.id;
    
    // Get all potential rule IDs assigned to this product
    const potentialRuleIds = product.shippingRuleIds || [];
    if (!potentialRuleIds.length) {
      console.warn(`Product ${productId} has no shipping rules assigned`);
      continue;
    }
    
    // Filter rules that match the coverage criteria for the address
    const validRules = [];
    
    for (const ruleId of potentialRuleIds) {
      const rule = allRules[ruleId];
      if (!rule) {
        console.warn(`Rule ${ruleId} not found in database`);
        continue;
      }
      
      if (coverageMatches(rule, address)) {
        validRules.push(ruleId);
      }
    }
    
    // Store valid rules for this product
    validRulesByProduct[productId] = validRules;
    
    // Debugging output
    console.log(`Product ${productId}: Found ${validRules.length} valid shipping rules`);
  }
  
  return validRulesByProduct;
};

/**
 * Generates all possible combinations of product to shipping rule assignments
 * @param {Object} validRulesByProduct - Map of valid rules per product
 * @returns {Array} - Array of assignment combinations, each an object mapping productId -> ruleId
 */
export const generateCombinations = (validRulesByProduct) => {
  // Extract product IDs that have at least one valid rule
  const productIds = Object.keys(validRulesByProduct)
    .filter(productId => validRulesByProduct[productId]?.length > 0);
  
  // If no products with valid rules, return empty array
  if (productIds.length === 0) {
    return [];
  }
  
  // Recursive function to generate all combinations
  const generateCombinationsRecursive = (index = 0, currentAssignment = {}) => {
    // Base case: if we've processed all products, return the current assignment
    if (index === productIds.length) {
      return [{ ...currentAssignment }];
    }
    
    const productId = productIds[index];
    const validRules = validRulesByProduct[productId];
    const combinations = [];
    
    // For each valid rule for this product, extend the current assignment
    for (const ruleId of validRules) {
      // Create new assignment with this product -> rule mapping
      const newAssignment = {
        ...currentAssignment,
        [productId]: ruleId
      };
      
      // Continue generating combinations for remaining products
      const nextCombinations = generateCombinationsRecursive(index + 1, newAssignment);
      combinations.push(...nextCombinations);
    }
    
    return combinations;
  };
  
  // Start the recursive combination generation
  return generateCombinationsRecursive();
};

/**
 * Groups products by shipping rule in a given assignment
 * @param {Object} assignment - An assignment of product -> ruleId
 * @param {Array} cartItems - Cart items to group
 * @returns {Object} - Groups of products by rule: { ruleId: [products] }
 */
export const groupByRule = (assignment, cartItems) => {
  const groups = {};
  
  // Create a quick lookup map for cart items
  const itemMap = {};
  cartItems.forEach(item => {
    const product = item.product || item;
    itemMap[product.id] = item;
  });
  
  // Group products by the rule they're assigned to
  Object.entries(assignment).forEach(([productId, ruleId]) => {
    if (!groups[ruleId]) {
      groups[ruleId] = [];
    }
    
    // Add the full cart item to the group
    const item = itemMap[productId];
    if (item) {
      groups[ruleId].push(item);
    }
  });
  
  return groups;
};

/**
 * Partitions products into subpackages if they exceed rule constraints
 * @param {Array} products - Products to partition
 * @param {Object} ruleData - Shipping rule data with constraints
 * @param {Object} productsData - Additional product data (weights, etc.)
 * @returns {Array|null} - Array of subpackages or null if not possible
 */
export const partitionIntoSubpackages = (products, ruleData, productsData) => {
  // Check if partitioning is needed
  const maxProductsPerPackage = ruleData.maximo_productos_por_paquete || Number.MAX_SAFE_INTEGER;
  const maxPackageWeight = ruleData.peso_maximo_paquete || Number.MAX_SAFE_INTEGER;
  
  // If no constraints or few products, just return a single package
  if (products.length <= maxProductsPerPackage && !ruleData.peso_maximo_paquete) {
    return [products];
  }
  
  // Calculate product weights if needed
  let needWeightCheck = !!ruleData.peso_maximo_paquete;
  
  // Simple partitioning by count
  if (!needWeightCheck) {
    const subpackages = [];
    for (let i = 0; i < products.length; i += maxProductsPerPackage) {
      subpackages.push(products.slice(i, i + maxProductsPerPackage));
    }
    return subpackages;
  }
  
  // More complex partitioning considering both count and weight
  const subpackages = [];
  let currentPackage = [];
  let currentWeight = 0;
  let currentCount = 0;
  
  // Sort products by weight (descending) to optimize packing
  const sortedProducts = [...products].sort((a, b) => {
    const productA = a.product || a;
    const productB = b.product || b;
    const weightA = productA.weight || 0;
    const weightB = productB.weight || 0;
    return weightB - weightA;
  });
  
  for (const item of sortedProducts) {
    const product = item.product || item;
    const weight = product.weight || 0;
    
    // If adding this product would exceed constraints, start a new package
    if (currentCount >= maxProductsPerPackage || (currentWeight + weight > maxPackageWeight)) {
      if (currentPackage.length > 0) {
        subpackages.push([...currentPackage]);
        currentPackage = [];
        currentWeight = 0;
        currentCount = 0;
      }
    }
    
    // Add product to current package
    currentPackage.push(item);
    currentWeight += weight;
    currentCount += 1;
  }
  
  // Don't forget the last package
  if (currentPackage.length > 0) {
    subpackages.push(currentPackage);
  }
  
  return subpackages.length > 0 ? subpackages : null;
};

/**
 * Calculates shipping cost for a group of products under a rule
 * @param {Object} rule - Shipping rule data
 * @param {Array} products - Products in the group
 * @param {Object} productsData - Additional product data
 * @returns {Object} - Cost information and validity
 */
export const calculateShippingCost = (rule, products, productsData) => {
  if (!rule || !products || products.length === 0) {
    return { cost: null, valid: false };
  }
  
  try {
    // Partition products into subpackages if needed
    const subpackages = partitionIntoSubpackages(products, rule, productsData);
    
    // If partitioning failed, the rule is invalid for these products
    if (!subpackages) {
      return { cost: null, valid: false, reason: 'Could not partition products within constraints' };
    }
    
    // Calculate subtotal for free shipping check
    const subtotal = products.reduce((sum, item) => {
      const product = item.product || item;
      const price = parseFloat(product.price || 0);
      const quantity = parseInt(item.quantity || 1);
      return sum + (price * quantity);
    }, 0);
    
    // Check if free shipping applies
    const freeShippingMinimum = parseFloat(rule.envio_gratis_monto_minimo || 0);
    let isFreeShipping = rule.envio_gratis === true;
    
    // Check minimum amount for free shipping
    if (!isFreeShipping && freeShippingMinimum > 0 && subtotal >= freeShippingMinimum) {
      isFreeShipping = true;
    }
    
    if (isFreeShipping) {
      return { 
        cost: 0, 
        valid: true, 
        isFree: true, 
        subpackages,
        freeReason: `Envío gratuito ${freeShippingMinimum > 0 ? `para compras mayores a $${freeShippingMinimum}` : ''}` 
      };
    }
    
    // Calculate costs for each subpackage
    let totalCost = 0;
    const packageDetails = [];
    
    // Process each subpackage
    subpackages.forEach((subpackage, index) => {
      let packageCost = 0;
      
      // Get shipping options for this rule
      const shippingOptions = rule.opciones_mensajeria || [];
      
      // If there are shipping options, use the first one as default
      if (shippingOptions.length > 0) {
        const option = shippingOptions[0]; // Base option
        packageCost = parseFloat(option.precio || 0);
        
        // Calculate extra costs
        const productCount = subpackage.length;
        const extraProducts = Math.max(0, productCount - 1); // First product included in base price
        
        if (rule.costo_por_producto_extra && extraProducts > 0) {
          const extraCost = extraProducts * parseFloat(rule.costo_por_producto_extra);
          packageCost += extraCost;
        }
        
        // Calculate weight-based costs if applicable
        if (option.configuracion_paquetes?.costo_por_kg_extra) {
          const totalWeight = subpackage.reduce((sum, item) => {
            const product = item.product || item;
            const weight = parseFloat(product.weight || 0);
            const quantity = parseInt(item.quantity || 1);
            return sum + (weight * quantity);
          }, 0);
          
          const baseWeight = parseFloat(option.peso_base || 0);
          const extraWeight = Math.max(0, totalWeight - baseWeight);
          
          if (extraWeight > 0) {
            const extraWeightCost = extraWeight * parseFloat(option.configuracion_paquetes.costo_por_kg_extra);
            packageCost += extraWeightCost;
          }
        }
      } else {
        // If no shipping options, use rule-level configuration
        packageCost = parseFloat(rule.precio_base || 0);
        
        // Add product-based extra costs
        const productCount = subpackage.length;
        const extraProducts = Math.max(0, productCount - 1); // First product included in base price
        
        if (rule.costo_por_producto_extra && extraProducts > 0) {
          const extraCost = extraProducts * parseFloat(rule.costo_por_producto_extra);
          packageCost += extraCost;
        }
      }
      
      // Add this package's cost to total
      totalCost += packageCost;
      
      // Store package details
      packageDetails.push({
        index,
        products: subpackage,
        productCount: subpackage.length,
        cost: packageCost
      });
    });
    
    return {
      cost: totalCost,
      valid: true,
      isFree: isFreeShipping,
      subpackages,
      packageDetails
    };
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    return { cost: null, valid: false, error: error.message };
  }
};

/**
 * Evaluates all possible assignments and ranks them
 * @param {Array} assignments - All possible product -> rule assignments
 * @param {Array} cartItems - Cart items
 * @param {Object} allRules - Map of all shipping rules
 * @returns {Array} - Ranked shipping options
 */
export const evaluateAssignments = (assignments, cartItems, allRules) => {
  if (!assignments || assignments.length === 0) {
    return [];
  }
  
  const results = [];
  
  // Process each assignment
  assignments.forEach((assignment, index) => {
    // Group products by rule
    const groups = groupByRule(assignment, cartItems);
    
    // Calculate cost for each group and check validity
    const groupDetails = [];
    let totalCost = 0;
    let isValid = true;
    
    for (const [ruleId, products] of Object.entries(groups)) {
      const rule = allRules[ruleId];
      
      // Skip if rule not found
      if (!rule) {
        isValid = false;
        break;
      }
      
      // Calculate shipping cost for this group
      const costResult = calculateShippingCost(rule, products, {});
      
      // If invalid, mark the entire assignment as invalid
      if (!costResult.valid) {
        isValid = false;
        break;
      }
      
      // Add to total cost
      totalCost += costResult.cost;
      
      // Save group details
      groupDetails.push({
        ruleId,
        rule,
        products,
        cost: costResult.cost,
        isFree: costResult.isFree,
        freeReason: costResult.freeReason,
        subpackages: costResult.subpackages,
        packageDetails: costResult.packageDetails
      });
    }
    
    // Only add valid assignments to results
    if (isValid) {
      // Count unique products covered by this assignment
      const coveredProductIds = new Set();
      Object.values(groups).flat().forEach(item => {
        const product = item.product || item;
        coveredProductIds.add(product.id);
      });
      
      // Calculate coverage percentage
      const totalUniqueProducts = new Set(cartItems.map(item => (item.product || item).id)).size;
      const coveragePercentage = (coveredProductIds.size / totalUniqueProducts) * 100;
      
      results.push({
        assignment,
        groupDetails,
        totalCost,
        productCount: coveredProductIds.size,
        coveragePercentage,
        allProductsCovered: coveredProductIds.size === totalUniqueProducts
      });
    }
  });
  
  // Sort results by: complete coverage first, then lowest cost
  return results.sort((a, b) => {
    // Complete coverage takes precedence
    if (a.allProductsCovered && !b.allProductsCovered) return -1;
    if (!a.allProductsCovered && b.allProductsCovered) return 1;
    
    // If both have same coverage status, sort by cost
    return a.totalCost - b.totalCost;
  });
};

/**
 * Main function to find the best shipping options
 * @param {Array} cartItems - Items in the cart
 * @param {Object} address - User's address
 * @param {Array|Object} shippingRules - All available shipping rules
 * @returns {Array} - Best shipping options for the cart
 */
export const findBestShippingOptions = async (cartItems, address, shippingRules) => {
  // 1. Convert rules array to map for easier lookup
  const rulesMap = {};
  
  if (Array.isArray(shippingRules)) {
    shippingRules.forEach(rule => {
      rulesMap[rule.id] = rule;
    });
  } else if (typeof shippingRules === 'object') {
    Object.assign(rulesMap, shippingRules);
  }
  
  // 2. Filter valid rules for each product
  const validRulesByProduct = filterValidRulesPerProduct(cartItems, address, rulesMap);
  
  // Check if any product has no valid rules
  const productsWithNoRules = Object.keys(validRulesByProduct)
    .filter(productId => !validRulesByProduct[productId] || validRulesByProduct[productId].length === 0);
  
  if (productsWithNoRules.length > 0) {
    console.error(`Error: ${productsWithNoRules.length} products have no valid shipping rules:`, productsWithNoRules);
    return {
      success: false,
      error: 'Some products cannot be shipped to this address',
      affectedProducts: productsWithNoRules
    };
  }
  
  // 3. Generate all possible assignments
  const allAssignments = generateCombinations(validRulesByProduct);
  console.log(`Generated ${allAssignments.length} possible shipping assignments`);
  
  // 4. Evaluate and rank all assignments
  const evaluatedOptions = evaluateAssignments(allAssignments, cartItems, rulesMap);
  console.log(`Found ${evaluatedOptions.length} valid shipping options`);
  
  // 5. Format the results for display
  const formattedOptions = formatOptionsForDisplay(evaluatedOptions, cartItems, rulesMap);
  
  return {
    success: true,
    options: formattedOptions,
    totalOptions: formattedOptions.length
  };
};

/**
 * Formats evaluated shipping options for display in the UI
 * @param {Array} evaluatedOptions - Evaluated shipping assignments
 * @param {Array} cartItems - Cart items
 * @param {Object} rulesMap - Map of all shipping rules
 * @returns {Array} - UI-friendly shipping options
 */
export const formatOptionsForDisplay = (evaluatedOptions, cartItems, rulesMap) => {
  // Top 5 options should be enough
  const topOptions = evaluatedOptions.slice(0, 5);
  
  return topOptions.map(option => {
    // Generate a unique ID for this option
    const optionId = `shipping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract carrier info from first group
    const firstGroup = option.groupDetails[0];
    const rule = firstGroup?.rule || {};
    const firstOption = (rule.opciones_mensajeria || [])[0] || {};
    
    // Calculate delivery time range across all groups
    let minDays = Number.MAX_SAFE_INTEGER;
    let maxDays = 0;
    
    option.groupDetails.forEach(group => {
      const rule = group.rule;
      const options = rule.opciones_mensajeria || [];
      
      options.forEach(opt => {
        if (opt.minDays && opt.minDays < minDays) {
          minDays = opt.minDays;
        }
        if (opt.maxDays && opt.maxDays > maxDays) {
          maxDays = opt.maxDays;
        }
      });
    });
    
    // If no min/max days found, use default values
    if (minDays === Number.MAX_SAFE_INTEGER) minDays = 3;
    if (maxDays === 0) maxDays = 7;
    
    // Count packages
    const totalPackages = option.groupDetails.reduce((count, group) => {
      return count + (group.subpackages?.length || 1);
    }, 0);
    
    // Format the option for display
    return {
      id: optionId,
      name: totalPackages > 1 ? 'Envío Combinado' : (firstOption.nombre || rule.zona || 'Opción de envío'),
      carrier: firstOption.nombre || 'Servicio de envío',
      price: option.totalCost,
      minDays,
      maxDays,
      isFree: option.totalCost === 0,
      description: `${totalPackages > 1 ? `${totalPackages} paquetes - ` : ''}Entrega en ${minDays}-${maxDays} días`,
      combination: {
        isComplete: option.allProductsCovered,
        options: option.groupDetails.map(group => {
          const rule = group.rule;
          const shippingOption = (rule.opciones_mensajeria || [])[0] || {};
          
          return {
            zoneType: rule.zona || rule.coverage_type || '',
            zoneName: rule.nombre || rule.zona || '',
            carrierName: shippingOption.nombre || 'Servicio de envío',
            carrierLabel: shippingOption.label || 'Estándar',
            price: group.cost,
            isFree: group.isFree,
            minDays: shippingOption.minDays || 3,
            maxDays: shippingOption.maxDays || 7,
            products: group.products
          };
        })
      },
      allProductsCovered: option.allProductsCovered,
      coversAllProducts: option.allProductsCovered,
      multiPackage: totalPackages > 1,
      packageCount: totalPackages
    };
  });
}; 