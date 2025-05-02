/**
 * Service for handling shipping rules and product grouping
 */

/**
 * Extrae los IDs de reglas de envío de un producto
 * @param {Object} product - Producto
 * @returns {Array} - Array de IDs de reglas
 */
export const extractRuleIds = (product) => {
  if (!product) return [];
  
  let ruleIds = [];
  
  // Check for shipping rule IDs in array format
  if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0) {
    ruleIds = [...product.shippingRuleIds];
  }
  // Check for single shipping rule ID
  else if (product.shippingRuleId && typeof product.shippingRuleId === 'string') {
    ruleIds = [product.shippingRuleId];
  }
  // Check for shipping rules as objects
  else if (product.shippingRules && Array.isArray(product.shippingRules)) {
    ruleIds = product.shippingRules
      .filter(rule => rule && (rule.id || rule.ruleId))
      .map(rule => rule.id || rule.ruleId);
  }
  
  return ruleIds;
};

/**
 * Verifica si una regla de envío es válida para una dirección
 * @param {Object} rule - Regla de envío
 * @param {Object} address - Dirección del usuario
 * @returns {boolean} - True si la regla aplica a la dirección
 */
export const isRuleValidForAddress = (rule, address) => {
  if (!rule || !address) return false;
  
  // Determinar qué campos usar para código postal y estado
  const postalCode = address.postalCode || address.zip || address.zipcode || '';
  const state = address.state || address.provincia || address.estado || '';
  
  // Verificar según el tipo de cobertura de la regla
  const coverageType = rule.coverage_type || rule.tipo_cobertura || '';
  
  // Si la regla tiene cobertura por código postal
  if (coverageType === 'por_codigo_postal' && rule.coverage_values && Array.isArray(rule.coverage_values)) {
    return rule.coverage_values.includes(postalCode);
  }
  
  // Si la regla tiene cobertura por estado
  if (coverageType === 'por_estado' && rule.coverage_values && Array.isArray(rule.coverage_values)) {
    return rule.coverage_values.includes(state);
  }
  
  // Si la regla es de tipo nacional (cobertura general)
  if (coverageType === 'nacional') {
    return true;
  }
  
  // Otros tipos de cobertura podrían implementarse aquí
  
  // Si no se identificó un tipo de cobertura específico, verificar otros campos comunes
  
  // Verificar rangos de CP específicos (formato alternativo)
  if (rule.cobertura_cp && Array.isArray(rule.cobertura_cp) && postalCode) {
    return rule.cobertura_cp.includes(postalCode);
  }
  
  // Verificar estados específicos (formato alternativo)
  if (rule.cobertura_estados && Array.isArray(rule.cobertura_estados) && state) {
    return rule.cobertura_estados.includes(state);
  }
  
  return false;
};

/**
 * Determina las reglas de envío válidas para un producto y una dirección
 * @param {Object} product - Producto
 * @param {Object} address - Dirección del usuario
 * @param {Object} allRules - Todas las reglas de envío disponibles (mapa id -> regla)
 * @returns {Array} - Array de IDs de reglas válidas
 */
export const getValidRulesForProduct = (product, address, allRules) => {
  if (!product || !address || !allRules) return [];
  
  // Extraer los IDs de reglas asociadas al producto
  const ruleIds = extractRuleIds(product);
  
  // Filtrar solo las reglas que aplican a la dirección
  return ruleIds.filter(ruleId => {
    const rule = allRules[ruleId];
    return rule && isRuleValidForAddress(rule, address);
  });
};

/**
 * Agrupar productos por regla de envío
 * @param {Array} cartItems - Productos en el carrito
 * @returns {Array} - Grupos de productos por regla
 */
