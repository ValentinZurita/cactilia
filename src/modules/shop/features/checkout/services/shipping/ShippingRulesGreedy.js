/**
 * Algoritmo Greedy para cálculo de opciones de envío
 *
 * Esta implementación simplificada:
 * 1. Filtra reglas compatibles con la dirección del usuario
 * 2. Asigna la mejor regla para cada producto
 * 3. Agrupa productos por regla para minimizar envíos
 * 4. Calcula costos precisos basados en los datos de Firebase
 */

import { v4 as uuidv4 } from 'uuid'

// Importar el mapeo de abreviaciones
import { STATE_ABBREVIATIONS, NATIONAL_KEYWORD } from '../../../../../../modules/checkout/constants/shippingConstants.js'
// import { RuleFormatNormalizer } from '../../../../../../modules/checkout/shipping/RuleFormatNormalizer.js'
import { fetchAllShippingRules } from '../../../../../../modules/checkout/shipping/shippingRulesService.js'
import { calculatePackaging } from './packagingUtils.js'
import { calculateGroupCost } from './costUtils.js'
import { getDeliveryTimeInfo } from './deliveryTimeUtils.js'

/**
 * Determina si una regla de envío es válida para la dirección proporcionada
 * @param {Object} rule - Regla de envío desde Firebase
 * @param {Object} address - Dirección del usuario
 * @returns {boolean} - true si la regla es válida
 */
export const isRuleValidForAddress = (rule, address) => {
  if (!rule || !address) return false

  const postalCode = (address.postalCode || address.zip || '').toString().trim()
  const fullStateName = (address.state || address.provincia || '').toString()
  const stateAbbreviation = STATE_ABBREVIATIONS[fullStateName]?.toLowerCase().trim() || fullStateName.toLowerCase().trim()
  const country = (address.country || 'MX').toString().toLowerCase().trim()
  const coverageType = (rule.coverage_type || rule.tipo_cobertura || '').trim().toLowerCase()

  // 1. Chequeo explícito de cobertura nacional vía coverage_type (usando constante)
  if (coverageType === NATIONAL_KEYWORD) {
    return true
  }

  // 2. Chequeo basado en coverage_type y coverage_values (nuevo formato)
  switch (coverageType) {
    case 'zip':
      return Array.isArray(rule.coverage_values) && rule.coverage_values.some(cp => cp.toString().trim() === postalCode)
    case 'state':
      return Array.isArray(rule.coverage_values) && rule.coverage_values.some(s => s.toString().toLowerCase().trim() === stateAbbreviation)
    case 'country':
      return rule.coverage_country?.toLowerCase().trim() === country
    // Casos redundantes eliminados para claridad
  }

  // --- NUEVO CHEQUEO --- 
  // 3. Chequeo de cobertura nacional vía zipcode/zipcodes (estructura observada en datos reales)
  if (
    rule.zipcode === NATIONAL_KEYWORD || 
    (Array.isArray(rule.zipcodes) && rule.zipcodes.includes(NATIONAL_KEYWORD))
  ) {
    return true; // Si zipcode o zipcodes indican 'nacional', es válida
  }
  // --- FIN NUEVO CHEQUEO ---

  // 4. Chequeos de fallback para campos antiguos (cobertura_cp, cobertura_estados)
  if (Array.isArray(rule.cobertura_cp) && rule.cobertura_cp.some(cp => cp.toString().trim() === postalCode)) {
    return true
  }
  if (Array.isArray(rule.cobertura_estados) && rule.cobertura_estados.some(s => s.toString().toLowerCase().trim() === stateAbbreviation)) {
    return true
  }

  // 5. Si ninguno de los anteriores coincide
  return false
}

/**
 * Verifica si se puede añadir un producto a un grupo de envío existente
 * @param {Object} group - Grupo de envío
 * @param {Object} product - Producto a añadir
 * @param {Object} rule - Regla de envío
 * @returns {boolean} - true si se puede añadir
 */
const canAddProductToGroup = (group, product, rule) => {
  // Si no hay configuración de paquetes, se puede añadir siempre
  if (!rule.configuracion_paquetes) {
    return true
  }

  const config = rule.configuracion_paquetes

  // Verificar límite de productos por paquete
  if (config.maximo_productos_por_paquete !== undefined) {
    const maxProductos = parseInt(config.maximo_productos_por_paquete, 10)
    if (!isNaN(maxProductos) && group.products.length >= maxProductos) {
      return false
    }
  }

  // Verificar límite de peso por paquete
  if (config.peso_maximo_paquete !== undefined) {
    const pesoMaximo = parseFloat(config.peso_maximo_paquete)

    if (!isNaN(pesoMaximo)) {
      // Calcular peso actual del grupo
      const pesoActual = group.products.reduce((sum, p) => {
        return sum + parseFloat(p.weight || 0)
      }, 0)

      // Añadir el peso del nuevo producto
      const pesoTotal = pesoActual + parseFloat(product.weight || 0)

      if (pesoTotal > pesoMaximo) {
        return false
      }
    }
  }

  return true
}

