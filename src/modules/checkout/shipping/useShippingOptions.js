/**
 * Hook principal para gestionar opciones de envío
 * Integra todos los demás hooks y utilidades
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useShippingRules } from './useShippingRules.js'
import { prepareShippingOptions } from './shippingUtils.js'

/**
 * Normaliza un objeto de dirección para hacerlo compatible con nuestro módulo
 * @param {Object} address - Objeto de dirección que puede venir en diferentes formatos
 * @returns {Object} - Dirección normalizada
 */
const normalizeAddress = (address) => {
  if (!address) return null

  // Asegurarse de que los campos clave estén presentes
  return {
    id: address.id || `address_${Date.now()}`,
    state: address.state || address.estado || '',
    city: address.city || address.ciudad || '',
    zip: address.zip || address.zipcode || address.cp || '',
    colonia: address.colonia || address.colony || address.neighborhood || '',
    // Conservar cualquier otro campo que pueda estar presente
    ...address,
  }
}

/**
 * Normaliza los elementos del carrito para hacerlos compatibles con nuestro módulo
 * @param {Array} items - Elementos del carrito que pueden venir en diferentes formatos
 * @returns {Array} - Elementos del carrito normalizados
 */
const normalizeCartItems = (items) => {
  if (!items || !Array.isArray(items)) return []

  return items.map(item => {
    const product = item.product || item

    return {
      ...item,
      product: {
        ...product,
        // Asegurarse de que los campos clave estén presentes
        id: product.id || `product_${Date.now()}`,
        weight: parseFloat(product.weight || 0),
        price: parseFloat(product.price || 0),
        // Mantener el array de shippingRuleIds si existe
        shippingRuleIds: Array.isArray(product.shippingRuleIds) ? [...product.shippingRuleIds] :
          (product.shippingRuleId ? [product.shippingRuleId] : []),
      },
      quantity: parseInt(item.quantity || 1, 10),
    }
  })
}

/**
 * Verifica si dos direcciones son la misma
 * @param {Object} address1 - Primera dirección
 * @param {Object} address2 - Segunda dirección
 * @returns {boolean} - true si las direcciones son la misma
 */
const isSameAddress = (address1, address2) => {
  if (!address1 || !address2) return address1 === address2

  // Comparar por ID primero
  if (address1.id && address2.id) {
    return address1.id === address2.id
  }

  // Si no hay ID, comparar por campos clave
  return (
    address1.zip === address2.zip &&
    address1.state === address2.state &&
    address1.city === address2.city
  )
}

/**
 * Hook para gestionar opciones de envío en el checkout
 * @param {Array} cartItems - Ítems del carrito
 * @param {Object} selectedAddress - Dirección seleccionada
 * @returns {Object} Estado y funciones para opciones de envío
 */
export const useShippingOptions = (cartItems = [], selectedAddress = null) => {
  const { rules, loading: rulesLoading, error: rulesError } = useShippingRules()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [shippingOptions, setShippingOptions] = useState({
    packages: [],
    shippingCost: 0,
    unshippableItems: [],
  })

  // Usar refs para detectar cambios reales
  const prevAddressRef = useRef(null)
  const processingSemaphore = useRef(false)

  // Normalizar datos de entrada
  const normalizedAddress = useMemo(() => normalizeAddress(selectedAddress), [selectedAddress])
  const normalizedCartItems = useMemo(() => normalizeCartItems(cartItems), [cartItems])

  /**
   * Procesa las opciones de envío basadas en carrito, dirección y reglas
   */
  const processShippingOptions = useCallback(async () => {
    // Evitar procesamiento múltiple simultáneo
    if (processingSemaphore.current) return

    if (!normalizedCartItems.length || !normalizedAddress || rulesLoading) {
      return
    }

    // Verificar si la dirección ha cambiado
    const addressChanged = !isSameAddress(prevAddressRef.current, normalizedAddress)

    // Si no ha cambiado nada importante, no reprocesar
    if (!addressChanged && prevAddressRef.current && shippingOptions.packages.length > 0) {
      return
    }

    try {
      // Activar semáforo para evitar procesamiento múltiple
      processingSemaphore.current = true
      setProcessing(true)
      setError(null)

      console.log(`📍 Procesando opciones para dirección: ${normalizedAddress.zip} - ${normalizedAddress.state}`)

      const options = prepareShippingOptions(normalizedCartItems, normalizedAddress, rules)

      // Guardar la dirección actual como referencia
      prevAddressRef.current = normalizedAddress

      setShippingOptions(options)
    } catch (err) {
      console.error('Error al procesar opciones de envío:', err)
      setError(err.message || 'Error al procesar opciones de envío')
    } finally {
      setProcessing(false)
      processingSemaphore.current = false
    }
  }, [normalizedCartItems, normalizedAddress, rules, rulesLoading, shippingOptions.packages.length])

  // Procesar opciones cuando cambien los inputs relevantes
  useEffect(() => {
    // Agregar un pequeño retraso para evitar múltiples llamadas rápidas
    const timer = setTimeout(() => {
      processShippingOptions()
    }, 100)

    return () => clearTimeout(timer)
  }, [processShippingOptions])

  /**
   * Verifica si se pueden enviar todos los productos
   * @returns {boolean} true si todos los productos son enviables
   */
  const allProductsShippable = useMemo(() => {
    return shippingOptions.unshippableItems.length === 0
  }, [shippingOptions.unshippableItems])

  /**
   * Verifica si al menos un producto es enviable
   * @returns {boolean} true si al menos un producto es enviable
   */
  const hasShippableProducts = useMemo(() => {
    return shippingOptions.packages.length > 0
  }, [shippingOptions.packages])

  /**
   * Fuerza una actualización de las opciones de envío
   */
  const refreshShippingOptions = useCallback(() => {
    // Resetear la referencia de dirección para forzar un reprocesamiento
    prevAddressRef.current = null
    processShippingOptions()
  }, [processShippingOptions])

  return {
    // Estado
    shippingPackages: shippingOptions.packages,
    shippingCost: shippingOptions.shippingCost,
    unshippableItems: shippingOptions.unshippableItems,
    loading: rulesLoading || processing,
    error: error || rulesError,

    // Predicados
    allProductsShippable,
    hasShippableProducts,

    // Acciones
    refreshShippingOptions,
  }
}