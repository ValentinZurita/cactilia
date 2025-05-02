import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchShippingRules } from '../../../admin/shipping/api/shippingApi'
import { RULE_CONFIG_FALLBACKS } from '../constants/index.js'
import {
  filterShippableProducts,
  calculateItemPrice,
  groupIntoPackages,
  calculateTotalShippingCost,
} from '../utils/index.js'

/**
 * Custom hook to handle shipping calculations and options
 *
 * @param {Array} cartItems - Items in the cart
 * @param {Object} selectedAddress - Selected shipping address
 * @returns {Object} Shipping data and functions
 */
export const useShipping = (cartItems = [], selectedAddress = null) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shippingRules, setShippingRules] = useState([])
  const [availableOptions, setAvailableOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)

  // Filter products by shipping eligibility when address or rules change
  const {
    eligible: eligibleProducts,
    ineligible: ineligibleProducts,
  } = useMemo(() => {
    if (!selectedAddress || !shippingRules.length || !cartItems.length) {
      return { eligible: [], ineligible: [] }
    }

    return filterShippableProducts(cartItems, selectedAddress, shippingRules)
  }, [cartItems, selectedAddress, shippingRules])

  // Calculate order subtotal using ONLY eligible products
  // STRICT REQUIREMENT: Products that can't be shipped are completely excluded from calculations
  const orderSubtotal = useMemo(() => {
    // If there are no eligible products, return 0
    if (!eligibleProducts || eligibleProducts.length === 0) return 0

    // Calculate subtotal using ONLY products that can be shipped
    return eligibleProducts.reduce((total, item) => {
      return total + calculateItemPrice(item)
    }, 0)
  }, [eligibleProducts])

  // Fetch all shipping rules on component mount
  useEffect(() => {
    const loadShippingRules = async () => {
      try {
        setLoading(true)
        const rules = await fetchShippingRules(true) // Only active rules
        setShippingRules(rules || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching shipping rules:', err)
        setError('Error al cargar opciones de envío.')
      } finally {
        setLoading(false)
      }
    }

    loadShippingRules()
  }, [])

  // Generate shipping options based on eligible products and rules
  useEffect(() => {
    if (!selectedAddress || !eligibleProducts.length) {
      setAvailableOptions([])
      setSelectedOption(null)
      return
    }

    // Group products by shipping rule
    const ruleProductsMap = new Map()
    eligibleProducts.forEach(item => {
      (item.applicableRules || []).forEach(rule => {
        if (!ruleProductsMap.has(rule.id)) {
          ruleProductsMap.set(rule.id, [])
        }
        ruleProductsMap.get(rule.id).push(item)
      })
    })

    // Create shipping options for each rule
    const options = []

    ruleProductsMap.forEach((products, ruleId) => {
      const rule = shippingRules.find(r => r.id === ruleId)
      if (!rule) return

      // Package products according to rule constraints
      const packages = groupIntoPackages(products, rule)

      // Calculate shipping cost
      const shippingCost = calculateTotalShippingCost(packages, rule, orderSubtotal)
      const isFree = shippingCost === 0

      // Delivery time from rule
      const minDays = rule.minDays || RULE_CONFIG_FALLBACKS.DELIVERY_TIME.minDays
      const maxDays = rule.maxDays || RULE_CONFIG_FALLBACKS.DELIVERY_TIME.maxDays
      const deliveryTime = `${minDays}-${maxDays} días`

      // Create option
      options.push({
        id: `option-${ruleId}`,
        ruleId,
        name: rule.nombre || `Opción de envío ${ruleId}`,
        price: parseFloat(rule.precio || 0),
        calculatedCost: shippingCost,
        isFree,
        deliveryTime,
        packages,
        products,
      })
    })

    // Sort options by price (free first, then lowest price)
    options.sort((a, b) => {
      if (a.isFree && !b.isFree) return -1
      if (!a.isFree && b.isFree) return 1
      return a.calculatedCost - b.calculatedCost
    })

    setAvailableOptions(options)

    // Auto-select first option if none selected or previous selection is no longer available
    if (!selectedOption || !options.some(opt => opt.id === selectedOption?.id)) {
      if (options.length > 0) {
        setSelectedOption(options[0])
      } else {
        setSelectedOption(null)
      }
    }
  }, [eligibleProducts, shippingRules, selectedAddress, orderSubtotal, selectedOption])

  // Handle selecting a shipping option
  const selectShippingOption = useCallback((option) => {
    setSelectedOption(option)
  }, [])

  // Return shipping data and functions
  return {
    loading,
    error,
    availableOptions,
    selectedOption,
    selectShippingOption,
    eligibleProducts,
    ineligibleProducts,
    hasShippingRestrictions: ineligibleProducts.length > 0,
    isAddressComplete: !!selectedAddress,
    orderSubtotal,
  }
}