/**
 * ShippingService - Servicio para gestionar opciones de envío
 *
 * Este servicio proporciona la funcionalidad principal para calcular y obtener
 * opciones de envío basadas en el carrito y la dirección del usuario.
 */

import { getActiveShippingZones } from '@modules/checkout/services/ShippingZonesService.js'
import { findBestShippingOptions } from '@modules/checkout/services/ShippingRulesGreedy.js'

/**
 * Obtiene todas las opciones de envío disponibles para un carrito y una dirección
 * @param {Array} cartItems - Items del carrito con información de productos
 * @param {Object} addressInfo - Información de la dirección del usuario
 * @param {Array} customRules - Reglas de envío personalizadas (opcional)
 * @returns {Promise<Array>} - Array de opciones de envío
 */
export const getShippingOptions = async (cartItems, addressInfo, customRules = null) => {
  try {
    // Validaciones básicas
    if (!cartItems?.length) {
      console.log('⚠️ No se proporcionaron productos en el carrito')
      return []
    }

    // Normalizar formato de dirección
    let postalCode = addressInfo?.postalCode || addressInfo?.zip || addressInfo?.zipcode || ''
    if (!postalCode) {
      console.log('⚠️ No se proporcionó código postal en la dirección:', addressInfo)
      throw new Error('Se requiere un código postal para calcular opciones de envío')
    }

    // Normalizar código postal
    postalCode = postalCode.toString().trim().replace(/[-\s]/g, '')

    const normalizedAddress = {
      ...addressInfo,
      postalCode,
      state: addressInfo?.state || addressInfo?.provincia || addressInfo?.estado || '',
      city: addressInfo?.city || addressInfo?.ciudad || addressInfo?.localidad || '',
      zip: postalCode,
    }

    // Usar reglas personalizadas o obtenerlas desde Firebase
    let shippingRules
    if (customRules && Array.isArray(customRules) && customRules.length > 0) {
      console.log(`📦 Usando ${customRules.length} reglas personalizadas proporcionadas`)
      shippingRules = customRules
    } else {
      // Obtener reglas de envío activas desde Firebase
      shippingRules = await getActiveShippingZones()
    }

    if (!shippingRules || shippingRules.length === 0) {
      console.warn('⚠️ No se encontraron reglas de envío activas')
      return []
    }

    // Usar los valores exactos de los productos
    const normalizedCartItems = cartItems.map(item => {
      const product = item.product || item
      return {
        ...item,
        product: {
          ...product,
          weight: parseFloat(product.weight || product.peso || 0),
        },
      }
    })

    // Log de información para diagnóstico
    console.log(`📦 Calculando opciones de envío para ${normalizedCartItems.length} productos`)
    console.log(`📍 Dirección de envío: CP ${normalizedAddress.postalCode}, ${normalizedAddress.state}`)

    // Utilizar el algoritmo Greedy para encontrar las mejores opciones
    const result = await findBestShippingOptions(normalizedCartItems, normalizedAddress, shippingRules)

    // Verificar resultado
    if (!result?.success) {
      console.warn(`⚠️ Error en cálculo de envío: ${result?.error || 'Error desconocido'}`)
      return []
    }

    // Obtener y retornar opciones de envío
    const options = result.options || []

    if (options.length > 0) {
      console.log(`✅ Se encontraron ${options.length} opciones de envío válidas`)
    } else {
      console.warn('⚠️ No se encontraron opciones de envío válidas')
    }

    // Devolver el objeto de resultado COMPLETO para que las capas superiores
    // puedan manejar el envío parcial y los productos no disponibles.
    // return options; // <-- Incorrecto, pierde información parcial
    return result // <-- Correcto, devuelve el objeto completo
  } catch (error) {
    console.error('❌ Error al obtener opciones de envío:', error)
    // En caso de error, devolver un objeto con success: false
    // return []; // <-- Devuelve array vacío, inconsistente
    return { success: false, error: error.message || 'Error interno', options: [] } // <-- Devuelve objeto de error
  }
}

// Clase ShippingService para mantener compatibilidad con código existente
class ShippingService {
  async getShippingOptions(cartItems, addressInfo, customRules = null) {
    return getShippingOptions(cartItems, addressInfo, customRules)
  }
}

// Instancia singleton para compatibilidad
export const shippingService = new ShippingService()

// Exportación por defecto
export default ShippingService

// Exportar funciones auxiliares
export { getActiveShippingZones }