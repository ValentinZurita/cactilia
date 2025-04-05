/**
 * Utilidades simplificadas para el cálculo de envío
 */

/**
 * Agrupa los productos del carrito en paquetes según las reglas de envío
 * @param {Array} cartItems - Elementos del carrito
 * @param {Object} shippingRule - Regla de envío a aplicar
 * @returns {Array} - Grupos de paquetes
 */
export const groupProductsIntoPackages = (cartItems, shippingRule) => {
  if (!cartItems || !cartItems.length || !shippingRule) {
    return [];
  }
  
  // Obtener límites de la regla de envío
  const maxProductsPerPackage = parseInt(shippingRule.maxProductsPerPackage) || 10;
  const maxPackageWeight = parseFloat(shippingRule.maxPackageWeight) || 20;
  
  const packages = [];
  let currentPackage = { items: [], totalWeight: 0, totalQuantity: 0 };
  let packageIndex = 0;
  
  cartItems.forEach(item => {
    const product = item.product || item;
    const productWeight = product.weight || 1; // Peso por unidad en kg
    const itemWeight = productWeight * item.quantity;
    
    // Si agregar este producto excedería el límite de productos o peso, crear nuevo paquete
    if (currentPackage.totalQuantity + item.quantity > maxProductsPerPackage || 
        currentPackage.totalWeight + itemWeight > maxPackageWeight) {
      
      if (currentPackage.items.length > 0) {
        packages.push({
          ...currentPackage,
          id: `package-${packageIndex}`
        });
        packageIndex++;
        currentPackage = { items: [], totalWeight: 0, totalQuantity: 0 };
      }
    }
    
    // Agregar producto al paquete actual
    currentPackage.items.push(item);
    currentPackage.totalWeight += itemWeight;
    currentPackage.totalQuantity += item.quantity;
  });
  
  // Agregar el último paquete si tiene elementos
  if (currentPackage.items.length > 0) {
    packages.push({
      ...currentPackage,
      id: `package-${packageIndex}`
    });
  }
  
  return packages;
};

/**
 * Calcula el costo de envío para un paquete
 * @param {Object} packageGroup - Grupo de productos en un paquete
 * @param {Object} shippingRule - Regla de envío a aplicar
 * @returns {Object} - Información sobre el costo del paquete
 */
export const calculatePackageCost = (packageGroup, shippingRule) => {
  if (!packageGroup || !shippingRule) {
    return { baseCost: 0, extraWeightCost: 0, totalCost: 0 };
  }
  
  // Obtener valores de la regla de envío (con valores por defecto por seguridad)
  const maxPackageWeight = parseFloat(shippingRule.maxPackageWeight) || 20;
  const extraWeightCost = parseFloat(shippingRule.extraWeightCost) || 10;
  const baseCost = parseFloat(shippingRule.price) || 0;
  
  // Calcular recargo por sobrepeso
  let extraWeightCharge = 0;
  if (packageGroup.totalWeight > maxPackageWeight) {
    const extraWeight = Math.ceil(packageGroup.totalWeight - maxPackageWeight);
    extraWeightCharge = extraWeight * extraWeightCost;
  }
  
  return {
    baseCost,
    extraWeightCost: extraWeightCharge,
    totalCost: baseCost + extraWeightCharge
  };
};

/**
 * Calcula el costo total de envío para todos los paquetes
 * @param {Array} packageGroups - Grupos de paquetes
 * @param {Object} shippingRule - Regla de envío a aplicar
 * @returns {Number} - Costo total de envío
 */
export const calculateTotalShippingCost = (packageGroups, shippingRule) => {
  if (!packageGroups || packageGroups.length === 0 || !shippingRule) {
    return 0;
  }
  
  return packageGroups.reduce((total, packageGroup) => {
    const { totalCost } = calculatePackageCost(packageGroup, shippingRule);
    return total + totalCost;
  }, 0);
}; 