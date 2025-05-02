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
import { NATIONAL_KEYWORD, STATE_ABBREVIATIONS } from '../constants/shippingConstants.js'
// import { RuleFormatNormalizer } from '../../../../../../modules/checkout/shipping/RuleFormatNormalizer.js'
import { fetchAllShippingRules } from './shippingRulesService.js'
import { calculatePackaging } from '../utils/packagingUtils.js'
import { calculateGroupCost } from '../utils/costUtils.js'
import { getDeliveryTimeInfo } from '../utils/deliveryTimeUtils.js'
import { isRuleValidForAddress } from '../utils/shippingRuleUtils.js'

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
 * Asigna un producto a un grupo de envío existente o crea uno nuevo.
 * Ordena las reglas válidas del producto y aplica la lógica "greedy".
 * Modifica directamente los arrays/objetos `shippingGroups` y `productAssignments`.
 *
 * @param {Object} product - El producto a asignar.
 * @param {Array} validRules - Las reglas válidas para este producto y dirección.
 * @param {Array} shippingGroups - Array actual de grupos (será modificado).
 * @param {Object} productAssignments - Objeto de asignaciones (será modificado).
 */
const assignProductToShippingGroup = (
  product,
  validRules,
  shippingGroups, // Modificado por referencia
  productAssignments, // Modificado por referencia
) => {
  if (!product || !validRules || validRules.length === 0) return

  const productId = product.id

  // Ordenar reglas: Mayor prioridad (más específico) primero, luego más barato
  const sortedRules = [...validRules].sort((a, b) => {
    // Función interna para obtener prioridad (movida aquí)
    const getCoveragePriority = (rule) => {
      const coverageType = rule.coverage_type || rule.tipo_cobertura || ''
      // Prioridad alta para reglas específicas
      if (coverageType === 'zip' || coverageType === 'postal_code' || coverageType === 'por_codigo_postal') return 3
      if (coverageType === 'state' || coverageType === 'por_estado') return 2
      // Considerar 'Local' como una prioridad media (si se usa ese campo)
      if (rule.zona?.toLowerCase() === 'local') return 1
      // Nacional tiene la menor prioridad
      if (coverageType === NATIONAL_KEYWORD) return 0
      // Default bajo si no coincide con tipos conocidos
      return -1
    }

    const priorityA = getCoveragePriority(a)
    const priorityB = getCoveragePriority(b)

    // Ordenar por prioridad descendente
    if (priorityA !== priorityB) return priorityB - priorityA

    // Si la prioridad es la misma, ordenar por costo ascendente
    const costA = parseFloat(a.precio_base || a.base_price || Infinity) // Usar Infinity si no hay costo
    const costB = parseFloat(b.precio_base || b.base_price || Infinity)
    return costA - costB
  })

  let addedToGroup = false

  // Intentar añadir al primer grupo existente compatible
  for (const group of shippingGroups) {
    // ¿Alguna de las reglas válidas del producto coincide con la regla de este grupo?
    if (sortedRules.some(rule => rule.id === group.rule.id)) {
      // ¿El producto cabe en este grupo según las restricciones de la regla del grupo?
      if (canAddProductToGroup(group, product, group.rule)) {
        group.products.push(product) // Añadir producto al grupo existente
        productAssignments[productId] = group.rule.id // Registrar asignación
        addedToGroup = true
        break // Salir del bucle una vez añadido
      }
    }
  }

  // Si no se pudo añadir a ningún grupo existente, crear uno nuevo
  if (!addedToGroup) {
    const bestRule = sortedRules[0] // Usar la regla de mayor prioridad/menor costo
    const newGroup = {
      id: uuidv4(), // Generar ID único para el grupo
      rule: bestRule,
      products: [product], // Grupo nuevo empieza con este producto
    }
    shippingGroups.push(newGroup) // Añadir el nuevo grupo al array
    productAssignments[productId] = bestRule.id // Registrar asignación
  }
}

/**
 * Algoritmo principal para encontrar opciones de envío óptimas
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} address - Dirección del usuario
 * @param {Array} shippingRules - Reglas de envío desde Firebase
 * @returns {Object} Resultado con opciones de envío
 */
