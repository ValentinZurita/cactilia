import { useEffect, useState } from 'react'
import { getShippingRuleById } from '../../admin/services/shippingRuleService.js'

/**
 * Hook para gestionar las opciones de envío utilizando el sistema mejorado
 * @param {Array} cartItems - Items en el carrito
 * @param {string} selectedAddressId - ID de la dirección seleccionada
 * @returns {Object} - Opciones de envío y funciones relacionadas
 */
export const useEfficientShipping = (cartItems, selectedAddressId) => {
  const [loading, setLoading] = useState(true)
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [shippingRules, setShippingRules] = useState([])
  const [userAddress, setUserAddress] = useState(null)
  const [error, setError] = useState(null)

  // Get user address based on selected address ID
  useEffect(() => {
    if (!selectedAddressId) {
      setUserAddress(null)
      return
    }

    const getUserAddress = async () => {
      try {
        // Get address from localStorage (in production, this would be from your database)
        const addresses = JSON.parse(localStorage.getItem('userAddresses') || '[]')
        const address = addresses.find(addr => addr.id === selectedAddressId)

        if (address) {
          setUserAddress(address)
        }
      } catch (error) {
        console.error('Error al obtener dirección:', error)
      }
    }

    getUserAddress()
  }, [selectedAddressId])

  // Load shipping rules based on products in cart
  useEffect(() => {
    if (!cartItems?.length) {
      setShippingRules([])
      setLoading(false)
      return
    }

    const fetchShippingRules = async () => {
      setLoading(true)
      setError(null)

      try {
        // 1. Get all shipping rule IDs from products
        const shippingRuleIds = new Set()

        cartItems.forEach(item => {
          const product = item.product || item

          if (product.shippingRuleId) {
            shippingRuleIds.add(product.shippingRuleId)
          }

          if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds)) {
            product.shippingRuleIds.forEach(id => shippingRuleIds.add(id))
          }
        })

        // 2. Fetch rules from Firebase
        const rulesToFetch = Array.from(shippingRuleIds)

        if (rulesToFetch.length === 0) {
          // No shipping rules found for products
          console.warn('No se encontraron reglas de envío para los productos en el carrito')
          setError('No se encontraron reglas de envío para los productos seleccionados')
          setShippingRules([])
          setLoading(false)
          return
        }

        // Log the shipping rule IDs we're trying to fetch
        console.log('🚚 Intentando obtener reglas de envío:', rulesToFetch)

        const rulesPromises = rulesToFetch.map(id => getShippingRuleById(id))
        const rulesResults = await Promise.all(rulesPromises)

        // 3. Filter valid rules
        const validRules = rulesResults
          .filter(result => result.ok && result.data)
          .map(result => result.data)

        if (validRules.length === 0) {
          console.warn('No se pudieron obtener reglas de envío válidas')
          setError('No se pudieron obtener reglas de envío válidas para los productos seleccionados')
        }

        console.log('✅ Reglas de envío obtenidas:', validRules.length)
        setShippingRules(validRules)
      } catch (error) {
        console.error('Error al obtener reglas de envío:', error)
        setError(`Error al obtener reglas de envío: ${error.message}`)
        setShippingRules([])
      } finally {
        setLoading(false)
      }
    }

    fetchShippingRules()
  }, [cartItems])

  return {
    loading,
    options,
    selectedOption,
    shippingRules,
    userAddress,
    error,
  }
}

export default useEfficientShipping