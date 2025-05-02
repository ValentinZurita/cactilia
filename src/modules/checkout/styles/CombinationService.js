import { calculateShippingPrice } from '../services/ShippingZonesService.js'

/**
 * Service for building optimal shipping combinations
 */

/**
 * Identifies which products are covered by which shipping zones
 * @param {Array} cartItems - Products in cart
 * @param {Array} zones - Available shipping zones
 * @returns {Map} - Map of productId => array of compatible zone IDs
 */
export const mapProductsToZones = (cartItems, zones) => {
  if (!cartItems?.length || !zones?.length) return new Map()

  // Map to track which zones can ship each product
  const productZonesMap = new Map()

  // Process each cart item
  cartItems.forEach(item => {
    const product = item.product || item
    const productId = product.id

    if (!productId) {
      console.warn('⚠️ Product without ID, skipping')
      return
    }

    // Get shipping rule IDs for this product
    const ruleIds = []

    // Extract shipping rules from product
    if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds)) {
      ruleIds.push(...product.shippingRuleIds)
    } else if (product.shippingRuleId) {
      ruleIds.push(product.shippingRuleId)
    } else if (product.shippingRules && Array.isArray(product.shippingRules)) {
      ruleIds.push(...product.shippingRules
        .filter(rule => rule && rule.id)
        .map(rule => rule.id))
    }

    if (ruleIds.length === 0) {
      console.warn(`⚠️ Product ${productId} has no shipping rules`)
      return
    }

    console.log(`🔍 Product ${productId} has shipping rules:`, ruleIds)

    // Find which zones have these rules
    const compatibleZones = zones.filter(zone => {
      // First, check if zone.id directly matches any rule
      if (ruleIds.includes(zone.id)) {
        console.log(`✅ Zone ${zone.id} directly matches product ${productId}'s rules`)
        return true
      }

      // Then check if this zone supports any of the product's shipping rules
      if (zone.reglas && Array.isArray(zone.reglas)) {
        const match = zone.reglas.some(zoneRule => ruleIds.includes(zoneRule.id))
        if (match) {
          console.log(`✅ Zone ${zone.id} matches product ${productId}'s rules via zone.reglas`)
        }
        return match
      }

      // For backward compatibility, also check if zone.opciones is defined
      if ((!zone.reglas || zone.reglas.length === 0) && zone.opciones && zone.opciones.length > 0) {
        console.log(`✅ Zone ${zone.id} has shipping options and matches rule ID`)
        return true
      }

      return false
    })

    if (compatibleZones.length === 0) {
      console.warn(`⚠️ No compatible zones found for product ${productId}`)
      return
    }

    console.log(`✅ Found ${compatibleZones.length} compatible zones for product ${productId}`)

    // Map product to list of compatible zone IDs
    productZonesMap.set(productId, compatibleZones.map(zone => zone.id))
  })

  return productZonesMap
}

/**
 * Gets all possible zone combinations that cover all products
 * @param {Map} productZonesMap - Map of productId => array of compatible zone IDs
 * @param {Array} zones - Available shipping zones
 * @returns {Array} - Array of zone combinations that cover all products
 */