export const calculateGreedyShippingOptions = (cartItems, address, shippingRules) => {
  // 1. Validación de entradas
  if (!cartItems || cartItems.length === 0) return { success: false, error: 'No hay productos en el carrito' }
  if (!address) return { success: false, error: 'No se proporcionó dirección de envío' }
  if (!shippingRules || !Array.isArray(shippingRules) || shippingRules.length === 0) return {
    success: false,
    error: 'No hay reglas de envío disponibles',
  }

  console.log(`[Greedy] 🔍 Iniciando cálculo para ${cartItems.length} productos con ${shippingRules.length} reglas.`);

  // 2. Paso 1: Encontrar reglas válidas por producto
  const validRulesByProduct = {};
  const productsWithoutRules = [];
  cartItems.forEach(item => {
    const product = item.product || item;
    const productId = product.id;
    const assignedRuleIds = product.shippingRuleIds || [];
    if (!assignedRuleIds.length) {
      productsWithoutRules.push(product);
      return;
    }
    const validRules = shippingRules.filter(rule => assignedRuleIds.includes(rule.id) && isRuleValidForAddress(rule, address));
    if (validRules.length > 0) {
      validRulesByProduct[productId] = validRules;
    } else {
      productsWithoutRules.push(product);
    }
  });

  // 3. Manejar caso donde NINGÚN producto tiene reglas válidas
  const productsWithValidRulesIds = Object.keys(validRulesByProduct)
  if (productsWithValidRulesIds.length === 0) {
    const productNames = (productsWithoutRules.length > 0 ? productsWithoutRules : cartItems).map(p => p.name || `ID: ${p.id}`).join(', ')
    console.log(`[Greedy] ❌ No hay reglas válidas para NINGÚN producto en esta dirección.`)
    return {
      success: false,
      error: `No hay opciones de envío disponibles para: ${productNames}`,
      products_without_shipping: (productsWithoutRules.length > 0 ? productsWithoutRules : cartItems).map(p => p.id),
    }
  }

  // 4. Determinar si es envío parcial y qué items procesar
  const isPartialShipping = productsWithoutRules.length > 0
  const itemsToProcess = isPartialShipping
    ? cartItems.filter(item => productsWithValidRulesIds.includes((item.product || item).id))
    : cartItems

  if (isPartialShipping) {
    console.log(`[Greedy] ⚠️ Activando modo de Envío Parcial. ${itemsToProcess.length} productos serán procesados.`)
  } else {
    console.log(`[Greedy] ✅ Todos los productos tienen reglas válidas. Procesando ${itemsToProcess.length} productos.`)
  }

  // 5. Inicializar estructuras de agrupación
  const shippingGroups = []
  const productAssignments = {}

  // 6. Bucle ÚNICO de Agrupación
  itemsToProcess.forEach(item => {
    const product = item.product || item;
    const productId = product.id;
    const validRules = validRulesByProduct[productId]; 
    assignProductToShippingGroup(product, validRules, shippingGroups, productAssignments);
  });

  // 7. Mapeo ÚNICO de Grupos a Opciones
  const shippingOptions = shippingGroups.map((group, groupIndex) => {
    const rule = group.rule;

    // Obtener info de tiempo
    const { minDays, maxDays, deliveryTimeText } = getDeliveryTimeInfo(rule)

    // Calcular empaquetado
    const ruleConfig = rule.configuracion_paquetes || (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0 ? rule.opciones_mensajeria[0].configuracion_paquetes : {})
    const {
      packagesCount,
      packagesInfo: initialPackagesInfo,
    } = calculatePackaging(group.products, ruleConfig, group.id)

    // Calcular costo
    const { totalOptionCost, updatedPackagesInfo } = calculateGroupCost(initialPackagesInfo, rule);
    const finalIsFree = totalOptionCost === 0;

    // Construir el objeto option
    const option = {
      id: `ship_${group.id}_${uuidv4()}`,
      name: rule.zona || rule.nombre || rule.name || 'Envío Estándar',
      carrier: rule.carrier || rule.proveedor || '',
      description: rule.descripcion || rule.description || '',
      price: totalOptionCost,
      products: group.products.map(p => p.id),
      isFree: finalIsFree,
      rule_id: rule.id,
      minDays, maxDays, deliveryTime: deliveryTimeText,
      isNational: (rule.coverage_type === NATIONAL_KEYWORD || rule.tipo === NATIONAL_KEYWORD || rule.zipcode === NATIONAL_KEYWORD || (Array.isArray(rule.zipcodes) && rule.zipcodes.includes(NATIONAL_KEYWORD))),
      zoneType: rule.coverage_type || rule.tipo || (rule.zipcode === NATIONAL_KEYWORD ? NATIONAL_KEYWORD : 'standard'),
      precio_base: parseFloat(rule.precio_base || (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0 ? rule.opciones_mensajeria[0].precio : 0) || 0),
      envio_gratis_monto_minimo: parseFloat(rule.envio_gratis_monto_minimo) > 0 ? parseFloat(rule.envio_gratis_monto_minimo) : undefined,
      configuracion_paquetes: ruleConfig,
      opciones_mensajeria: rule.opciones_mensajeria,
      packagesCount,
      packagesInfo: updatedPackagesInfo,
      packagesWithPrices: true,
    }

    option.description = generateDetailedDescription(option, group.products)

    return option
  })

  // 8. Construir y retornar el objeto de resultado final
  const baseResult = {
    success: true,
    options: shippingOptions,
    productAssignments,
  }

  if (isPartialShipping) {
    const productNames = productsWithoutRules.map(p => p.name || `ID: ${p.id}`).join(', ')
    console.log(`[Greedy] ✅ Cálculo parcial completado. Devolviendo ${shippingOptions.length} opciones. Productos no cubiertos: ${productNames}`)
    return {
      ...baseResult,
      products_without_shipping: productsWithoutRules.map(p => p.id),
      partial_shipping: true,
      unavailable_products: productNames,
    }
  } else {
    console.log(`[Greedy] ✅ Cálculo completo finalizado. Devolviendo ${shippingOptions.length} opciones.`)
    return baseResult
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