export const groupProductsByRule = (cartItems) => {
  if (!cartItems || !cartItems.length) return [];
  
  const productGroups = [];
  const groupedByRule = {};
  
  // Agrupar productos por ID de regla
  cartItems.forEach(item => {
    const product = item.product || item;
    const productId = product.id;
    
    // Extraer las reglas asociadas al producto
    const ruleIds = extractRuleIds(product);
    
    if (ruleIds.length === 0) {
      console.warn(`⚠️ Producto sin reglas de envío: ${productId}`);
      return;
    }
    
    // Crear un grupo para cada regla posible del producto
    ruleIds.forEach(ruleId => {
      if (!groupedByRule[ruleId]) {
        groupedByRule[ruleId] = [];
      }
      
      groupedByRule[ruleId].push(item);
    });
  });
  
  // Convertir el objeto agrupado a array
  Object.keys(groupedByRule).forEach(ruleId => {
    productGroups.push({
      ruleId,
      products: groupedByRule[ruleId]
    });
  });
  
  return productGroups;
};

/**
 * Generar todas las combinaciones posibles de reglas para los productos
 * @param {Object} validRulesByProduct - Mapa de producto -> reglas válidas
 * @returns {Array} - Array de combinaciones posibles
 */
export const generateRuleCombinations = (validRulesByProduct) => {
  const productIds = Object.keys(validRulesByProduct);
  
  // Si no hay productos, devolver array vacío
  if (productIds.length === 0) {
    return [];
  }
  
  // Función recursiva para generar combinaciones
  const generateCombinations = (index = 0, currentCombination = {}) => {
    // Si hemos procesado todos los productos, añadir la combinación actual al resultado
    if (index === productIds.length) {
      return [currentCombination];
    }
    
    const productId = productIds[index];
    const validRules = validRulesByProduct[productId];
    const combinations = [];
    
    // Para cada regla válida de este producto, generar combinaciones
    validRules.forEach(ruleId => {
      const newCombination = {
        ...currentCombination,
        [productId]: ruleId
      };
      
      // Generar combinaciones para el resto de productos
      const nextCombinations = generateCombinations(index + 1, newCombination);
      combinations.push(...nextCombinations);
    });
    
    return combinations;
  };
  
  return generateCombinations();
};

/**
 * Agrupar asignaciones producto-regla por regla
 * @param {Object} combination - Combinación de producto -> ruleId
 * @param {Array} cartItems - Productos en el carrito
 * @returns {Object} - Mapa de ruleId -> productos
 */
export const groupCombinationByRule = (combination, cartItems) => {
  const groups = {};
  
  // Crear un mapa de id -> item para acceso rápido
  const itemsMap = {};
  cartItems.forEach(item => {
    const product = item.product || item;
    itemsMap[product.id] = item;
  });
  
  // Agrupar por regla
  Object.entries(combination).forEach(([productId, ruleId]) => {
    if (!groups[ruleId]) {
      groups[ruleId] = [];
    }
    
    // Añadir el item completo al grupo
    if (itemsMap[productId]) {
      groups[ruleId].push(itemsMap[productId]);
    }
  });
  
  return groups;
};

/**
 * Verifica si una combinación de opciones cubre todos los productos
 * @param {Array} options - Opciones de envío
 * @param {Array} cartItems - Productos en el carrito
 * @returns {boolean} - True si todos los productos están cubiertos
 */
export const allProductsCovered = (options, cartItems) => {
  if (!options || !cartItems || cartItems.length === 0) return false;
  
  // Crear conjunto de IDs de productos
  const allProductIds = new Set();
  const coveredProductIds = new Set();
  
  // Recopilar todos los IDs de productos
  cartItems.forEach(item => {
    const product = item.product || item;
    if (product && product.id) {
      allProductIds.add(product.id);
    }
  });
  
  // Verificar qué productos están cubiertos por las opciones
  options.forEach(option => {
    // Si la opción tiene productos directamente
    if (option.products && Array.isArray(option.products)) {
      option.products.forEach(item => {
        const product = item.product || item;
        if (product && product.id) {
          coveredProductIds.add(product.id);
        }
      });
    }
    
    // Si la opción tiene productIds
    if (option.productIds && Array.isArray(option.productIds)) {
      option.productIds.forEach(id => {
        if (id) {
          coveredProductIds.add(id);
        }
      });
    }
    
    // Si la opción tiene covered_products
    if (option.covered_products && Array.isArray(option.covered_products)) {
      option.covered_products.forEach(id => {
        if (id) {
          coveredProductIds.add(id);
        }
      });
    }
  });
  
  // Verificar si todos los productos están cubiertos
  return coveredProductIds.size === allProductIds.size;
}; 