export const findZoneCombinations = (productZonesMap, zones) => {
  if (!productZonesMap.size || !zones?.length) return []

  // Get all unique products
  const allProducts = Array.from(productZonesMap.keys())
  console.log(`🔍 Finding combinations for ${allProducts.length} products`)

  // Log product-zone compatibility for debugging
  allProducts.forEach(productId => {
    const zoneIds = productZonesMap.get(productId) || []
    console.log(`Product ${productId} can be shipped by zones: ${zoneIds.join(', ')}`)
  })

  // Start with individual zones
  const combinations = []

  // Check if any single zone covers all products
  zones.forEach(zone => {
    // Check if this zone covers all products
    const allCovered = allProducts.every(productId => {
      const compatibleZones = productZonesMap.get(productId) || []
      return compatibleZones.includes(zone.id)
    })

    if (allCovered) {
      console.log(`✅ Zone "${zone.id}" (${zone.zona || 'unknown'}) covers all products`)
      combinations.push([zone])
    } else {
      console.log(`❌ Zone "${zone.id}" (${zone.zona || 'unknown'}) does NOT cover all products`)
    }
  })

  // If any single zone covers all products, we're done
  if (combinations.length > 0) {
    console.log(`✅ Found ${combinations.length} single zones that cover all products`)
    return combinations
  }

  // Otherwise, try combinations of 2 zones
  console.log('🔍 Trying combinations of 2 zones...')
  for (let i = 0; i < zones.length; i++) {
    for (let j = i + 1; j < zones.length; j++) {
      const zoneCombo = [zones[i], zones[j]]

      // Check if this combination covers all products
      const allCovered = allProducts.every(productId => {
        const compatibleZones = productZonesMap.get(productId) || []
        return compatibleZones.includes(zones[i].id) || compatibleZones.includes(zones[j].id)
      })

      if (allCovered) {
        console.log(`✅ Combination of zones "${zones[i].id}" and "${zones[j].id}" covers all products`)
        combinations.push(zoneCombo)
      } else {
        console.log(`❌ Combination of zones "${zones[i].id}" and "${zones[j].id}" does NOT cover all products`)
      }
    }
  }

  // If we found 2-zone combinations, we're done
  if (combinations.length > 0) {
    console.log(`✅ Found ${combinations.length} 2-zone combinations`)
    return combinations
  }

  // Try combinations of 3 zones as a last resort
  console.log('🔍 Trying combinations of 3 zones...')
  for (let i = 0; i < zones.length; i++) {
    for (let j = i + 1; j < zones.length; j++) {
      for (let k = j + 1; k < zones.length; k++) {
        const zoneCombo = [zones[i], zones[j], zones[k]]

        // Check if this combination covers all products
        const allCovered = allProducts.every(productId => {
          const compatibleZones = productZonesMap.get(productId) || []
          return compatibleZones.includes(zones[i].id) ||
            compatibleZones.includes(zones[j].id) ||
            compatibleZones.includes(zones[k].id)
        })

        if (allCovered) {
          console.log(`✅ Combination of 3 zones covers all products`)
          combinations.push(zoneCombo)
        }
      }
    }
  }

  console.log(`✅ Found ${combinations.length} total zone combinations`)
  return combinations
}

/**
 * Assigns products to zones based on compatibility
 * @param {Array} cartItems - Products in cart
 * @param {Array} zoneCombination - Combination of zones to use
 * @param {Map} productZonesMap - Map of productId => array of compatible zone IDs
 * @returns {Array} - Array of objects with zone and assigned products
 */
