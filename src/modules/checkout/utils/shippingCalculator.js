/**
 * Utilidades para el cálculo de costos de envío
 * ADAPTADO para la estructura de Firestore de Cactilia
 */

/**
 * Agrupa los productos en paquetes según los límites de peso y cantidad
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} shippingOption - Opción de envío con límites
 * @returns {Array} Paquetes agrupados
 */
export const groupProductsIntoPackages = (cartItems, shippingOption) => {
  if (!cartItems || !cartItems.length || !shippingOption) {
    return [];
  }

  // Obtener límites de la opción de envío (adaptados a tu estructura)
  const maxWeight = parseFloat(shippingOption.maxPackageWeight) || 1;
  const maxItems = parseInt(shippingOption.maxProductsPerPackage) || 1;

  const packages = [];
  let currentPackage = { items: [], totalWeight: 0, totalQuantity: 0 };
  let packageIndex = 0;

  // Ordenar productos por peso (descendente) para optimizar empaquetado
  const sortedItems = [...cartItems].sort((a, b) => {
    const productA = a.product || a;
    const productB = b.product || b;
    return (productB.weight || 1) - (productA.weight || 1);
  });

  sortedItems.forEach(item => {
    const product = item.product || item;
    const quantity = parseInt(item.quantity) || 1;
    const unitWeight = parseFloat(product.weight) || 1;
    const totalItemWeight = unitWeight * quantity;

    // Si el producto excede por sí solo los límites, necesita su propio paquete
    if (unitWeight > maxWeight || quantity > maxItems) {
      // Crear paquetes individuales para las unidades
      for (let i = 0; i < quantity; i++) {
        packages.push({
          id: `package-${packageIndex++}`,
          items: [{ ...item, quantity: 1 }],
          totalWeight: unitWeight,
          totalQuantity: 1,
          exceedsLimits: unitWeight > maxWeight
        });
      }
      return; // Continuar con el siguiente producto
    }

    // Verificar si agregar este producto excedería los límites
    if (currentPackage.totalQuantity + quantity > maxItems ||
      currentPackage.totalWeight + totalItemWeight > maxWeight) {

      // Si el paquete actual tiene productos, finalizarlo
      if (currentPackage.items.length > 0) {
        packages.push({
          ...currentPackage,
          id: `package-${packageIndex++}`
        });
        // Iniciar nuevo paquete
        currentPackage = { items: [], totalWeight: 0, totalQuantity: 0 };
      }
    }

    // Agregar producto al paquete actual
    currentPackage.items.push(item);
    currentPackage.totalWeight += totalItemWeight;
    currentPackage.totalQuantity += quantity;
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
 * @param {Object} packageGroup - Paquete con productos
 * @param {Object} shippingOption - Opción de envío seleccionada
 * @returns {Object} Detalles del costo
 */
export const calculatePackageCost = (packageGroup, shippingOption) => {
  if (!packageGroup || !shippingOption) {
    return { baseCost: 0, extraCost: 0, totalCost: 0 };
  }

  // Valores por defecto si no están definidos (adaptados a tu estructura)
  const basePrice = parseFloat(shippingOption.price) || 0;
  const maxWeight = parseFloat(shippingOption.maxPackageWeight) || 1;
  const extraWeightCost = parseFloat(shippingOption.extraWeightCost) || 100;

  // Calcular costo por exceso de peso
  let extraCost = 0;
  if (packageGroup.totalWeight > maxWeight) {
    const overWeight = Math.ceil(packageGroup.totalWeight - maxWeight);
    extraCost = overWeight * extraWeightCost;
  }

  // Costo total del paquete
  const totalCost = basePrice + extraCost;

  return {
    baseCost: basePrice,
    extraCost,
    totalCost,
    details: {
      weight: packageGroup.totalWeight,
      maxWeight,
      extraWeightCost
    }
  };
};

/**
 * Calcula el costo total de envío para todos los paquetes
 * @param {Array} packages - Lista de paquetes
 * @param {Object} shippingOption - Opción de envío
 * @returns {Number} Costo total de envío
 */
export const calculateTotalShippingCost = (packages, shippingOption) => {
  if (!packages || packages.length === 0 || !shippingOption) {
    return 0;
  }

  // Sumar el costo de cada paquete
  return packages.reduce((total, pkg) => {
    const { totalCost } = calculatePackageCost(pkg, shippingOption);
    return total + totalCost;
  }, 0);
};

/**
 * Verifica si aplicar envío gratuito según el subtotal y configuración
 * ADAPTADO a la estructura de Cactilia
 * @param {Number} subtotal - Subtotal del pedido
 * @param {Object} shippingRule - Regla de envío
 * @returns {Boolean} Si se aplica envío gratuito
 */
export const shouldApplyFreeShipping = (subtotal, shippingRule) => {
  if (!shippingRule) return false;

  // Si la regla tiene envío gratuito incondicional
  if (shippingRule.envio_gratis === true) {
    return true;
  }

  // Si tiene un monto mínimo para envío gratis
  if (shippingRule.envio_variable &&
    shippingRule.envio_variable.aplica &&
    shippingRule.envio_variable.envio_gratis_monto_minimo) {

    // Verificar si el valor es número o string
    let minAmount;
    if (typeof shippingRule.envio_variable.envio_gratis_monto_minimo === 'string') {
      minAmount = parseFloat(shippingRule.envio_variable.envio_gratis_monto_minimo);
    } else {
      minAmount = shippingRule.envio_variable.envio_gratis_monto_minimo;
    }

    return !isNaN(minAmount) && subtotal >= minAmount;
  }

  return false;
};