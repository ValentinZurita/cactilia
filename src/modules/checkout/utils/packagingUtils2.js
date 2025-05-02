/**
 * Utilities for package creation and shipping cost calculations
 */
import { RULE_CONFIG_FALLBACKS } from '../../constants/shippingConstants.js'

/**
 * Calculate the total weight of a cart item (product * quantity)
 *
 * @param {Object} item - Cart item
 * @returns {number} Total weight of the item
 */
export const calculateItemWeight = (item) => {
  if (!item) return 0

  const product = item.product || item
  // STRICT REQUIREMENT: Use actual product weight
  // If weight is missing, we use 0 to flag it (products should always have weight)
  const weight = parseFloat(product.weight || 0)
  const quantity = parseInt(item.quantity || 1, 10)

  return weight * quantity
}

/**
 * Calculate the total price of a cart item (product * quantity)
 *
 * @param {Object} item - Cart item
 * @returns {number} Total price of the item
 */
export const calculateItemPrice = (item) => {
  if (!item) return 0

  const product = item.product || item
  const price = parseFloat(product.price || 0)
  const quantity = parseInt(item.quantity || 1, 10)

  return price * quantity
}

/**
 * Group cart items into optimal packages using a greedy algorithm
 *
 * @param {Array} cartItems - Cart items to package
 * @param {Object} shippingRule - The shipping rule with packaging constraints
 * @returns {Array} Array of optimized packages
 */
export const groupIntoPackages = (cartItems, shippingRule) => {
  if (!cartItems || !cartItems.length || !shippingRule) {
    return []
  }

  // Extract packaging constraints from the rule, using fallbacks if missing
  const packageConfig = shippingRule.configuracion_paquetes || {}
  const maxWeight = parseFloat(packageConfig.peso_maximo_paquete) ||
    RULE_CONFIG_FALLBACKS.PACKAGE_CONFIG.peso_maximo_paquete
  const maxItems = parseInt(packageConfig.maximo_productos_por_paquete) ||
    RULE_CONFIG_FALLBACKS.PACKAGE_CONFIG.maximo_productos_por_paquete

  // Sort items by weight (descending) for better packing results
  const sortedItems = [...cartItems].sort((a, b) => {
    const weightA = calculateItemWeight({ ...a, quantity: 1 })
    const weightB = calculateItemWeight({ ...b, quantity: 1 })
    return weightB - weightA
  })

  const packages = []
  let packageIndex = 0

  // Process each item
  sortedItems.forEach(item => {
    const itemWeight = calculateItemWeight({ ...item, quantity: 1 })
    const quantity = parseInt(item.quantity || 1, 10)

    // If a single unit exceeds max weight, it needs its own package(s)
    if (itemWeight > maxWeight) {
      // Create individual packages for each unit
      for (let i = 0; i < quantity; i++) {
        packages.push({
          id: `package-${packageIndex++}`,
          items: [{ ...item, quantity: 1 }],
          totalWeight: itemWeight,
          totalQuantity: 1,
          exceedsLimits: true,
          ruleId: shippingRule.id,
        })
      }
      return // Move to next item
    }

    // Try to distribute units among existing packages first
    let remainingQuantity = quantity
    let i = 0

    // Only try to add to packages that aren't already exceeding limits
    while (remainingQuantity > 0 && i < packages.length) {
      const pkg = packages[i]

      // Skip packages that already exceed limits
      if (pkg.exceedsLimits || pkg.ruleId !== shippingRule.id) {
        i++
        continue
      }

      // How many more units we can add to this package
      const weightCapacity = Math.floor((maxWeight - pkg.totalWeight) / itemWeight)
      const itemCapacity = maxItems - pkg.totalQuantity
      const capacityToAdd = Math.min(weightCapacity, itemCapacity, remainingQuantity)

      if (capacityToAdd > 0) {
        // Find if the item already exists in the package
        const existingItemIndex = pkg.items.findIndex(
          existingItem => existingItem.product?.id === item.product?.id,
        )

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          pkg.items[existingItemIndex].quantity += capacityToAdd
        } else {
          // Add as new item
          pkg.items.push({ ...item, quantity: capacityToAdd })
        }

        pkg.totalWeight += (itemWeight * capacityToAdd)
        pkg.totalQuantity += capacityToAdd
        remainingQuantity -= capacityToAdd
      }

      i++
    }

    // Create new packages for any remaining quantity
    while (remainingQuantity > 0) {
      const quantityForNewPackage = Math.min(
        remainingQuantity,
        maxItems,
        Math.floor(maxWeight / itemWeight),
      )

      packages.push({
        id: `package-${packageIndex++}`,
        items: [{ ...item, quantity: quantityForNewPackage }],
        totalWeight: itemWeight * quantityForNewPackage,
        totalQuantity: quantityForNewPackage,
        exceedsLimits: false,
        ruleId: shippingRule.id,
      })

      remainingQuantity -= quantityForNewPackage
    }
  })

  return packages
}

