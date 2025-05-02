import { useEffect, useMemo, useState } from 'react'
import { getShippingOptions } from '../services/ShippingService.js'

/**
 * Hook personalizado para manejar opciones de envío
 *
 * @param {Array} cartItems - Items del carrito
 * @param {Object} address - Dirección del usuario
 * @param {boolean} enabled - Si el hook debe ejecutarse
 * @returns {Object} Estado y funciones para manejar opciones de envío
 */
export const useShippingOptions_ = (cartItems = [], address = null, enabled = true) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)

  // Verificar si se puede buscar opciones de envío
  const canFetchOptions = useMemo(() => {
    return enabled &&
      cartItems?.length > 0 &&
      address &&
      (
        // Si tiene código postal o estado, es suficiente para buscar opciones
        (address.zip || address.postalCode || address.zipcode) ||
        (address.state || address.province || address.estado)
      )
  }, [cartItems, address, enabled])

  // Función para buscar opciones de envío
  const fetchOptions = async () => {
    if (!canFetchOptions) {
      if (enabled && (!address || (!address.zip && !address.postalCode))) {
        setError('Se requiere una dirección con código postal para calcular el envío')
      }
      setOptions([])
      setSelectedOption(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const shippingOptions = await getShippingOptions(cartItems, address)

      setOptions(shippingOptions || [])

      // Si hay opciones disponibles, seleccionar la primera por defecto
      if (shippingOptions && shippingOptions.length > 0) {
        setSelectedOption(shippingOptions[0].id)
      } else {
        setSelectedOption(null)
        if (enabled) {
          setError('No hay opciones de envío disponibles para esta dirección')
        }
      }
    } catch (err) {
      console.error('Error al obtener opciones de envío:', err)
      setError(err.message || 'Error al calcular opciones de envío')
      setOptions([])
      setSelectedOption(null)
    } finally {
      setLoading(false)
    }
  }

  // Efecto para buscar opciones cuando cambian los parámetros
  useEffect(() => {
    if (canFetchOptions) {
      fetchOptions()
    } else {
      // Limpiar opciones si no se pueden buscar
      setOptions([])
      setSelectedOption(null)

      if (enabled && cartItems?.length > 0 && !address) {
        setError('Se requiere una dirección para calcular opciones de envío')
      } else {
        setError(null)
      }
    }
  }, [canFetchOptions, JSON.stringify(cartItems), JSON.stringify(address)])

  // Función para seleccionar opción de envío
  const selectOption = (optionId) => {
    if (optionId && options.some(opt => opt.id === optionId)) {
      setSelectedOption(optionId)
      return true
    }
    return false
  }

  // Obtener la opción seleccionada
  const selectedShippingOption = useMemo(() => {
    if (!selectedOption || !options.length) return null
    return options.find(opt => opt.id === selectedOption) || null
  }, [selectedOption, options])

  // Reiniciar la búsqueda de opciones
  const refreshOptions = () => {
    fetchOptions()
  }

  return {
    loading,
    error,
    options,
    selectedOption,
    selectOption,
    selectedShippingOption,
    refreshOptions,
    hasOptions: options.length > 0,
  }
}

export default useShippingOptions_