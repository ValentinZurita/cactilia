/**
 * Servicio para gestionar opciones de envío en el checkout
 * Se encarga de obtener las opciones de envío disponibles para una dirección y un carrito
 */
import { shippingService } from '../../../shop/features/checkout/services/shipping/ShippingService'
import debugShipping from '../utils/ShippingDebugger.js'
import { fetchAllShippingRules } from './shippingRulesService.js'
import { normalizeShippingRules } from '../utils/RuleFormatNormalizer.js'

/**
 * Obtiene un valor de configuración de paquete de una regla
 * @param {Object} rule - Regla de envío
 * @param {string} property - Propiedad a buscar
 * @returns {*} - Valor de la propiedad o null
 */
const getPackageLimit = (rule, property) => {
  if (!rule) return null

  // Buscar en la configuración de paquetes de la regla
  if (rule.configuracion_paquetes && rule.configuracion_paquetes[property] !== undefined) {
    return rule.configuracion_paquetes[property]
  }

  // Buscar en la primera opción de mensajería si existe
  if (rule.opciones_mensajeria &&
    rule.opciones_mensajeria.length > 0 &&
    rule.opciones_mensajeria[0].configuracion_paquetes &&
    rule.opciones_mensajeria[0].configuracion_paquetes[property] !== undefined) {
    return rule.opciones_mensajeria[0].configuracion_paquetes[property]
  }

  return null
}

/**
 * Clase ShippingService para el nuevo módulo de envío
 * Actúa como adaptador para el servicio existente
 */
