/**
 * Custom hook for fetching and managing shipping options
 */
import { useCallback, useEffect, useState } from 'react'
import { getShippingOptions } from '../checkout/services/shipping/index.js'
import { calculateShippingOptionsGroups } from '../utils/shippingUtils_.js'

/**
 * Hook for loading and processing shipping options
 *
 * @param {Object} userAddress - The user's shipping address
 * @param {Array} cartItems - Items in the user's cart
 * @returns {Object} - Shipping options state and actions
 */
const useShippingOptions2 = (userAddress, cartItems) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rawOptions, setRawOptions] = useState([])
  const [optionGroups, setOptionGroups] = useState([])

  /**
   * Reload shipping options from the service
   */
  const reloadOptions = useCallback(async () => {
    // Don't attempt to load if address or cart is empty
    if (!userAddress || !cartItems || cartItems.length === 0) {
      console.log('📦 No se cargaron opciones de envío: dirección o carrito vacíos')
      setRawOptions([])
      setOptionGroups([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 Cargando opciones de envío para dirección:', userAddress)
      console.log('🛒 Productos en carrito:', cartItems.length)

      // Get options from service
      const options = await getShippingOptions(cartItems, userAddress)
      console.log('✅ Opciones de envío obtenidas:', options)
      setRawOptions(options)

      if (!options || options.length === 0) {
        console.warn('⚠️ No se encontraron opciones de envío disponibles')
        setError('No hay opciones de envío disponibles para esta dirección.')
        setOptionGroups([])
        return
      }

      // Process options into groups
      const groups = calculateShippingOptionsGroups(options)
      console.log('📊 Grupos de opciones de envío:', groups)
      setOptionGroups(groups)
    } catch (err) {
      console.error('❌ Error loading shipping options:', err)
      setError(err.message || 'Failed to load shipping options')
      setRawOptions([])
      setOptionGroups([])
    } finally {
      setIsLoading(false)
    }
  }, [userAddress, cartItems])

  // Load options when address or cart changes
  useEffect(() => {
    reloadOptions()
  }, [reloadOptions])

  return {
    isLoading,
    error,
    rawOptions,
    optionGroups,
    reloadOptions,
    hasOptions: rawOptions.length > 0,
  }
}

// Exportar como exportación nombrada para que pueda ser importada como { useShippingOptions2 }
export { useShippingOptions2 }
// Mantener export default para compatibilidad con código existente
export default useShippingOptions2