/**
 * Algoritmo principal para encontrar opciones de envío óptimas
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} address - Dirección del usuario
 * @param {Array} shippingRules - Reglas de envío desde Firebase
 * @returns {Object} Resultado con opciones de envío
 */
export const findBestShippingOptionsGreedy = (cartItems, address, shippingRules) => {
  // Validar entradas
  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: 'No hay productos en el carrito' }
  }

  if (!address) {
    return { success: false, error: 'No se proporcionó dirección de envío' }
  }

  if (!shippingRules || !Array.isArray(shippingRules) || shippingRules.length === 0) {
    return { success: false, error: 'No hay reglas de envío disponibles' }
  }

  console.log(`[Greedy] 🔍 Iniciando cálculo para ${cartItems.length} productos con ${shippingRules.length} reglas.`)

  // Paso 1: Encontrar reglas válidas para cada producto
  const validRulesByProduct = {}
  const productsWithoutRules = []

  cartItems.forEach(item => {
    const product = item.product || item
    const productId = product.id

    const assignedRuleIds = product.shippingRuleIds || []

    if (!assignedRuleIds.length) {
      productsWithoutRules.push(product)
      return
    }

    const validRules = shippingRules
      .filter(rule => assignedRuleIds.includes(rule.id) && isRuleValidForAddress(rule, address))

    if (validRules.length > 0) {
      validRulesByProduct[productId] = validRules
    } else {
      productsWithoutRules.push(product)
    }
  })

  console.log(`[Greedy] Productos CON reglas válidas para la dirección: ${Object.keys(validRulesByProduct).length} (${Object.keys(validRulesByProduct).join(', ') || 'Ninguno'})`)
  console.log(`[Greedy] Productos SIN reglas válidas para la dirección: ${productsWithoutRules.length} (${productsWithoutRules.map(p => p.id).join(', ') || 'Ninguno'})`)

  if (productsWithoutRules.length > 0) {
    const productNames = productsWithoutRules.map(p => p.name || `ID: ${p.id}`).join(', ')

    if (Object.keys(validRulesByProduct).length > 0) {
      console.log(`[Greedy] ⚠️ Activando modo de Envío Parcial. Productos no cubiertos: ${productNames}`)

      const shippingGroups = []
      const productAssignments = {}

      Object.entries(validRulesByProduct).forEach(([productId, validRules]) => {
        const item = cartItems.find(item => (item.product || item).id === productId)
        if (!item) return
        const product = item.product || item

        const sortedRules = [...validRules].sort((a, b) => {
          const getCoveragePriority = (rule) => {
            const coverageType = rule.coverage_type || rule.tipo_cobertura
            if (coverageType === 'por_codigo_postal') return 3
            if (coverageType === 'por_estado') return 2
            if (rule.zona === 'Local') return 1
            if (coverageType === 'nacional') return 0
            return -1
          }

          const priorityA = getCoveragePriority(a)
          const priorityB = getCoveragePriority(b)

          if (priorityA !== priorityB) return priorityB - priorityA

          const costA = parseFloat(a.precio_base || a.base_price || 100)
          const costB = parseFloat(b.precio_base || b.base_price || 100)
          return costA - costB
        })

        let addedToGroup = false

        for (const group of shippingGroups) {
          if (sortedRules.some(rule => rule.id === group.rule.id)) {
            if (canAddProductToGroup(group, product, group.rule)) {
              group.products.push(product)
              productAssignments[productId] = group.rule.id
              addedToGroup = true
              break
            }
          }
        }

        if (!addedToGroup) {
          const bestRule = sortedRules[0]
          const newGroup = {
            id: uuidv4(),
            rule: bestRule,
            products: [product],
          }

          shippingGroups.push(newGroup)
          productAssignments[productId] = bestRule.id
        }
      })

      const shippingOptions = shippingGroups.map(group => {
        const rule = group.rule;
        
        const { minDays, maxDays, deliveryTimeText } = getDeliveryTimeInfo(rule);
        
        const ruleConfig = rule.configuracion_paquetes || (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0 ? rule.opciones_mensajeria[0].configuracion_paquetes : {})
        const { packagesCount, packagesInfo: initialPackagesInfo } = calculatePackaging(group.products, ruleConfig, group.id);
        
        const { totalOptionCost, updatedPackagesInfo } = calculateGroupCost(initialPackagesInfo, rule);
        const finalIsFree = totalOptionCost === 0;

        const option = {
          id: `ship_${group.id}_${uuidv4()}`,
          name: rule.zona || rule.nombre || rule.name || 'Envío Estándar',
          carrier: rule.carrier || rule.proveedor || '',
          description: rule.descripcion || rule.description || '',
          price: totalOptionCost,
          products: group.products.map(p => p.id),
          isFree: finalIsFree,
          rule_id: rule.id,
          minDays,
          maxDays,
          isNational: (rule.coverage_type === 'nacional' || rule.tipo === 'nacional'),
          zoneType: rule.coverage_type || rule.tipo || 'standard',
          deliveryTime: deliveryTimeText,
          precio_base: parseFloat(rule.precio_base || (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0 ? rule.opciones_mensajeria[0].precio : 0) || 0),
          envio_gratis_monto_minimo: parseFloat(rule.envio_gratis_monto_minimo) > 0 ? parseFloat(rule.envio_gratis_monto_minimo) : undefined,
          configuracion_paquetes: ruleConfig,
          opciones_mensajeria: rule.opciones_mensajeria,
          packagesCount,
          packagesInfo: updatedPackagesInfo,
          packagesWithPrices: true,
        }

        option.description = generateDetailedDescription(option, group.products)

        console.log(`[Greedy]   ✅ Opción Parcial Calculada: "${option.name}" (ID: ${option.rule_id}), Costo: $${option.price.toFixed(2)}, Productos: ${option.products.length}, Paquetes: ${option.packagesCount}`)

        return option
      })

      console.log(`[Greedy] ✅ Cálculo parcial completado. Devolviendo ${shippingOptions.length} opciones.`)
      return {
        success: true,
        options: shippingOptions,
        productAssignments,
        products_without_shipping: productsWithoutRules.map(p => p.id),
        partial_shipping: true,
        unavailable_products: productNames,
      }
    }

    console.log(`[Greedy] ❌ No hay reglas válidas para NINGÚN producto en esta dirección.`)
    return {
      success: false,
      error: `No hay opciones de envío disponibles para: ${productNames}`,
      products_without_shipping: productsWithoutRules.map(p => p.id),
    }
  }

  console.log(`[Greedy] ✅ Todos los productos tienen al menos una regla válida para la dirección.`)
  const shippingGroups = []
  const productAssignments = {}

  cartItems.forEach(item => {
    const product = item.product || item
    const productId = product.id
    const validRules = validRulesByProduct[productId] || []
    if (validRules.length === 0) return

    const sortedRules = [...validRules].sort((a, b) => {
      const getCoveragePriority = (rule) => {
        const coverageType = rule.coverage_type || rule.tipo_cobertura
        if (coverageType === 'por_codigo_postal') return 3
        if (coverageType === 'por_estado') return 2
        if (rule.zona === 'Local') return 1
        if (coverageType === 'nacional') return 0
        return -1
      }

      const priorityA = getCoveragePriority(a)
      const priorityB = getCoveragePriority(b)
      if (priorityA !== priorityB) return priorityB - priorityA

      const costA = parseFloat(a.precio_base || a.base_price || 100)
      const costB = parseFloat(b.precio_base || b.base_price || 100)
      return costA - costB
    })

    let addedToGroup = false
    for (const group of shippingGroups) {
      if (sortedRules.some(rule => rule.id === group.rule.id)) {
        if (canAddProductToGroup(group, product, group.rule)) {
          group.products.push(product)
          productAssignments[productId] = group.rule.id
          addedToGroup = true
          break
        }
      }
    }

    if (!addedToGroup) {
      const bestRule = sortedRules[0]
      const newGroup = { id: uuidv4(), rule: bestRule, products: [product] }
      shippingGroups.push(newGroup)
      productAssignments[productId] = bestRule.id
    }
  })

  const shippingOptions = shippingGroups.map(group => {
    const rule = group.rule;
    
    const { minDays, maxDays, deliveryTimeText } = getDeliveryTimeInfo(rule);
    
    const ruleConfig = rule.configuracion_paquetes || (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0 ? rule.opciones_mensajeria[0].configuracion_paquetes : {})
    const { packagesCount, packagesInfo: initialPackagesInfo } = calculatePackaging(group.products, ruleConfig, group.id);
    
    const { totalOptionCost, updatedPackagesInfo } = calculateGroupCost(initialPackagesInfo, rule);
    const finalIsFree = totalOptionCost === 0;

    const option = {
      id: `ship_${group.id}_${uuidv4()}`,
      name: rule.zona || rule.nombre || rule.name || 'Envío Estándar',
      carrier: rule.carrier || rule.proveedor || '',
      description: rule.descripcion || rule.description || '',
      price: totalOptionCost,
      products: group.products.map(p => p.id),
      isFree: finalIsFree,
      rule_id: rule.id,
      minDays,
      maxDays,
      isNational: (rule.coverage_type === 'nacional' || rule.tipo === 'nacional'),
      zoneType: rule.coverage_type || rule.tipo || 'standard',
      deliveryTime: deliveryTimeText,
      precio_base: parseFloat(rule.precio_base || (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0 ? rule.opciones_mensajeria[0].precio : 0) || 0),
      envio_gratis_monto_minimo: parseFloat(rule.envio_gratis_monto_minimo) > 0 ? parseFloat(rule.envio_gratis_monto_minimo) : undefined,
      configuracion_paquetes: ruleConfig,
      opciones_mensajeria: rule.opciones_mensajeria,
      packagesCount,
      packagesInfo: updatedPackagesInfo,
      packagesWithPrices: true,
    }

    option.description = generateDetailedDescription(option, group.products)

    console.log(`[Greedy]   ✅ Opción Calculada: "${option.name}" (ID: ${option.rule_id}), Costo: $${option.price.toFixed(2)}, Productos: ${option.products.length}, Paquetes: ${option.packagesCount}`)

    return option
  })

  console.log(`[Greedy] ✅ Cálculo completo finalizado. Devolviendo ${shippingOptions.length} opciones.`)
  return {
    success: true,
    options: shippingOptions,
    productAssignments,
  }
}