export const assignProductsToZones = (cartItems, zoneCombination, productZonesMap) => {
  if (!cartItems?.length || !zoneCombination?.length || !productZonesMap.size) return []

  console.log(`🔍 Assigning ${cartItems.length} products to ${zoneCombination.length} zones`)

  // Result array of assignments
  const assignments = zoneCombination.map(zone => ({
    zone,
    products: [],
  }))

  // Function to check if a product is compatible with a zone
  const isProductCompatibleWithZone = (productId, zoneId) => {
    const compatibleZones = productZonesMap.get(productId) || []
    return compatibleZones.includes(zoneId)
  }

  // First pass: assign products to zones where they are uniquely compatible
  cartItems.forEach(item => {
    const product = item.product || item
    const productId = product.id

    if (!productId) return

    // Get compatible zones for this product
    const compatibleZoneIds = productZonesMap.get(productId) || []

    // If product is only compatible with one zone in the combination, assign it there
    const compatibleZonesInCombo = zoneCombination.filter(zone =>
      compatibleZoneIds.includes(zone.id),
    )

    if (compatibleZonesInCombo.length === 1) {
      const assignmentIndex = assignments.findIndex(a => a.zone.id === compatibleZonesInCombo[0].id)
      if (assignmentIndex !== -1) {
        assignments[assignmentIndex].products.push(item)
        console.log(`✅ Assigned product ${productId} to zone ${compatibleZonesInCombo[0].id} (uniquely compatible)`)
      }
    }
  })

  // Second pass: greedily assign remaining products to preferred zones
  // Preference: Local > Nacional > Other
  cartItems.forEach(item => {
    const product = item.product || item
    const productId = product.id

    if (!productId) return

    // Skip products already assigned
    const isAlreadyAssigned = assignments.some(assignment =>
      assignment.products.some(p => (p.product || p).id === productId),
    )

    if (isAlreadyAssigned) return

    // Get compatible zones for this product
    const compatibleZoneIds = productZonesMap.get(productId) || []

    // Try to assign to local zone first
    const localZone = zoneCombination.find(zone =>
      zone.zona === 'Local' && compatibleZoneIds.includes(zone.id),
    )

    if (localZone) {
      const assignmentIndex = assignments.findIndex(a => a.zone.id === localZone.id)
      if (assignmentIndex !== -1) {
        assignments[assignmentIndex].products.push(item)
        console.log(`✅ Assigned product ${productId} to local zone ${localZone.id}`)
        return
      }
    }

    // Then try national zone
    const nationalZone = zoneCombination.find(zone =>
      zone.zona === 'Nacional' && compatibleZoneIds.includes(zone.id),
    )

    if (nationalZone) {
      const assignmentIndex = assignments.findIndex(a => a.zone.id === nationalZone.id)
      if (assignmentIndex !== -1) {
        assignments[assignmentIndex].products.push(item)
        console.log(`✅ Assigned product ${productId} to national zone ${nationalZone.id}`)
        return
      }
    }

    // Finally, assign to any compatible zone
    for (const zone of zoneCombination) {
      if (compatibleZoneIds.includes(zone.id)) {
        const assignmentIndex = assignments.findIndex(a => a.zone.id === zone.id)
        if (assignmentIndex !== -1) {
          assignments[assignmentIndex].products.push(item)
          console.log(`✅ Assigned product ${productId} to zone ${zone.id}`)
          return
        }
      }
    }

    console.warn(`⚠️ Could not assign product ${productId} to any zone`)
  })

  // Return only assignments with products
  const validAssignments = assignments.filter(assignment => assignment.products.length > 0)
  console.log(`✅ Created ${validAssignments.length} valid assignments`)

  return validAssignments
}

/**
 * Divide productos en paquetes según restricciones de cantidad y peso
 * @param {Array} products - Productos a dividir
 * @param {Object} packageConfig - Configuración de restricciones de paquetes
 * @returns {Array<Array>} - Array de paquetes (cada paquete es un array de productos)
 */
