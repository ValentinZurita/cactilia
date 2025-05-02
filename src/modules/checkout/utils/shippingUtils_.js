/**
 * Utilidades para operaciones relacionadas con opciones de envío
 */

import {
  EXPRESS_TERMS,
  GROUP_PRIORITIES,
  LOCAL_TERMS,
  NATIONAL_TERMS,
  SHIPPING_TYPES,
} from '../constants/ShippingConstants2.js'

/**
 * Helper para obtener constantes de envío
 * Mantiene compatibilidad si el archivo de constantes no está disponible
 */
const getConstants = () => {
  try {
    // Try to get constants from the constants file
    return {
      SHIPPING_TYPES,
      GROUP_PRIORITIES,
      EXPRESS_TERMS,
      LOCAL_TERMS,
      NATIONAL_TERMS,
    }
  } catch (error) {
    // Fallback constants if the file can't be loaded
    return {
      SHIPPING_TYPES: {
        EXPRESS: 'express',
        LOCAL: 'local',
        NATIONAL: 'national',
        INTERNATIONAL: 'international',
        STANDARD: 'standard',
      },
      GROUP_PRIORITIES: {
        express: 10,
        local: 20,
        national: 30,
        international: 40,
        standard: 50,
      },
      EXPRESS_TERMS: ['express', 'rápido', 'urgente', '24h'],
      LOCAL_TERMS: ['local', 'ciudad', 'pickup', 'recogida'],
      NATIONAL_TERMS: ['nacional', 'estándar', 'normal'],
    }
  }
}

/**
 * Formatea un precio para mostrar
 * @param {number} price - Precio a formatear
 * @param {string} currency - Moneda (default: MXN)
 * @returns {string} Precio formateado (ej: $123.45)
 */
