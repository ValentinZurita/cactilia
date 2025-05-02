/**
 * Utilidades para el procesamiento de opciones de envío
 * Filtrado de productos enviables y obtención de opciones
 */
import { isRuleApplicableForAddress } from './coverageUtils.js'
import { extractShippingRuleIds } from './productsService.js'
import { isRuleValidForAddress, getApplicableRulesForProduct } from './shippingRuleUtils.js'
import { calculateItemPrice, calculateItemWeight } from './packagingUtils.js'
import { calculateTotalShippingCost, groupIntoPackages } from './packagingUtils.js'

/**
 * Filtra reglas de envío aplicables para un producto y dirección
 * @param {Object} product - Producto
 * @param {Object} address - Dirección de envío
 * @param {Array} allRules - Todas las reglas de envío
 * @returns {Array} - Reglas aplicables para el producto y dirección
 */
export const getApplicableRules = (product, address, allRules) => {
  if (!product || !address || !allRules || !Array.isArray(allRules)) {
    return []
  }

  // Extraer IDs de reglas del producto
  const productRuleIds = extractShippingRuleIds(product)

  if (productRuleIds.length === 0) {
    return []
  }

  // Filtrar reglas que aplican al producto y la dirección
  const applicableRules = allRules.filter(rule => {
    // Verificar si la regla está en las reglas del producto
    const isProductRule = productRuleIds.includes(rule.id)

    // Verificar si la regla está activa y aplica a la dirección
    const isRuleApplicable = rule.activo !== false && isRuleApplicableForAddress(rule, address)

    return isProductRule && isRuleApplicable
  })

  return applicableRules
}

/**
 * Filtra productos del carrito según si se pueden enviar o no a una dirección
 * @param {Array} cartItems - Ítems del carrito
 * @param {Object} address - Dirección de envío
 * @param {Array} allRules - Todas las reglas de envío
 * @returns {Object} - Productos enviables y no enviables
 */
export const filterShippableProducts = (cartItems, address, allRules) => {
  if (!cartItems || !Array.isArray(cartItems) || !address || !allRules) {
    return { shippable: [], unshippable: [] }
  }

  const shippable = []
  const unshippable = []

  cartItems.forEach(item => {
    const product = item.product || item
    const applicableRules = getApplicableRules(product, address, allRules)

    if (applicableRules.length > 0) {
      shippable.push({
        ...item,
        applicableRules,
      })
    } else {
      unshippable.push(item)
    }
  })

  return { shippable, unshippable }
}

/**
 * Agrupa productos del carrito por reglas de envío
 * @param {Array} cartItems - Ítems del carrito
 * @param {Object} address - Dirección de envío
 * @param {Array} allRules - Todas las reglas de envío
 * @returns {Array} - Grupos de productos por regla
 */
export const groupProductsByShippingRule = (cartItems, address, allRules) => {
  if (!cartItems || !Array.isArray(cartItems) || !address || !allRules) {
    return []
  }

  // Filtrar productos enviables
  const { shippable, unshippable } = filterShippableProducts(cartItems, address, allRules)

  if (shippable.length === 0) {
    return []
  }

  // Mapa de reglas: ruleId -> { rule, items }
  const ruleGroups = {}

  // Asignar cada producto a su grupo de regla
  shippable.forEach(item => {
    // Ordenar reglas aplicables por precio (primero las gratuitas, luego las más baratas)
    const sortedRules = [...item.applicableRules].sort((a, b) => {
      // Si alguna es gratis, va primero
      if (a.envio_gratis === true && b.envio_gratis !== true) return -1
      if (b.envio_gratis === true && a.envio_gratis !== true) return 1

      // Si ninguna es gratis, ordenar por precio
      const priceA = parseFloat(a.precio || 0)
      const priceB = parseFloat(b.precio || 0)
      return priceA - priceB
    })

    // Usar la primera regla (mejor opción)
    const bestRule = sortedRules[0]

    if (!bestRule) return

    // Crear o actualizar grupo
    if (!ruleGroups[bestRule.id]) {
      ruleGroups[bestRule.id] = {
        rule: bestRule,
        items: [],
      }
    }

    // Agregar item al grupo
    ruleGroups[bestRule.id].items.push(item)
  })

  // Convertir a array
  return Object.values(ruleGroups)
}

/**
 * Prepara opciones de envío para un checkout
 * @param {Array} cartItems - Ítems del carrito
 * @param {Object} address - Dirección de envío
 * @param {Array} allRules - Todas las reglas de envío
 * @returns {Object} - Opciones de envío y productos no enviables
 */
export const prepareShippingOptions = (cartItems, address, allRules) => {
  if (!cartItems || !Array.isArray(cartItems) || !address || !allRules) {
    return { packages: [], shippingCost: 0, unshippableItems: [] }
  }

  // Filtrar productos enviables
  const { shippable, unshippable } = filterShippableProducts(cartItems, address, allRules)

  if (shippable.length === 0) {
    return { packages: [], shippingCost: 0, unshippableItems: unshippable }
  }

  // Agrupar por regla de envío
  const ruleGroups = groupProductsByShippingRule(shippable, address, allRules)

  // Array de todos los paquetes
  let allPackages = []

  // Crear paquetes para cada grupo
  ruleGroups.forEach(group => {
    const { rule, items } = group

    // Aplicar algoritmo greedy para este grupo
    const packages = groupIntoPackages(items, rule)

    // Agregar a la lista general
    allPackages = [...allPackages, ...packages]
  })

  // Calcular costo total
  const shippingCostDetails = calculateTotalShippingCost(allPackages)

  return {
    packages: shippingCostDetails.packageCosts || [],
    shippingCost: shippingCostDetails.totalCost || 0,
    unshippableItems: unshippable,
  }
}