const splitIntoPackages = (products, packageConfig) => {
  if (!products || products.length === 0) return []
  if (!packageConfig) return [products] // Sin configuración, todos en un paquete

  const maxProductsPerPackage = packageConfig.maximo_productos_por_paquete || Number.MAX_SAFE_INTEGER
  const maxWeightPerPackage = packageConfig.peso_maximo_paquete || Number.MAX_SAFE_INTEGER

  // Si no hay restricciones específicas, devolver todos en un solo paquete
  if (maxProductsPerPackage === Number.MAX_SAFE_INTEGER &&
    maxWeightPerPackage === Number.MAX_SAFE_INTEGER) {
    return [products]
  }

  // No intentar dividir si solo hay un producto y excede el límite
  // En este caso, forzamos la aceptación del producto individual
  if (products.length === 1) {
    console.log('⚠️ Un solo producto no puede dividirse más, ignorando restricciones de paquete')
    return [products]
  }

  // Crear paquetes según restricciones
  const packages = []
  let currentPackage = []
  let currentWeight = 0
  let currentCount = 0

  // Ordenar productos por peso (descendente) para optimizar empaquetado
  const sortedProducts = [...products].sort((a, b) => {
    const weightA = parseFloat(a.product?.weight || a.product?.peso || a.weight || a.peso || 0)
    const weightB = parseFloat(b.product?.weight || b.product?.peso || b.weight || b.peso || 0)
    return weightB - weightA
  })

  // Función para verificar si un producto cabe en un paquete
  const canAddToPackage = (item, currentPkgCount, currentPkgWeight) => {
    const quantity = item.quantity || 1
    const weight = parseFloat(item.product?.weight || item.product?.peso || item.weight || item.peso || 0) * quantity

    // Restricciones de cantidad
    if (maxProductsPerPackage !== Number.MAX_SAFE_INTEGER &&
      currentPkgCount + 1 > maxProductsPerPackage) {
      return false
    }

    // Restricciones de peso
    if (maxWeightPerPackage !== Number.MAX_SAFE_INTEGER &&
      currentPkgWeight + weight > maxWeightPerPackage) {
      return false
    }

    return true
  }

  // Distribuir productos en paquetes
  for (const item of sortedProducts) {
    const quantity = item.quantity || 1
    const weight = parseFloat(item.product?.weight || item.product?.peso || item.weight || item.peso || 0) * quantity

    // Si este producto no cabe en el paquete actual, crear uno nuevo
    if (!canAddToPackage(item, currentCount, currentWeight)) {
      // Solo añadir el paquete actual si tiene productos
      if (currentPackage.length > 0) {
        packages.push(currentPackage)
        currentPackage = []
        currentWeight = 0
        currentCount = 0
      }

      // Si es un solo producto que excede límites, forzar su inclusión en un paquete separado
      if (maxProductsPerPackage === 1 ||
        (weight <= maxWeightPerPackage && weight > 0)) {
        // Este producto irá solo en su propio paquete
        packages.push([item])
        continue
      } else if (weight > maxWeightPerPackage) {
        // Este producto excede el peso máximo pero debemos aceptarlo
        console.log(`⚠️ Producto con peso ${weight} excede el máximo de ${maxWeightPerPackage} pero debe incluirse`)
        packages.push([item])
        continue
      }
    }

    // Añadir el producto al paquete actual
    currentPackage.push(item)
    currentWeight += weight
    currentCount += 1
  }

  // Añadir el último paquete si tiene productos
  if (currentPackage.length > 0) {
    packages.push(currentPackage)
  }

  // Si no se pudieron crear paquetes válidos, devolver todos los productos en un solo paquete
  // Esto es mejor que rechazar la combinación entera
  if (packages.length === 0) {
    console.log('⚠️ No se pudieron crear paquetes válidos, ignorando restricciones')
    return [products]
  }

  console.log(`📦 Productos divididos en ${packages.length} paquetes según restricciones`)
  return packages
}

/**
 * Optimiza las combinaciones de envío para evitar redundancias
 * @param {Array} combinations - Combinaciones generadas
 * @returns {Array} - Combinaciones optimizadas
 */
const optimizeCombinations = (combinations) => {
  if (!combinations || combinations.length === 0) return []

  // Mapa para detectar combinaciones equivalentes
  const uniqueCombos = new Map()

  combinations.forEach(combo => {
    // Crear una clave única basada en los productos y sus zonas
    const productZones = new Map()

    combo.options.forEach(option => {
      option.products.forEach(product => {
        const productId = product.product?.id || product.id
        const zoneId = option.zoneId
        productZones.set(productId, zoneId)
      })
    })

    // Convertir el mapa a string para usar como clave
    const key = Array.from(productZones.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([pid, zid]) => `${pid}:${zid}`)
      .join('|')

    // Solo guardar la combinación si es más barata que una existente
    if (!uniqueCombos.has(key) || uniqueCombos.get(key).totalPrice > combo.totalPrice) {
      uniqueCombos.set(key, combo)
    }
  })

  // Convertir el mapa de vuelta a array
  return Array.from(uniqueCombos.values())
}