export const formatPrice = (price, currency = 'MXN') => {
  if (price === undefined || price === null) return '$0.00'

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

/**
 * Obtiene el nombre a mostrar para una opción de envío
 * @param {Object} option - Opción de envío
 * @returns {string} Nombre para mostrar
 */
export const getDisplayName = (option) => {
  if (!option) return ''

  // Prioridad a nombre personalizado
  if (option.name) return option.name

  // Combinar carrier y service si están disponibles
  if (option.carrierName && option.carrierLabel) {
    return `${option.carrierName} - ${option.carrierLabel}`
  }

  // Solo carrier
  if (option.carrier) return option.carrier

  // Fallback
  return 'Opción de envío'
}

/**
 * Calcula y formatea el tiempo de entrega para una opción
 * @param {Object} option - Opción de envío
 * @returns {string} Texto de tiempo de entrega (ej: "3-5 días hábiles")
 */
export const calculateDeliveryTime = (option) => {
  if (!option) return ''

  // Si ya tiene un tiempo de entrega predefinido
  if (option.deliveryTime) return option.deliveryTime

  // Construir a partir de min y max days
  const minDays = option.minDays || 3
  const maxDays = option.maxDays || 7

  // Si son iguales, mostrar solo un número
  if (minDays === maxDays) {
    return `${minDays} día${minDays !== 1 ? 's' : ''} hábiles`
  }

  // Rango
  return `${minDays}-${maxDays} días hábiles`
}

/**
 * Determina si una opción de envío es gratuita
 * @param {Object} option - Opción de envío
 * @returns {boolean} true si es envío gratuito
 */
export const isFreeShipping = (option) => {
  if (!option) return false

  // Explícitamente marcado como gratuito
  if (option.isFree === true) return true

  // Precio cero
  if (option.price === 0 || option.totalCost === 0) return true

  return false
}

/**
 * Extrae el precio total de una opción
 * @param {Object} option - Opción de envío
 * @returns {number} Precio total
 */
export const getTotalPrice = (option) => {
  if (!option) return 0

  // Si es gratuito, retornar 0
  if (isFreeShipping(option)) return 0

  // Buscar el precio en diferentes propiedades posibles
  return option.price || option.totalCost || option.calculatedCost || 0
}

/**
 * Verifica si una opción de envío cubre todos los productos del carrito
 * @param {Object} option - Opción de envío
 * @param {Array} cartItems - Items del carrito
 * @returns {boolean} true si cubre todos los productos
 */
export const coversAllProducts = (option, cartItems) => {
  if (!option || !cartItems || cartItems.length === 0) return false

  // Si ya tiene la propiedad coversAllProducts, usarla
  if (option.coversAllProducts !== undefined) return option.coversAllProducts
  if (option.allProductsCovered !== undefined) return option.allProductsCovered

  // Si es una combinación y está marcada como completa
  if (option.combination?.isComplete) return true

  // Verificar cobertura de productos
  if (option.covered_products && Array.isArray(option.covered_products)) {
    const coveredSet = new Set(option.covered_products)

    // Verificar si todos los productos del carrito están cubiertos
    return cartItems.every(item => {
      const product = item.product || item
      return coveredSet.has(product.id)
    })
  }

  // Por defecto, asumir que no cubre todo
  return false
}

/**
 * Calculates the total price for a group of products
 * @param {Array} items Cart items in the group
 * @returns {number} Total price of the group
 */
export const calculateGroupTotal = (items) => {
  if (!items || items.length === 0) return 0

  return items.reduce((total, item) => {
    const product = item.product || item
    const price = parseFloat(product.price || 0)
    const quantity = parseInt(item.quantity || 1, 10)
    return total + (price * quantity)
  }, 0)
}

/**
 * Format shipping cost with appropriate currency symbol
 * @param {number} cost - The shipping cost to format
 * @param {boolean} isFree - Whether shipping is free
 * @returns {string} Formatted price string
 */
export const formatShippingCost = (cost, isFree = false) => {
  if (isFree || cost === 0) {
    return 'FREE'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cost)
}

/**
 * Check if shipping options data is valid
 * @param {Array} shippingGroups - Array of shipping option groups
 * @returns {boolean} Whether the shipping options are valid
 */
export const hasValidOptions = (shippingGroups) => {
  if (!shippingGroups || !Array.isArray(shippingGroups) || shippingGroups.length === 0) {
    return false
  }

  return shippingGroups.some(group =>
    group &&
    group.options &&
    Array.isArray(group.options) &&
    group.options.length > 0,
  )
}

/**
 * Identifica el tipo de envío basado en el nombre y descripción
 * @param {string} name - Nombre de la opción de envío
 * @param {string} description - Descripción de la opción
 * @returns {string} - Tipo identificado
 */
export const identifyShippingType = (name, description) => {
  const { SHIPPING_TYPES, EXPRESS_TERMS, LOCAL_TERMS, NATIONAL_TERMS } = getConstants()

  // Convert to lowercase string for comparison
  const searchText = `${name || ''} ${description || ''}`.toLowerCase()

  // Check for express terms
  if (EXPRESS_TERMS.some(term => searchText.includes(term))) {
    return SHIPPING_TYPES.EXPRESS
  }

  // Check for local terms
  if (LOCAL_TERMS.some(term => searchText.includes(term))) {
    return SHIPPING_TYPES.LOCAL
  }

  // Check for national terms
  if (NATIONAL_TERMS.some(term => searchText.includes(term))) {
    return SHIPPING_TYPES.NATIONAL
  }

  // If price is very low or 0, likely local or pickup
  if (searchText.includes('gratis') || searchText.includes('free')) {
    return SHIPPING_TYPES.LOCAL
  }

  // Default to standard national shipping
  return SHIPPING_TYPES.STANDARD
}

/**
 * Agrupa las opciones de envío por tipo para mostrarlas mejor organizadas en la UI
 * @param {Array} options - Opciones de envío a agrupar
 * @returns {Array} - Grupos de opciones de envío
 */
export const calculateShippingOptionsGroups = (options) => {
  // Return empty array if no options provided
  if (!options || !Array.isArray(options) || options.length === 0) {
    console.warn('⚠️ No hay opciones de envío para agrupar')
    return []
  }

  console.log('🚚 Agrupando opciones de envío:', options.length)

  try {
    // Get constants from shipping constants file
    const { SHIPPING_TYPES, GROUP_PRIORITIES } = getConstants()

    // Map options by type (express, local, national)
    const typeMap = {}

    options.forEach(option => {
      const type = identifyShippingType(option.name, option.description)

      if (!typeMap[type]) {
        typeMap[type] = []
      }

      typeMap[type].push(option)
    })

    // Sort options in each group by price, free options first
    Object.keys(typeMap).forEach(type => {
      typeMap[type].sort((a, b) => {
        // Free shipping always at the top
        if ((a.isFree || a.price === 0) && !(b.isFree || b.price === 0)) return -1
        if (!(a.isFree || a.price === 0) && (b.isFree || b.price === 0)) return 1

        // Sort by price (lowest first)
        return a.price - b.price
      })
    })

    // Convert map to array of groups
    const groups = Object.keys(typeMap).map(type => ({
      type,
      priority: GROUP_PRIORITIES[type] || 100,
      options: typeMap[type],
    }))

    // Sort groups by priority
    groups.sort((a, b) => a.priority - b.priority)

    console.log('✅ Grupos de envío calculados:', groups.length)
    return groups
  } catch (error) {
    console.error('❌ Error al agrupar opciones de envío:', error)

    // Return a single group with all options as fallback
    return [{
      type: 'all',
      priority: 1,
      options: [...options],
    }]
  }
}

/**
 * Calculate total shipping cost for a selection of options
 * @param {Array} selectedOptions The selected shipping options
 * @returns {Object} Total cost and whether all shipping is free
 */
export const calculateTotalShippingCost = (selectedOptions) => {
  if (!selectedOptions || selectedOptions.length === 0) {
    return { totalCost: 0, allFree: true }
  }

  let totalCost = 0
  let allFree = true

  selectedOptions.forEach(option => {
    const cost = parseFloat(option.price || option.totalCost || 0)
    totalCost += cost

    if (cost > 0) {
      allFree = false
    }
  })

  return {
    totalCost,
    allFree,
  }
}

/**
 * Calculate estimated delivery date based on shipping type and processing time
 * @param {string} shippingType - Type of shipping
 * @param {number} processingDays - Number of processing days
 * @returns {string} Estimated delivery date range
 */
export const calculateEstimatedDelivery = (shippingType, processingDays = 1) => {
  const today = new Date()
  let minDays = 1
  let maxDays = 3

  switch (shippingType) {
    case SHIPPING_TYPES.EXPRESS:
      minDays = 1
      maxDays = 2
      break
    case SHIPPING_TYPES.LOCAL:
      minDays = 1
      maxDays = 3
      break
    case SHIPPING_TYPES.NATIONAL:
      minDays = 3
      maxDays = 7
      break
    case SHIPPING_TYPES.INTERNATIONAL:
      minDays = 7
      maxDays = 21
      break
    default:
      minDays = 3
      maxDays = 5
  }

  // Add processing days
  minDays += processingDays
  maxDays += processingDays

  // Calculate dates
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + minDays)

  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + maxDays)

  // Format dates
  const options = { month: 'short', day: 'numeric' }
  const minDateStr = minDate.toLocaleDateString('en-US', options)
  const maxDateStr = maxDate.toLocaleDateString('en-US', options)

  return `${minDateStr} - ${maxDateStr}`
}

/**
 * Filter shipping options based on user preferences
 * @param {Array} options - Array of shipping options
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered shipping options
 */
export const filterShippingOptions = (options, filters = {}) => {
  if (!options || !Array.isArray(options)) {
    return []
  }

  return options.filter(option => {
    // Filter by maximum price
    if (filters.maxPrice && option.price > filters.maxPrice) {
      return false
    }

    // Filter by shipping type
    if (filters.types && filters.types.length > 0) {
      const type = option.type || identifyShippingType(option.name, option.description)
      if (!filters.types.includes(type)) {
        return false
      }
    }

    // Filter by keywords in name or description
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      const name = (option.name || '').toLowerCase()
      const description = (option.description || '').toLowerCase()

      if (!name.includes(keyword) && !description.includes(keyword)) {
        return false
      }
    }

    return true
  })
}