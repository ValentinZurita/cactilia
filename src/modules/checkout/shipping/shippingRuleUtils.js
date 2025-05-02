/**
 * Utility functions for working with shipping rules
 */
import { COVERAGE_TYPES } from '../constants/index.js'

/**
 * Checks if a shipping rule is valid for a specific address
 *
 * @param {Object} rule - The shipping rule to check
 * @param {Object} address - The address to check against
 * @returns {boolean} Whether the rule is valid for the address
 */
export const isRuleValidForAddress = (rule, address) => {
  if (!rule || !address) return false

  // If rule has no zipcodes, it can't be applied
  if (!rule.zipcodes || rule.zipcodes.length === 0) return false

  // Extract address data, handling different property names
  const zipCode = address.zip || address.zipCode || address.postalCode || ''
  const state = address.state || ''

  // Check if rule has national coverage
  if (rule.zipcodes.includes(COVERAGE_TYPES.NATIONAL)) {
    return true
  }

  // Check if rule includes the specific zipcode
  if (zipCode && rule.zipcodes.includes(zipCode)) {
    return true
  }

  // Check state coverage (formato: "estado_XXX")
  const stateCode = state.toUpperCase()
  if (stateCode && rule.zipcodes.some(code =>
    code.startsWith(`${COVERAGE_TYPES.STATE_PREFIX}${stateCode}`),
  )) {
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