/**
 * Calculate the shipping cost for a package
 *
 * @param {Object} packageData - The package to calculate cost for
 * @param {Object} shippingRule - The shipping rule to use
 * @param {number} orderSubtotal - Optional order subtotal for free shipping calculations
 * @returns {Object} Calculated cost details
 */
export const calculatePackageCost = (packageData, shippingRule, orderSubtotal = 0) => {
  if (!packageData || !shippingRule) {
    return { baseCost: 0, extraCost: 0, totalCost: 0 }
  }

  // Check if shipping is free unconditionally
  if (shippingRule.envio_gratis === true) {
    return {
      baseCost: 0,
      extraCost: 0,
      totalCost: 0,
      isFree: true,
    }
  }

  // Check for free shipping by minimum order amount
  if (shippingRule.envio_variable &&
    shippingRule.envio_variable.aplica &&
    shippingRule.envio_variable.envio_gratis_monto_minimo) {

    const minAmount = parseFloat(shippingRule.envio_variable.envio_gratis_monto_minimo)

    if (!isNaN(minAmount) && orderSubtotal >= minAmount) {
      return {
        baseCost: 0,
        extraCost: 0,
        totalCost: 0,
        isFree: true,
        freeShippingReason: 'minimum_amount',
      }
    }
  }

  // Base price and extra weight costs
  const basePrice = parseFloat(shippingRule.precio || 0)
  const packageConfig = shippingRule.configuracion_paquetes || {}
  const maxWeight = parseFloat(packageConfig.peso_maximo_paquete) ||
    RULE_CONFIG_FALLBACKS.PACKAGE_CONFIG.peso_maximo_paquete
  const extraWeightCost = parseFloat(packageConfig.costo_por_kg_extra) ||
    RULE_CONFIG_FALLBACKS.PACKAGE_CONFIG.costo_por_kg_extra

  // Calculate extra cost for weight exceeding the limit
  let extraCost = 0
  if (packageData.totalWeight > maxWeight) {
    const overWeight = Math.ceil(packageData.totalWeight - maxWeight)
    extraCost = overWeight * extraWeightCost
  }

  // Calculate total cost
  const totalCost = basePrice + extraCost

  return {
    baseCost: basePrice,
    extraCost,
    totalCost,
    isFree: false,
    details: {
      weight: packageData.totalWeight,
      maxWeight,
      extraWeightCost,
    },
  }
}

/**
 * Calculate the total shipping cost for a list of packages
 *
 * @param {Array} packages - List of packages
 * @param {Object} shippingRule - The shipping rule to use
 * @param {number} orderSubtotal - Order subtotal for free shipping calculations
 * @returns {number} Total shipping cost
 */
export const calculateTotalShippingCost = (packages, shippingRule, orderSubtotal = 0) => {
  if (!packages || packages.length === 0 || !shippingRule) {
    return 0
  }

  let totalCost = 0

  // If all packages are free due to order subtotal, return 0
  if (shippingRule.envio_gratis === true) {
    return 0
  }

  // Check for free shipping by minimum order amount
  if (shippingRule.envio_variable &&
    shippingRule.envio_variable.aplica &&
    shippingRule.envio_variable.envio_gratis_monto_minimo) {

    const minAmount = parseFloat(shippingRule.envio_variable.envio_gratis_monto_minimo)

    if (!isNaN(minAmount) && orderSubtotal >= minAmount) {
      return 0
    }
  }

  // Calculate cost for each package
  packages.forEach(pkg => {
    const { totalCost: packageCost } = calculatePackageCost(pkg, shippingRule)
    totalCost += packageCost
  })

  return totalCost
}