/**
 * Genera una descripción detallada para una opción de envío
 * @param {Object} option - Opción de envío
 * @param {Array} products - Productos asociados
 * @returns {string} - Descripción detallada
 */
export const generateDetailedDescription = (option, products = []) => {
  if (!option) return ''

  const isFree = option.isFree || option.price === 0
  let description = ''

  // Tipo de envío
  if (option.isNational) {
    description += 'Envío nacional'
  } else if (option.zoneType === 'local') {
    description += 'Envío local'
  } else if (option.zoneType === 'express') {
    description += 'Envío express'
  } else {
    description += 'Envío estándar'
  }

  // Tiempo de entrega - solo si hay datos disponibles
  if (option.deliveryTime && option.deliveryTime.length > 0) {
    description += ` - ${option.deliveryTime}`
  } else if (option.minDays !== null && option.maxDays !== null) {
    if (option.minDays === option.maxDays) {
      if (option.minDays === 1) {
        description += ` - Entrega en 1 día hábil`
      } else {
        description += ` - Entrega en ${option.minDays} días hábiles`
      }
    } else {
      description += ` - Entrega en ${option.minDays}-${option.maxDays} días hábiles`
    }
  }

  // Precio
  if (isFree) {
    description += ' - GRATIS'
  } else {
    const formattedPrice = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(option.price)
    description += ` - ${formattedPrice}`
  }

  // Información de paquetes
  if (option.packagesInfo && option.packagesInfo.length > 1) {
    description += `\nSe dividirá en ${option.packagesInfo.length} paquetes debido a restricciones de tamaño o peso`
  }

  // Información de producto si es relevante
  if (products && products.length > 0) {
    if (products.length === 1) {
      const product = products[0]
      description += `\nProducto: ${product.name || 'Producto único'}`
    } else {
      description += `\nIncluye envío para ${products.length} productos`
    }
  }

  // Información de restricciones de paquetes si existen
  if (option.maxProductsPerPackage) {
    description += `\nMáximo ${option.maxProductsPerPackage} productos por paquete`
  }

  if (option.maxWeightPerPackage) {
    description += `\nPeso máximo de ${option.maxWeightPerPackage}kg por paquete`
  }

  // Información de carrier si está disponible
  if (option.carrier) {
    description += `\nTransportista: ${option.carrier}`
  }

  return description
}

/**
 * Función principal que encuentra las mejores opciones de envío
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} address - Dirección del usuario
 * @param {Array} shippingRules - Reglas de envío disponibles
 * @returns {Object} - Resultado con opciones de envío
 */
export const findBestShippingOptions = (cartItems, address, shippingRules) => {
  return findBestShippingOptionsGreedy(cartItems, address, shippingRules)
}