class CheckoutShippingService {
  /**
   * Obtiene las opciones de envío para una dirección y un carrito
   * @param {Object} address - Dirección de envío
   * @param {Array} cartItems - Ítems del carrito con productos
   * @returns {Promise<Array>} - Opciones de envío disponibles
   */
  async getShippingOptions(address, cartItems) {
    try {
      // Validar los parámetros
      if (!address) {
        console.error('No se proporcionó una dirección para calcular envío')
        throw new Error('Se requiere una dirección para calcular opciones de envío')
      }

      // Verificar código postal
      const hasPostalCode = address.zip || address.zipcode || address.postalCode || address.cp
      if (!hasPostalCode) {
        console.error('La dirección no tiene código postal:', address)
        throw new Error('Se requiere un código postal para calcular opciones de envío')
      }

      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        console.error('No se proporcionaron productos en el carrito')
        throw new Error('Se requieren productos en el carrito para calcular envío')
      }

      console.log(`🚚 Obteniendo opciones de envío para ${cartItems.length} productos`)

      // Obtener reglas de envío para diagnóstico detallado
      const originalRules = await fetchAllShippingRules()

      // Normalizar las reglas al formato esperado por el algoritmo Greedy
      const normalizedRules = normalizeShippingRules(originalRules, address)

      console.log(`🔄 Reglas normalizadas: ${normalizedRules.length}`)
      normalizedRules.forEach(rule => {
        console.log(`🛡️ Regla ${rule.id}: tipo=${rule.coverage_type || rule.tipo_cobertura || 'no definido'}`)
      })

      // Usar el depurador para mostrar información detallada
      console.log('🔍 DIAGNÓSTICO DEL SERVICIO DE ENVÍO:')
      debugShipping(address, cartItems, normalizedRules)

      // Normalizar los productos para asegurar que tengan el formato correcto
      const normalizedItems = this._normalizeCartItems(cartItems, originalRules)

      // Llamar al servicio existente con los parámetros invertidos y las reglas normalizadas
      // Ya que el servicio original espera (cartItems, address) y nuestro componente pasa (address, cartItems)
      const result = await shippingService.getShippingOptions(normalizedItems, address, normalizedRules)

      // Verificar si la operación subyacente falló (incluso si devolvió un objeto)
      if (!result || !result.success) {
        console.log('⚠️ No se obtuvieron opciones de envío o la operación falló:', result?.error)
        return []
      }

      // Asegurarse de que result.options sea un array antes de mapear
      if (!Array.isArray(result.options)) {
        console.error('Error inesperado: result.options no es un array.', result)
        return []
      }

      // Verificar si hay información de envío parcial
      const hasPartialShipping = result.partial === true
      const unavailableProducts = result.unavailableProducts || []
      const productsWithoutShipping = result.products_without_shipping || result.unavailableProducts?.map(p => p.id) || []

      // Obtener nombres de productos no disponibles para el log (si es necesario)
      const unavailableProductNames = unavailableProducts
        .map(p => p.name || p.title || p.id || 'Producto desconocido')
        .join(', ')

      console.log(`⚠️ Envío parcial: ${productsWithoutShipping.length} productos no pueden enviarse a esta dirección: ${unavailableProductNames}`)

      // Formatear las opciones para que sean compatibles con nuestro componente
      const options = result.options.map(option => {
        // Logs para debugging
        console.log(`🔄 Procesando opción de envío: ${option.id}`)
        console.log(`- minDays: ${option.minDays}, maxDays: ${option.maxDays}`)
        console.log(`- deliveryTime: ${option.deliveryTime}`)
        console.log(`- Regla ID: ${option.rule_id}`)

        // Buscar la regla original para acceder a datos adicionales
        const originalRule = normalizedRules.find(r => r.id === option.rule_id) || {}
        console.log(`- Regla original zona: ${originalRule.zona}`)

        // Intentar obtener el tiempo_entrega de las opciones de mensajería
        let tiempo_entrega = ''
        let configuracion_paquetes = null

        if (originalRule.opciones_mensajeria && originalRule.opciones_mensajeria.length > 0) {
          tiempo_entrega = originalRule.opciones_mensajeria[0].tiempo_entrega || ''
          console.log(`- tiempo_entrega encontrado en regla original: ${tiempo_entrega}`)

          // Obtener la configuración de paquetes de la opción de mensajería
          if (originalRule.opciones_mensajeria[0].configuracion_paquetes) {
            configuracion_paquetes = originalRule.opciones_mensajeria[0].configuracion_paquetes
            console.log(`- Configuración de paquetes encontrada en opción de mensajería`)
            console.log(`- peso_maximo_paquete: ${configuracion_paquetes.peso_maximo_paquete}`)
            console.log(`- costo_por_kg_extra: ${configuracion_paquetes.costo_por_kg_extra}`)
          }
        }

        // Si no se encontró configuración en opciones_mensajeria, buscar en la regla directamente
        if (!configuracion_paquetes && originalRule.configuracion_paquetes) {
          configuracion_paquetes = originalRule.configuracion_paquetes
          console.log(`- Configuración de paquetes encontrada en regla original`)
          console.log(`- peso_maximo_paquete: ${configuracion_paquetes.peso_maximo_paquete}`)
          console.log(`- costo_por_kg_extra: ${configuracion_paquetes.costo_por_kg_extra}`)
        }

        const formattedOption = {
          id: option.id || `shipping_${Date.now()}`,
          name: originalRule.zona || option.name || 'Envío estándar',
          carrier: option.carrier || option.carrierName || '',
          serviceType: option.serviceType || option.name || '',
          estimatedDelivery: option.deliveryTime || option.estimatedDelivery || '',
          tiempo_entrega: tiempo_entrega,
          totalCost: option.price || option.totalCost || 0,
          precio_base: originalRule.precio_base || (originalRule.opciones_mensajeria && originalRule.opciones_mensajeria.length > 0 ? originalRule.opciones_mensajeria[0].precio : null),
          is_shippable: true, // Todas estas opciones son enviables
          products: option.products || [],
          // Información adicional para generar descripciones más detalladas
          isFree: option.isFree || option.price === 0,
          minDays: option.minDays,
          maxDays: option.maxDays,
          description: option.description || '',
          zoneType: option.zoneType || 'estándar',
          rule_id: option.rule_id,

          // Pasar la configuración de paquetes completa
          configuracion_paquetes: configuracion_paquetes,

          // Añadir información de restricciones de paquetes si existe
          maxProductsPerPackage: getPackageLimit(originalRule, 'maximo_productos_por_paquete'),
          maxWeightPerPackage: getPackageLimit(originalRule, 'peso_maximo_paquete'),

          // Información de paquetes
          packagesCount: option.packagesCount || 1,
          packagesInfo: option.packagesInfo || [],
          packagesWithPrices: option.packagesWithPrices || false,

          // Incluir las opciones de mensajería completas
          opciones_mensajeria: originalRule.opciones_mensajeria || [],
        }

        // Log de la opción formateada
        console.log(`✅ Opción formateada - estimatedDelivery: ${formattedOption.estimatedDelivery}`)
        console.log(`✅ Opción formateada - tiempo_entrega: ${formattedOption.tiempo_entrega}`)

        return formattedOption
      })

      // Si hay envío parcial, agregar información para mostrar al usuario
      if (hasPartialShipping) {
        console.log(`⚠️ Envío parcial: ${productsWithoutShipping.length} productos no pueden enviarse a esta dirección: ${unavailableProductNames}`)

        // Convertir información de productos no enviables a formato de opciones
        normalizedItems.forEach(item => {
          const product = item.product || item
          if (productsWithoutShipping.includes(product.id)) {
            // Agregar como opción no enviable
            options.push({
              id: `non_shippable_${product.id}`,
              name: product.name || 'Producto',
              carrier: 'No disponible',
              serviceType: 'No disponible',
              estimatedDelivery: 'No disponible',
              totalCost: 0,
              is_shippable: false,
              products: [product.id],
              isFree: false,
              minDays: 0,
              maxDays: 0,
              description: '',
              zoneType: 'No disponible',
            })
          }
        })
      }

      return options
    } catch (error) {
      console.error('Error al obtener opciones de envío:', error)
      return []
    }
  }

  /**
   * Normaliza los items del carrito para el servicio de envío
   * Garantiza que los productos tengan las propiedades necesarias
   * @param {Array} cartItems - Items del carrito
   * @param {Array} rules - Reglas de envío disponibles
   * @returns {Array} - Items normalizados
   * @private
   */
  _normalizeCartItems(cartItems, rules) {
    if (!cartItems || !Array.isArray(cartItems)) {
      return []
    }

    return cartItems.map(item => {
      const product = item.product || item

      // Verificar si el producto ya tiene reglas asignadas
      const hasRuleId = !!product.shippingRuleId
      const hasRuleIds = Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0

      // Si el producto ya tiene reglas, no hacer nada
      if (hasRuleId || hasRuleIds) {
        // Pero asegurarse de que shippingRuleIds sea un array
        if (hasRuleId && !hasRuleIds) {
          return {
            ...item,
            product: {
              ...product,
              shippingRuleIds: [product.shippingRuleId],
            },
          }
        }
        return item
      }

      // Si el producto no tiene reglas asignadas y existe hasShippingRules
      // intentar encontrar reglas que podrían aplicar
      if (product.hasShippingRules === true && rules && Array.isArray(rules)) {
        // Intentar encontrar reglas que coincidan con el código postal o zona
        const potentialRuleIds = rules
          .filter(rule => rule.activo === true)
          .map(rule => rule.id)

        if (potentialRuleIds.length > 0) {
          console.log(`ℹ️ Asignando reglas potenciales al producto ${product.id || product.name}:`, potentialRuleIds)

          return {
            ...item,
            product: {
              ...product,
              shippingRuleIds: potentialRuleIds,
            },
          }
        }
      }

      // Si no hay información, devolver el item sin cambios
      return item
    })
  }
}

// Instancia singleton
export const checkoutShippingService = new CheckoutShippingService()

export default CheckoutShippingService