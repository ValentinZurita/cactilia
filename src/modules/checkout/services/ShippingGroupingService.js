import { fetchShippingRuleById } from '../../admin/shipping/api/shippingApi.js'

/**
 * Agrupa los productos por sus reglas de envío
 * @param {Array} cartItems - Elementos del carrito a agrupar
 * @returns {Promise<Array>} - Grupos de envío
 */
export const groupProductsByShippingRules = async (cartItems = []) => {
  console.log('🚚 Agrupando productos por reglas de envío:', cartItems.length, 'productos')

  if (!cartItems || cartItems.length === 0) {
    console.warn('⚠️ No hay productos para agrupar')
    return []
  }

  try {
    // Filtrar productos que tengan reglas de envío asignadas
    const validItems = cartItems.filter(item => {
      const product = item.product || item
      return product.shippingRuleId || (product.shippingRuleIds && product.shippingRuleIds.length > 0)
    })

    if (validItems.length === 0) {
      console.warn('⚠️ Ningún producto tiene reglas de envío asignadas')
      return []
    }

    // Mapa para asociar productos con sus reglas de envío
    const productsByRuleMap = new Map()
    // Caché para reglas de envío ya consultadas
    const rulesCache = new Map()

    // Procesar cada elemento del carrito
    for (const item of validItems) {
      const product = item.product || item

      // Obtener IDs de reglas de envío (única o múltiples)
      const ruleIds = product.shippingRuleIds?.length ? product.shippingRuleIds :
        (product.shippingRuleId ? [product.shippingRuleId] : [])

      if (!ruleIds.length) continue

      // Por simplicidad, usamos la primera regla de cada producto
      const ruleId = ruleIds[0]

      // Si ya tenemos esta regla en el mapa, agregar el producto
      if (productsByRuleMap.has(ruleId)) {
        productsByRuleMap.get(ruleId).items.push(item)
        continue
      }

      // Obtener datos de la regla (desde caché o Firebase)
      let ruleData
      if (rulesCache.has(ruleId)) {
        ruleData = rulesCache.get(ruleId)
      } else {
        try {
          ruleData = await fetchShippingRuleById(ruleId)

          if (!ruleData) {
            console.error(`⚠️ Regla de envío ${ruleId} no encontrada`)
            continue
          }

          // Validar que la regla tenga configuración válida
          if (!ruleData.opciones_mensajeria?.length && !ruleData.precio_base) {
            console.warn(`⚠️ Regla ${ruleId} no tiene opciones de envío válidas`)
            continue
          }

          // Guardar en caché
          rulesCache.set(ruleId, ruleData)
        } catch (error) {
          console.error(`⚠️ Error al obtener regla ${ruleId}:`, error)
          continue
        }
      }

      // Crear nuevo grupo con esta regla
      productsByRuleMap.set(ruleId, {
        id: `group-${ruleId}`,
        name: ruleData.zona || ruleData.nombre || `Grupo ${ruleId}`,
        rule: ruleData,
        items: [item],
        productIds: [product.id],
      })
    }

    // Convertir el mapa a un array de grupos
    const groups = Array.from(productsByRuleMap.values())
    return groups
  } catch (error) {
    console.error('⚠️ Error al agrupar productos:', error)
    return []
  }
}

/**
 * Prepara opciones de envío para el checkout
 * @param {Array} shippingGroups - Grupos de productos por regla de envío
 * @param {Object} address - Información de la dirección seleccionada
 * @returns {Array} - Opciones de envío disponibles
 */
export const prepareShippingOptionsForCheckout = (shippingGroups = [], address = {}) => {
  if (!shippingGroups?.length) return []

  const shippingOptions = []

  // Procesamos cada grupo de productos
  for (const group of shippingGroups) {
    const rule = group.rule
    if (!rule) continue

    // Calcular peso y subtotal del grupo
    const items = group.items || []
    let totalWeight = 0
    let subtotal = 0

    for (const item of items) {
      const product = item.product || item
      const weight = parseFloat(product.weight || product.peso || 0)
      const price = parseFloat(product.price || 0)
      const quantity = parseInt(item.quantity || 1, 10)

      totalWeight += (isNaN(weight) ? 0 : weight) * quantity
      subtotal += (isNaN(price) ? 0 : price) * quantity
    }

    // Verificar si aplica envío gratis
    const freeShippingMinimum = parseFloat(rule.envio_gratis_monto_minimo || 0)
    const isFreeShipping = rule.envio_gratis === true ||
      (freeShippingMinimum > 0 && subtotal >= freeShippingMinimum)

    // Si tiene opciones de mensajería, procesarlas
    if (rule.opciones_mensajeria?.length) {
      // Crear una opción por cada servicio de mensajería
      for (const method of rule.opciones_mensajeria) {
        // Costo base según peso y precio base
        let cost = parseFloat(method.precio || 0)

        // Ajustar precio según peso si aplica
        if (method.precio_por_kg && totalWeight > 0) {
          const pricePerKg = parseFloat(method.precio_por_kg || 0)
          cost += pricePerKg * totalWeight
        }

        // Si es envío gratis, establecer costo en cero
        if (isFreeShipping) {
          cost = 0
        }

        // Tiempos de entrega
        const minDays = parseInt(method.tiempo_entrega_min || method.minDays || rule.tiempo_minimo || 3, 10)
        const maxDays = parseInt(method.tiempo_entrega_max || method.maxDays || rule.tiempo_maximo || 7, 10)

        // Agregar opción de envío
        shippingOptions.push({
          id: `ship_${rule.id}_${method.id || Date.now()}`,
          name: method.nombre || rule.zona || 'Envío estándar',
          carrier: method.mensajeria || rule.carrier || '',
          price: cost,
          isFree: cost === 0,
          minDays,
          maxDays,
          rule_id: rule.id,
          method_id: method.id,
          products: items.map(item => (item.product || item).id),
          deliveryTime: minDays === maxDays
            ? `${minDays} días hábiles`
            : `${minDays}-${maxDays} días hábiles`,
          description: method.descripcion || rule.descripcion || '',
          group_id: group.id,
        })
      }
    }
    // Caso fallback: usar precio base de la regla
    else if (rule.precio_base !== undefined) {
      let cost = parseFloat(rule.precio_base || 0)

      // Si es envío gratis, establecer costo en cero
      if (isFreeShipping) {
        cost = 0
      }

      // Tiempos de entrega predeterminados
      const minDays = parseInt(rule.tiempo_minimo || 3, 10)
      const maxDays = parseInt(rule.tiempo_maximo || 7, 10)

      // Agregar opción de envío
      shippingOptions.push({
        id: `ship_${rule.id}_base`,
        name: rule.zona || 'Envío estándar',
        price: cost,
        isFree: cost === 0,
        minDays,
        maxDays,
        rule_id: rule.id,
        products: items.map(item => (item.product || item).id),
        deliveryTime: minDays === maxDays
          ? `${minDays} días hábiles`
          : `${minDays}-${maxDays} días hábiles`,
        description: rule.descripcion || '',
        group_id: group.id,
      })
    }
  }

  return shippingOptions
}