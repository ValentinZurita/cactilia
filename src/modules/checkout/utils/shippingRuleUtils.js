/**
 * Utility functions for working with shipping rules
 */
import { COVERAGE_TYPES, STATE_ABBREVIATIONS } from '../constants/shippingConstants.js'

/**
 * Checks if a shipping rule is valid for a specific address
 *
 * @param {Object} rule - The shipping rule to check
 * @param {Object} address - The address to check against
 * @returns {boolean} Whether the rule is valid for the address
 */
export const isRuleValidForAddress = (rule, address) => {
  if (!rule || !address) return false

  // If rule has no zipcodes, it might be incorrectly configured, but we rely on specific values now.
  // Let's assume rules MUST have zipcodes array for coverage.
  if (!rule.zipcodes || !Array.isArray(rule.zipcodes) || rule.zipcodes.length === 0) return false

  // Extract address data, handling different property names robustly
  const zipCode = (address.zip || address.zipCode || address.postalCode || '').toString().trim()
  // Consider multiple possible fields for state
  const state = (address.state || address.provincia || address.estado || '').toString().trim()

  // Check if rule has national coverage
  if (rule.zipcodes.includes(COVERAGE_TYPES.NATIONAL)) {
    return true
  }

  // Check if rule includes the specific zipcode
  if (zipCode && rule.zipcodes.includes(zipCode)) {
    return true
  }

  // Check state coverage (formato: "estado_XXX") - Case Insensitive using STATE ABBREVIATION
  const stateAbbreviation = STATE_ABBREVIATIONS[state]?.toLowerCase() // Obtener abreviatura y convertir a minúsculas
  const statePrefix = COVERAGE_TYPES.STATE_PREFIX.toLowerCase() // Prefijo en minúsculas ('estado_')

  if (stateAbbreviation && rule.zipcodes.some(code => {
    // Asegurarse que 'code' es string y comparar en minúsculas usando la ABREVIATURA
    return typeof code === 'string' && code.toLowerCase().startsWith(`${statePrefix}${stateAbbreviation}`)
  })) {
    return true
  }

  // Check zipcode ranges (e.g. "10000-19999")
  if (zipCode && rule.zipcodes.some(zipRange => {
    if (zipRange.includes('-')) {
      const [start, end] = zipRange.split('-')
      const zipNum = parseInt(zipCode, 10)
      const startNum = parseInt(start, 10)
      const endNum = parseInt(end, 10)

      return !isNaN(zipNum) && !isNaN(startNum) && !isNaN(endNum) &&
        zipNum >= startNum && zipNum <= endNum
    }
    return false
  })) {
    return true
  }

  return false
}

/**
 * Gets applicable shipping rules for a product
 *
 * @param {Object} product - The product to check
 * @param {Object} address - The shipping address
 * @param {Array} allShippingRules - All available shipping rules
 * @returns {Array} Applicable shipping rules for this product, or empty array if none apply
 */
export const getApplicableRulesForProduct = (product, address, allShippingRules) => {
  if (!product || !address || !allShippingRules) return []

  // STRICT REQUIREMENT: If product has no shipping rule IDs, it can't be shipped at all
  // We don't create default options for products without explicitly assigned shipping rules
  if (!product.shippingRuleIds || !Array.isArray(product.shippingRuleIds) || product.shippingRuleIds.length === 0) {
    console.warn(`Product ${product.id} (${product.name}) has no shipping rules assigned and will be excluded from shipping options`)
    return []
  }

  // STRICT REQUIREMENT: Find ONLY shipping rules that explicitly apply to this product AND address
  // We never create fallback shipping options for products with no matching rules
  const applicableRules = allShippingRules.filter(rule => {
    return product.shippingRuleIds.includes(rule.id) &&
      isRuleValidForAddress(rule, address)
  })

  // Log if no rules apply
  if (applicableRules.length === 0) {
    console.warn(`Product ${product.id} (${product.name}) has shipping rules but none apply to address ${address.zip || address.zipCode} and will be excluded`)
  }

  return applicableRules
}

/**
 * Filter products by their shipping eligibility
 *
 * @param {Array} cartItems - Cart items to check
 * @param {Object} address - The shipping address
 * @param {Array} allShippingRules - All available shipping rules
 * @returns {Object} Object containing eligible and ineligible products
 */
export const filterShippableProducts = (cartItems, address, allShippingRules) => {
  if (!cartItems || !address || !allShippingRules) {
    return { eligible: [], ineligible: [] }
  }

  const eligible = []
  const ineligible = []

  cartItems.forEach(item => {
    const product = item.product || item

    const applicableRules = getApplicableRulesForProduct(
      product,
      address,
      allShippingRules,
    )

    if (applicableRules.length > 0) {
      eligible.push({
        ...item,
        applicableRules,
      })
    } else {
      ineligible.push(item)
    }
  })

  return { eligible, ineligible }
}