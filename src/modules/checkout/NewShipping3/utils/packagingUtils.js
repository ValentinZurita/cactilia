/**
 * Utilidades para el algoritmo de empaquetado (Greedy Packaging)
 * Agrupa productos en paquetes optimizando cantidad y costos
 */
import { PACKAGE_CONFIG_DEFAULTS } from '../constants';

/**
 * Calcula el peso total de un ítem del carrito (producto * cantidad)
 * @param {Object} item - Item del carrito
 * @returns {number} - Peso total del ítem
 */
export const calculateItemWeight = (item) => {
  if (!item) return 0;
  
  const product = item.product || item;
  const weight = parseFloat(product.weight || 0);
  const quantity = parseInt(item.quantity || 1, 10);
  
  return weight * quantity;
};

/**
 * Calcula el peso total de un array de ítems del carrito
 * @param {Array} items - Ítems del carrito
 * @returns {number} - Peso total
 */
export const calculateTotalWeight = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return 0;
  }
  
  return items.reduce((total, item) => total + calculateItemWeight(item), 0);
};

/**
 * Obtiene la configuración de empaquetado de una regla de envío
 * @param {Object} rule - Regla de envío
 * @returns {Object} - Configuración de empaquetado con valores por defecto si es necesario
 */
export const getPackageConfig = (rule) => {
  if (!rule) {
    return { ...PACKAGE_CONFIG_DEFAULTS };
  }
  
  // Extraer configuración de la regla
  const ruleConfig = rule.configuracion_paquetes || {};
  
  // Usar valores de la regla o valores por defecto
  return {
    peso_maximo_paquete: parseFloat(ruleConfig.peso_maximo_paquete || rule.peso_maximo || PACKAGE_CONFIG_DEFAULTS.peso_maximo_paquete),
    maximo_productos_por_paquete: parseInt(ruleConfig.maximo_productos_por_paquete || PACKAGE_CONFIG_DEFAULTS.maximo_productos_por_paquete, 10),
    costo_por_kg_extra: parseFloat(ruleConfig.costo_por_kg_extra || PACKAGE_CONFIG_DEFAULTS.costo_por_kg_extra)
  };
};

/**
 * Verifica si un paquete puede aceptar un item adicional sin exceder restricciones
 * @param {Object} package - Paquete actual con items y peso
 * @param {Object} item - Item a agregar
 * @param {Object} packageConfig - Configuración del paquete (límites)
 * @returns {boolean} - true si el ítem puede agregarse al paquete
 */
export const canAddItemToPackage = (packageData, item, packageConfig) => {
  if (!packageData || !item || !packageConfig) return false;
  
  const itemWeight = calculateItemWeight(item);
  const newWeight = packageData.weight + itemWeight;
  const newCount = packageData.items.length + 1;
  
  // Verificar límite de peso
  if (newWeight > packageConfig.peso_maximo_paquete) {
    return false;
  }
  
  // Verificar límite de productos
  if (newCount > packageConfig.maximo_productos_por_paquete) {
    return false;
  }
  
  return true;
};

/**
 * Agrupa los ítems del carrito en paquetes según el algoritmo greedy
 * Trata de empacar en la menor cantidad de paquetes posible
 * @param {Array} cartItems - Ítems del carrito
 * @param {Object} shippingRule - Regla de envío
 * @returns {Array} - Array de paquetes
 */
export const groupIntoPackages = (cartItems, shippingRule) => {
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0 || !shippingRule) {
    return [];
  }
  
  // Obtener configuración de empaquetado
  const packageConfig = getPackageConfig(shippingRule);
  
  // Ordenar ítems por peso (descendente) para optimización
  const sortedItems = [...cartItems].sort((a, b) => {
    const weightA = calculateItemWeight(a);
    const weightB = calculateItemWeight(b);
    return weightB - weightA; // Empacar los más pesados primero
  });
  
  // Array de paquetes
  const packages = [];
  
  // Crear el primer paquete
  let currentPackage = {
    id: `package_${Date.now()}_0`,
    items: [],
    weight: 0,
    rule: shippingRule
  };
  
  // Intentar empacar cada ítem
  sortedItems.forEach((item) => {
    if (canAddItemToPackage(currentPackage, item, packageConfig)) {
      // Si cabe en el paquete actual, agregarlo
      currentPackage.items.push(item);
      currentPackage.weight += calculateItemWeight(item);
    } else {
      // Si no cabe, cerrar este paquete y crear uno nuevo
      if (currentPackage.items.length > 0) {
        packages.push(currentPackage);
      }
      
      // Crear nuevo paquete con este ítem
      currentPackage = {
        id: `package_${Date.now()}_${packages.length}`,
        items: [item],
        weight: calculateItemWeight(item),
        rule: shippingRule
      };
    }
  });
  
  // Agregar el último paquete si tiene ítems
  if (currentPackage.items.length > 0) {
    packages.push(currentPackage);
  }
  
  return packages;
};

/**
 * Calcula el costo de envío para un paquete
 * @param {Object} packageData - Datos del paquete
 * @param {Object} rule - Regla de envío aplicada
 * @returns {Object} - Detalles del costo
 */
export const calculatePackageCost = (packageData, rule) => {
  if (!packageData || !rule) {
    return { baseCost: 0, extraCost: 0, totalCost: 0 };
  }
  
  // Verificar si el envío es gratuito
  if (rule.envio_gratis === true) {
    return {
      baseCost: 0,
      extraCost: 0,
      totalCost: 0,
      isFree: true
    };
  }
  
  // Configuración del paquete
  const packageConfig = getPackageConfig(rule);
  
  // Costo base
  const baseCost = parseFloat(rule.precio || 0);
  
  // Costos por peso extra
  let extraWeightCost = 0;
  if (packageData.weight > packageConfig.peso_maximo_paquete) {
    const extraWeight = Math.ceil(packageData.weight - packageConfig.peso_maximo_paquete);
    extraWeightCost = extraWeight * packageConfig.costo_por_kg_extra;
  }
  
  // Costos por producto adicional
  let extraProductCost = 0;
  if (rule.envio_variable && rule.envio_variable.aplica && rule.envio_variable.costo_por_producto_extra) {
    const baseProducts = 1; // Primer producto incluido en precio base
    const extraProducts = Math.max(0, packageData.items.length - baseProducts);
    extraProductCost = extraProducts * parseFloat(rule.envio_variable.costo_por_producto_extra);
  }
  
  // Costo total
  const totalExtraCost = extraWeightCost + extraProductCost;
  const totalCost = baseCost + totalExtraCost;
  
  return {
    baseCost,
    extraCost: totalExtraCost,
    extraWeightCost,
    extraProductCost,
    totalCost,
    isFree: false
  };
};

/**
 * Calcula el costo total de envío para múltiples paquetes
 * @param {Array} packages - Array de paquetes
 * @returns {Object} - Detalle de costos totales
 */
export const calculateTotalShippingCost = (packages) => {
  if (!packages || !Array.isArray(packages) || packages.length === 0) {
    return { totalCost: 0, freePackages: 0, paidPackages: 0 };
  }
  
  let totalCost = 0;
  let freePackages = 0;
  let paidPackages = 0;
  
  // Calcular costos para cada paquete
  const packageCosts = packages.map(packageData => {
    const cost = calculatePackageCost(packageData, packageData.rule);
    
    if (cost.isFree) {
      freePackages++;
    } else {
      paidPackages++;
      totalCost += cost.totalCost;
    }
    
    return {
      ...packageData,
      cost
    };
  });
  
  return {
    packageCosts,
    totalCost,
    freePackages,
    paidPackages
  };
}; 