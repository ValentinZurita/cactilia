/**
 * ShippingDebugger.js
 *
 * Utilidad para depurar problemas con las opciones de envío
 * Muestra información detallada sobre direcciones, productos y reglas
 */

// Importar la función findBestShippingOptions desde el algoritmo Greedy
// import { findBestShippingOptions } from '../../../shop/features/checkout/services/shipping/ShippingRulesGreedy';

// Import the original validation function
import { isRuleValidForAddress } from '@modules/checkout/services/ShippingRulesGreedy.js' // Correct path needed

/**
 * Función que imprime información detallada sobre el estado actual del checkout
 * @param {Object} address - Dirección seleccionada
 * @param {Array} cartItems - Productos en el carrito
 * @param {Array} shippingRules - Reglas de envío (YA NORMALIZADAS)
 */
export const debugShipping = (address, cartItems, shippingRules = null) => {
  console.group('🔍 DEPURACIÓN DE ENVÍO')

  // Información sobre la dirección
  console.group('📍 DIRECCIÓN SELECCIONADA')
  if (!address) {
    console.warn('⚠️ No hay dirección seleccionada')
  } else {
    console.log('ID:', address.id)
    console.log('Ciudad:', address.city)
    console.log('Estado/Provincia:', address.state || address.provincia)
    console.log('Código Postal:', address.postalCode || address.zip || address.zipcode)
    console.log('País:', address.country || 'México')
    console.log('Dirección completa:', address)
  }
  console.groupEnd()

  // Información sobre los productos
  console.group('🛒 PRODUCTOS EN CARRITO')
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    console.warn('⚠️ No hay productos en el carrito')
  } else {
    console.log(`Total de productos: ${cartItems.length}`)
    cartItems.forEach((item, index) => {
      const product = item.product || item
      console.group(`Producto #${index + 1}: ${product.name || product.title || 'Sin nombre'}`)
      console.log('ID:', product.id)
      console.log('Peso:', product.weight || product.peso || 'No especificado')
      console.log('Cantidad:', item.quantity || 1)

      // Mostrar las reglas asignadas al producto
      if (product.shippingRuleId) {
        console.log('Regla de envío asignada:', product.shippingRuleId)
      }
      if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds)) {
        console.log('Reglas de envío asignadas:', product.shippingRuleIds)
      }

      console.log('Producto completo:', product)
      console.groupEnd()
    })
  }
  console.groupEnd()

  // Información sobre las reglas de envío (si están disponibles)
  console.group('📜 REGLAS DE ENVÍO DISPONIBLES (NORMALIZADAS)')
  if (!shippingRules || !Array.isArray(shippingRules) || shippingRules.length === 0) {
    console.warn('⚠️ No se proporcionaron reglas de envío normalizadas para depurar')
  } else {
    console.log(`Total de reglas: ${shippingRules.length}`)
    shippingRules.forEach((rule, index) => {
      // Usar la regla directamente (asumiendo que ya está normalizada)
      const ruleToValidate = rule

      console.groupCollapsed(`Regla #${index + 1}: ${ruleToValidate.name || ruleToValidate.id || 'Sin nombre/ID'}`)
      console.log('ID:', ruleToValidate.id)
      console.log('Nombre:', ruleToValidate.name)
      console.log('Prioridad:', ruleToValidate.priority || ruleToValidate.prioridad || 'No definida')
      console.log('Tipo Cobertura:', ruleToValidate.coverage_type || ruleToValidate.tipo_cobertura || 'No definida')
      console.log('Valores Cobertura:', ruleToValidate.coverage_values || ruleToValidate.cobertura_cp || ruleToValidate.cobertura_estados || 'No definidos')
      console.log('País Cobertura:', ruleToValidate.coverage_country || 'No definido')
      console.log('Envío Gratis:', ruleToValidate.envio_gratis || ruleToValidate.free_shipping || false)
      console.log('Costo Base:', ruleToValidate.precio_base || ruleToValidate.base_price || 0)
      console.log('Regla completa (Normalizada):', ruleToValidate)

      // Validar la regla contra la dirección usando la función ORIGINAL importada
      const isValid = isRuleValidForAddress(ruleToValidate, address) // Use imported function

      if (isValid) {
        // Adjust log based on what isRuleValidForAddress returns (boolean)
        console.log(`✅ VÁLIDA para la dirección`)
      } else {
        console.error(`❌ INVÁLIDA para la dirección`)
      }
      console.groupEnd()
    })
  }
  console.groupEnd()

  // Comentario sobre el cálculo final (opcional)
  console.info('ℹ️ El cálculo final de opciones utiliza findBestShippingOptions con estas reglas normalizadas.')

  console.groupEnd() // Fin de DEPURACIÓN DE ENVÍO
}

// REMOVE the useShippingDebugger hook if it's no longer needed or update it
// export const useShippingDebugger = ({ address, cartItems, shippingRules }) => {
// ...
// };

export default debugShipping