/**
 * Genera todas las combinaciones posibles de opciones de envío para un carrito
 * @param {Array} cartItems - Productos en el carrito
 * @param {Array} zones - Zonas de envío disponibles
 * @param {Array} productGroups - Grupos de productos por regla
 * @returns {Array} - Combinaciones de envío posibles
 */
export const buildCombinations = (cartItems, zones, productGroups) => {
  if (!cartItems || cartItems.length === 0 || !zones || zones.length === 0) {
    console.warn('⚠️ No se pueden generar combinaciones sin productos o zonas')
    return []
  }

  // 1. Extraer IDs únicos de productos para validación
  const uniqueProductIds = new Set()
  cartItems.forEach(item => {
    const productId = item.product?.id || item.id
    if (productId) uniqueProductIds.add(productId)
  })
  console.log(`🛒 Total de productos únicos en carrito: ${uniqueProductIds.size}`)

  // 2. Mapear productos a sus zonas compatibles
  const productZonesMap = new Map()
  cartItems.forEach(item => {
    const product = item.product || item
    const productId = product.id

    if (!productId) {
      console.warn('⚠️ Producto sin ID, ignorando')
      return
    }

    // Obtener reglas de envío del producto
    const productRules = product.shippingRuleIds ||
      (product.shippingRuleId ? [product.shippingRuleId] : [])

    // Encontrar zonas compatibles
    const compatibleZones = zones.filter(zone =>
      productRules.includes(zone.id),
    )

    if (compatibleZones.length === 0) {
      console.warn(`⚠️ No hay zonas compatibles para producto ${productId}`)
    } else {
      console.log(`✅ Producto ${productId} tiene ${compatibleZones.length} zonas compatibles`)
    }

    productZonesMap.set(productId, compatibleZones)
  })

  // 3. Generar todas las combinaciones posibles que cubran TODOS los productos
  const combinations = []

  // Función recursiva para generar combinaciones
  const generateCombinations = (remainingProducts, currentCombo = [], usedZones = new Set()) => {
    // Si no quedan productos, tenemos una combinación válida
    if (remainingProducts.length === 0) {
      combinations.push([...currentCombo])
      return
    }

    // Tomar el siguiente producto
    const currentProduct = remainingProducts[0]
    const compatibleZones = productZonesMap.get(currentProduct)

    // Probar cada zona compatible para este producto
    compatibleZones.forEach(zone => {
      // Si ya usamos esta zona, ver si podemos agregar este producto a ella
      if (usedZones.has(zone.id)) {
        const existingCombo = currentCombo.find(c => c.zoneId === zone.id)
        if (existingCombo) {
          existingCombo.products.push(currentProduct)
          generateCombinations(remainingProducts.slice(1), currentCombo, usedZones)
          existingCombo.products.pop()
        }
      } else {
        // Usar una nueva zona
        currentCombo.push({
          zoneId: zone.id,
          zone,
          products: [currentProduct],
        })
        usedZones.add(zone.id)
        generateCombinations(remainingProducts.slice(1), currentCombo, usedZones)
        usedZones.delete(zone.id)
        currentCombo.pop()
      }
    })
  }

  // Iniciar generación con todos los productos
  generateCombinations([...uniqueProductIds])

  console.log(`🔄 Se generaron ${combinations.length} combinaciones base`)

  // 4. Convertir combinaciones en opciones de envío
  const shippingCombinations = []

  combinations.forEach((combo, index) => {
    // Agrupar por zona para calcular precios
    const zoneGroups = new Map()

    combo.forEach(item => {
      if (!zoneGroups.has(item.zoneId)) {
        zoneGroups.set(item.zoneId, {
          zone: item.zone,
          products: [],
        })
      }
      zoneGroups.get(item.zoneId).products.push(...item.products)
    })

    // Calcular precio para cada grupo
    const options = []
    let totalPrice = 0
    let allProductsCovered = true

    for (const [zoneId, group] of zoneGroups) {
      const zone = group.zone

      // Obtener productos completos del grupo
      const groupProducts = group.products.map(productId =>
        cartItems.find(item => (item.product?.id || item.id) === productId),
      ).filter(Boolean)

      // Calcular precio para este grupo
      const priceInfo = calculateShippingPrice(groupProducts, {}, zone)

      if (priceInfo.exceedsLimits) {
        allProductsCovered = false
        break
      }

      // Verificar si hay alguna opción de mensajería configurada
      let mensajerias = []
      if (zone.opciones_mensajeria && zone.opciones_mensajeria.length > 0) {
        // Usar todas las opciones de mensajería disponibles
        mensajerias = zone.opciones_mensajeria
        console.log(`💰 Zona ${zone.zona || zone.nombre} tiene ${mensajerias.length} opciones de mensajería`)
      } else {
        // Si no hay opciones, usar un objeto vacío como fallback
        mensajerias = [{}]
      }

      // Para cada opción de mensajería, crear una opción de envío
      const zoneOptions = []

      for (const mensajeria of mensajerias) {
        // Calcular con la opción de mensajería explícita
        const detailedPriceInfo = calculateShippingPrice(groupProducts, mensajeria, zone)

        // Verificar si el precio es 0 pero no debería serlo
        if (detailedPriceInfo.price === 0 && !zone.envio_gratis) {
          console.log(`⚠️ Posible error de cálculo: precio 0 para zona ${zone.zona} con opción ${mensajeria.nombre || 'default'}`)
        }

        // Generar un ID único para esta opción
        const optionId = `${zoneId}_${mensajeria.nombre || 'default'}_${index}`

        zoneOptions.push({
          id: optionId,
          zoneId,
          zoneName: zone.nombre || zone.zona || 'Zona de envío',
          zoneType: zone.zona || zone.coverage_type || 'standard',
          carrierName: mensajeria.nombre || zone.transportista || zone.nombre || 'Servicio de Envío',
          carrierLabel: mensajeria.label || 'Estándar',
          products: groupProducts,
          price: detailedPriceInfo.price,
          isFree: detailedPriceInfo.isFree,
          freeShipping: zone.envio_gratis || detailedPriceInfo.isFree,
          estimatedDelivery: mensajeria.tiempo_entrega || zone.tiempo_entrega || '1-7 días',
          // Añadir información detallada para diagnóstico
          rule: zone,
          mensajeria: mensajeria,
          subtotal: detailedPriceInfo.totalAmount || groupProducts.reduce((sum, item) => {
            const price = parseFloat(item.product?.price || item.price || 0)
            const quantity = parseInt(item.quantity || 1)
            return sum + (price * quantity)
          }, 0),
          freeReason: detailedPriceInfo.freeReason,
        })

        totalPrice += detailedPriceInfo.price
      }

      options.push(...zoneOptions)
    }

    // Solo agregar si es una combinación válida que cubre todos los productos
    if (allProductsCovered) {
      const coveredProducts = new Set(
        options.flatMap(opt => opt.products.map(p => p.product?.id || p.id)),
      )

      if (coveredProducts.size === uniqueProductIds.size) {
        shippingCombinations.push({
          id: `combo_${index}_${Date.now()}`,
          options,
          totalPrice,
          isComplete: true,
        })
      }
    }
  })

  // 5. Ordenar por precio y optimizar
  shippingCombinations.sort((a, b) => a.totalPrice - b.totalPrice)

  // Eliminar duplicados y mantener solo la opción más barata para cada conjunto de productos
  const uniqueCombos = new Map()
  shippingCombinations.forEach(combo => {
    const key = combo.options
      .map(opt => `${opt.zoneId}:${opt.products.map(p => p.product?.id || p.id).sort().join(',')}`)
      .sort()
      .join('|')

    if (!uniqueCombos.has(key) || uniqueCombos.get(key).totalPrice > combo.totalPrice) {
      uniqueCombos.set(key, combo)
    }
  })

  const finalCombinations = Array.from(uniqueCombos.values())
  console.log(`✅ Se generaron ${finalCombinations.length} combinaciones válidas finales`)

  return finalCombinations
}