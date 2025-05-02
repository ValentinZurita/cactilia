import { useEffect, useState } from 'react'
import { getShippingOptions } from '../checkout/services/shipping/index.js'
import {
  EXPRESS_TERMS,
  GROUP_PRIORITIES,
  LOCAL_TERMS,
  MAX_OPTIONS_PER_GROUP,
  NATIONAL_TERMS,
  SHIPPING_ICONS,
  SHIPPING_TYPES,
} from '../constants/ShippingConstants2.js'

/**
 * Hook personalizado para manejar la carga y agrupación de opciones de envío
 *
 * @param {Array} cartItems - Artículos del carrito
 * @param {Object} userAddress - Dirección del usuario
 * @param {Array} initialOptions - Opciones de envío iniciales (opcional)
 * @returns {Object} Estado y funciones para manejar opciones de envío
 */
const useShippingGroups = (cartItems, userAddress, initialOptions = []) => {
  // Estados
  const [shippingOptions, setShippingOptions] = useState(initialOptions)
  const [groupedOptions, setGroupedOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar opciones cuando cambian los items o la dirección
  useEffect(() => {
    // Si no hay dirección o items, no hacemos nada
    if (!userAddress || !cartItems || cartItems.length === 0) {
      return
    }

    // Función para cargar opciones
    const loadShippingOptions = async () => {
      setLoading(true)
      setError(null)

      try {
        // Si ya tenemos opciones iniciales, las usamos
        if (initialOptions && initialOptions.length > 0) {
          setShippingOptions(initialOptions)
          processShippingOptions(initialOptions)
        } else {
          // Sino, obtenemos nuevas opciones del servicio
          const options = await getShippingOptions(cartItems, userAddress)
          setShippingOptions(options)
          processShippingOptions(options)
        }
      } catch (err) {
        console.error('Error cargando opciones de envío:', err)
        setError({
          message: 'No pudimos cargar las opciones de envío. Por favor, intenta de nuevo.',
          originalError: err,
        })
      } finally {
        setLoading(false)
      }
    }

    loadShippingOptions()
  }, [cartItems, userAddress, initialOptions])

  // Procesar y agrupar opciones de envío
  const processShippingOptions = (options) => {
    if (!options || options.length === 0) {
      setGroupedOptions([])
      return
    }

    // Evitar duplicados con este conjunto
    const processedOptionIds = new Set()

    // Crear grupos dinámicos basados en los datos
    const groups = []

    // Primero las opciones fallback
    const fallbackOptions = options.filter(option => option.isFallback)
    if (fallbackOptions.length > 0) {
      fallbackOptions.forEach(option => processedOptionIds.add(option.id || option.optionId))

      groups.push({
        id: SHIPPING_TYPES.FALLBACK,
        title: 'Opción de Envío',
        subtitle: 'Esta opción garantiza la entrega de todos tus productos',
        options: fallbackOptions,
        icon: SHIPPING_ICONS.FALLBACK,
        priority: GROUP_PRIORITIES.FALLBACK,
      })
    }

    // Opciones nacionales
    const nationalOptions = options.filter(option =>
      NATIONAL_TERMS.some(term => {
        return (option.type && option.type.toLowerCase().includes(term)) ||
          (option.zoneName && option.zoneName.toLowerCase().includes(term))
      }),
    )
      .filter(option => !processedOptionIds.has(option.id || option.optionId))

    if (nationalOptions.length > 0) {
      nationalOptions.forEach(option => processedOptionIds.add(option.id || option.optionId))

      groups.push({
        id: SHIPPING_TYPES.NATIONAL,
        title: 'Envío Nacional',
        subtitle: 'Opciones para envío a nivel nacional',
        options: nationalOptions.slice(0, MAX_OPTIONS_PER_GROUP),
        icon: SHIPPING_ICONS.NATIONAL,
        priority: GROUP_PRIORITIES.NATIONAL,
      })
    }

    // Opciones locales
    const localOptions = options.filter(option =>
      LOCAL_TERMS.some(term => {
        return (option.type && option.type.toLowerCase().includes(term)) ||
          (option.zoneName && option.zoneName.toLowerCase().includes(term))
      }),
    )
      .filter(option => !processedOptionIds.has(option.id || option.optionId))

    if (localOptions.length > 0) {
      localOptions.forEach(option => processedOptionIds.add(option.id || option.optionId))

      groups.push({
        id: SHIPPING_TYPES.LOCAL,
        title: 'Entrega Local',
        subtitle: 'Opciones para entrega en tu localidad',
        options: localOptions.slice(0, MAX_OPTIONS_PER_GROUP),
        icon: SHIPPING_ICONS.LOCAL,
        priority: GROUP_PRIORITIES.LOCAL,
      })
    }

    // Combinaciones especiales
    const combinationOptions = options.filter(option => option.combination && option.combination.options)
      .filter(option => !processedOptionIds.has(option.id || option.optionId))

    if (combinationOptions.length > 0) {
      combinationOptions.forEach(option => processedOptionIds.add(option.id || option.optionId))

      groups.push({
        id: SHIPPING_TYPES.COMBINED,
        title: 'Opciones Combinadas',
        subtitle: 'Combinaciones de servicios para entrega completa',
        options: combinationOptions.slice(0, MAX_OPTIONS_PER_GROUP),
        icon: SHIPPING_ICONS.COMBINED,
        priority: GROUP_PRIORITIES.COMBINED,
      })
    }

    // Opciones express
    const expressOptions = options.filter(option =>
      EXPRESS_TERMS.some(term => {
        return option.express ||
          (option.name && option.name.toLowerCase().includes(term)) ||
          (option.carrierLabel && option.carrierLabel.toLowerCase().includes(term))
      }),
    )
      .filter(option => !processedOptionIds.has(option.id || option.optionId))

    if (expressOptions.length > 0) {
      expressOptions.forEach(option => processedOptionIds.add(option.id || option.optionId))

      groups.push({
        id: SHIPPING_TYPES.EXPRESS,
        title: 'Entrega Express',
        subtitle: 'Opciones para entrega rápida',
        options: expressOptions.slice(0, MAX_OPTIONS_PER_GROUP),
        icon: SHIPPING_ICONS.EXPRESS,
        priority: GROUP_PRIORITIES.EXPRESS,
      })
    }

    // Opciones restantes
    const otherOptions = options.filter(option =>
      !processedOptionIds.has(option.id || option.optionId),
    )

    if (otherOptions.length > 0) {
      groups.push({
        id: SHIPPING_TYPES.OTHER,
        title: 'Más Opciones',
        subtitle: 'Otras opciones de envío disponibles',
        options: otherOptions.slice(0, MAX_OPTIONS_PER_GROUP),
        icon: SHIPPING_ICONS.OTHER,
        priority: GROUP_PRIORITIES.OTHER,
      })
    }

    // Ordenar grupos por prioridad
    groups.sort((a, b) => b.priority - a.priority)

    setGroupedOptions(groups)
  }

  // Encontrar la opción más económica
  const findCheapestOption = () => {
    if (!shippingOptions || shippingOptions.length === 0) {
      return null
    }

    return shippingOptions.reduce((cheapest, current) => {
      const currentPrice = current.price || current.totalCost || Number.MAX_SAFE_INTEGER
      const cheapestPrice = cheapest.price || cheapest.totalCost || Number.MAX_SAFE_INTEGER

      return currentPrice < cheapestPrice ? current : cheapest
    }, shippingOptions[0])
  }

  // Recargar opciones manualmente
  const reloadOptions = async () => {
    if (!userAddress || !cartItems || cartItems.length === 0) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const options = await getShippingOptions(cartItems, userAddress)
      setShippingOptions(options)
      processShippingOptions(options)
    } catch (err) {
      console.error('Error recargando opciones de envío:', err)
      setError({
        message: 'No pudimos cargar las opciones de envío. Por favor, intenta de nuevo.',
        originalError: err,
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    shippingOptions,
    groupedOptions,
    loading,
    error,
    reloadOptions,
    findCheapestOption,
  }
}

export default useShippingGroups