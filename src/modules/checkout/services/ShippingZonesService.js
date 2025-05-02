import { collection, getDocs, query, where } from 'firebase/firestore'
import { FirebaseDB } from '@config/firebase/firebaseConfig.js'

// Colección donde se almacenan las zonas de envío
const SHIPPING_ZONES_COLLECTION = 'zonas_envio'

/**
 * Obtiene todas las zonas de envío activas
 * @returns {Promise<Array>} Zonas de envío activas
 */
export const getActiveShippingZones = async () => {
  try {
    // Query para obtener zonas activas
    const zonesQuery = query(
      collection(FirebaseDB, SHIPPING_ZONES_COLLECTION),
      where('activo', '==', true),
    )

    const querySnapshot = await getDocs(zonesQuery)
    const zones = []

    querySnapshot.forEach(doc => {
      zones.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    console.log(`🌍 Zonas de envío activas obtenidas: ${zones.length}`)
    return zones
  } catch (error) {
    console.error('Error al obtener zonas de envío activas:', error)
    return []
  }
}

/**
 * Busca directamente en Firebase zonas que tengan el código postal específico
 * Esto evita tener que filtrar en memoria y puede ser más preciso
 * @param {string} postalCode - Código postal a buscar
 * @returns {Promise<Array>} - Zonas que contienen explícitamente el código postal
 */
export const getZonesWithExactPostalCode = async (postalCode) => {
  if (!postalCode) return []

  try {
    // Buscar zonas que contengan este CP exacto en su array de códigos postales
    const postalCodeQuery = query(
      collection(FirebaseDB, SHIPPING_ZONES_COLLECTION),
      where('activo', '==', true),
      where('codigos_postales', 'array-contains', postalCode),
    )

    const querySnapshot = await getDocs(postalCodeQuery)
    const zones = []

    querySnapshot.forEach(doc => {
      zones.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    console.log(`🔍 Zonas encontradas con CP ${postalCode} exacto: ${zones.length}`)
    return zones
  } catch (error) {
    console.error(`Error buscando zonas con CP ${postalCode} exacto:`, error)
    return []
  }
}

/**
 * Obtiene zonas de envío aplicables a un código postal
 * @param {string} postalCode - Código postal del usuario
 * @returns {Promise<Array>} Zonas de envío aplicables
 */
export const getShippingZonesForPostalCode = async (postalCode) => {
  try {
    if (!postalCode) {
      console.warn('⚠️ Código postal no proporcionado')
      return []
    }

    // Normalizar el código postal para comparaciones
    const normalizedPostalCode = postalCode.trim()
    console.log(`🔎 Buscando zonas para CP: ${normalizedPostalCode}`)

    // 1. Primero intentar búsqueda directa (más eficiente)
    let applicableZones = await getZonesWithExactPostalCode(normalizedPostalCode)

    // 2. Si no encontramos zonas específicas, obtener todas y filtrar con nuestra lógica extendida
    if (applicableZones.length === 0) {
      console.log(`ℹ️ No se encontraron zonas directas, aplicando filtros manuales`)

      // Obtener todas las zonas activas
      const allZones = await getActiveShippingZones()

      // Filtrar zonas que aplican al código postal
      applicableZones = allZones.filter(zone => {
        // 1. Zonas nacionales aplican a cualquier CP
        if (zone.tipo === 'nacional' ||
          zone.cobertura === 'nacional' ||
          zone.zona?.toLowerCase() === 'nacional' ||
          zone.coverage_type?.toLowerCase() === 'nacional' ||
          zone.national === true) {
          console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica porque es nacional`)
          return true
        }

        // 2. Zonas con lista de códigos postales específicos
        if (zone.codigos_postales && Array.isArray(zone.codigos_postales)) {
          // Verificar si el código postal está en la lista (con normalización)
          const codeInList = zone.codigos_postales.some(cp =>
            cp.toString().trim() === normalizedPostalCode,
          )

          if (codeInList) {
            console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por coincidencia de CP en lista`)
            return true
          }
        }

        // 3. Zonas con rango de códigos postales
        if (zone.codigo_postal_desde && zone.codigo_postal_hasta) {
          const pcNum = parseInt(normalizedPostalCode)
          const fromNum = parseInt(zone.codigo_postal_desde.toString())
          const toNum = parseInt(zone.codigo_postal_hasta.toString())

          if (!isNaN(pcNum) && !isNaN(fromNum) && !isNaN(toNum) &&
            pcNum >= fromNum && pcNum <= toNum) {
            console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por rango de CP ${fromNum}-${toNum}`)
            return true
          }
        }

        // 4. Zonas con formato antiguo de coverage
        if (zone.coverage && zone.coverage.type) {
          // Tipo nacional
          if (zone.coverage.type === 'nationwide' ||
            zone.coverage.type === 'nacional' ||
            zone.coverage.type === 'national') {
            console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica porque tiene coverage type nacional`)
            return true
          }

          // Tipo código postal
          if ((zone.coverage.type === 'postal_code' ||
              zone.coverage.type === 'codigo_postal' ||
              zone.coverage.type === 'zipcode') &&
            zone.coverage.values && Array.isArray(zone.coverage.values)) {

            // Verificar si el código postal está en los valores de cobertura
            const codeInValues = zone.coverage.values.some(value => {
              // Puede ser un string o un objeto con propiedad code o codigo
              if (typeof value === 'string') {
                return value.trim() === normalizedPostalCode
              } else if (value && (value.code || value.codigo)) {
                const code = (value.code || value.codigo).toString().trim()
                return code === normalizedPostalCode
              }
              return false
            })

            if (codeInValues) {
              console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por coincidencia en coverage.values`)
              return true
            }
          }
        }

        // 5. Coincidir con propiedad zip_codes en cualquier formato
        if (zone.zip_codes) {
          if (Array.isArray(zone.zip_codes)) {
            // Si es un array, buscar coincidencia directa
            const codeInList = zone.zip_codes.some(cp =>
              cp.toString().trim() === normalizedPostalCode,
            )

            if (codeInList) {
              console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por coincidencia en zip_codes array`)
              return true
            }
          } else if (typeof zone.zip_codes === 'string') {
            // Si es string, dividir por comas y buscar
            const codesArray = zone.zip_codes.split(',').map(cp => cp.trim())
            const codeInList = codesArray.includes(normalizedPostalCode)

            if (codeInList) {
              console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por coincidencia en zip_codes string`)
              return true
            }
          }
        }

        // 6. Comprobar campo zipcode o zip
        if (zone.zipcode === normalizedPostalCode || zone.zip === normalizedPostalCode) {
          console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por coincidencia exacta de zipcode`)
          return true
        }

        // 7. Si tiene una propiedad codigo_postal que coincide
        if (zone.codigo_postal && zone.codigo_postal.toString().trim() === normalizedPostalCode) {
          console.log(`✅ Zona ${zone.id} (${zone.nombre || 'sin nombre'}) aplica por coincidencia en codigo_postal`)
          return true
        }

        // Si no coincide por ningún criterio, no aplica
        return false
      })
    }

    console.log(`🗺️ Zonas aplicables al CP ${normalizedPostalCode}: ${applicableZones.length}`)

    // Si no hay zonas aplicables, buscar zonas nacionales
    if (applicableZones.length === 0) {
      console.log('⚠️ No hay zonas específicas para este CP, buscando zonas nacionales')
      const allZones = await getActiveShippingZones()

      // Filtrar solo zonas nacionales
      const nationalZones = allZones.filter(zone =>
        zone.tipo === 'nacional' ||
        zone.cobertura === 'nacional' ||
        zone.zona?.toLowerCase() === 'nacional' ||
        zone.coverage_type?.toLowerCase() === 'nacional' ||
        zone.national === true,
      )

      if (nationalZones.length > 0) {
        console.log(`✅ Encontradas ${nationalZones.length} zonas nacionales como alternativa`)
        return nationalZones
      }
    }

    return applicableZones
  } catch (error) {
    console.error('Error al obtener zonas para código postal:', error)
    return []
  }
}

/**
 * Calcula el precio de envío para un paquete según las reglas configuradas
 * @param {Array} products - Productos en el paquete
 * @param {Object} mensajeria - Opción de mensajería
 * @param {Object} zone - Zona de envío
 * @returns {Object} Información del precio calculado
 */
export const calculateShippingPrice = (products, mensajeria = {}, zone = {}) => {
  try {
    if (!products?.length || !zone) {
      return {
        price: 0,
        basePrice: 0,
        isFree: true,
        productCount: 0,
        totalWeight: 0,
        exceedsLimits: false,
      }
    }

    // 1. Calcular totales del paquete
    const packageInfo = products.reduce((acc, item) => {
      const quantity = parseInt(item.quantity || 1)
      const weight = parseFloat(item.product?.weight || item.product?.peso || item.weight || item.peso || 0) * quantity
      const price = parseFloat(item.product?.price || item.product?.precio || item.price || item.precio || 0) * quantity

      return {
        totalWeight: acc.totalWeight + weight,
        totalProducts: acc.totalProducts + quantity,
        totalAmount: acc.totalAmount + price,
      }
    }, { totalWeight: 0, totalProducts: 0, totalAmount: 0 })

    console.log('📦 Información del paquete:', packageInfo)

    // 2. Verificar límites del paquete
    const packageConfig = zone.configuracion_paquetes || mensajeria.configuracion_paquetes || {}
    const maxWeight = packageConfig.peso_maximo_paquete || mensajeria.peso_maximo || 0
    const maxProducts = packageConfig.maximo_productos_por_paquete || 0

    if (maxWeight > 0 && packageInfo.totalWeight > maxWeight) {
      return {
        exceedsLimits: true,
        limitMessage: `El peso total (${packageInfo.totalWeight}kg) excede el máximo permitido (${maxWeight}kg)`,
        ...packageInfo,
      }
    }

    if (maxProducts > 0 && packageInfo.totalProducts > maxProducts) {
      return {
        exceedsLimits: true,
        limitMessage: `La cantidad de productos (${packageInfo.totalProducts}) excede el máximo permitido (${maxProducts})`,
        ...packageInfo,
      }
    }

    // 3. Verificar si aplica envío gratis
    if (zone.envio_gratis) {
      console.log('✨ Zona con envío gratis')
      return {
        price: 0,
        basePrice: 0,
        isFree: true,
        freeReason: 'Envío gratuito en esta zona',
        ...packageInfo,
      }
    }

    // 4. Verificar envío gratis por monto mínimo
    console.log('🔍 Verificando envío gratis por monto mínimo:')
    console.log(`   - Monto mínimo configurado: ${zone.envio_gratis_monto_minimo} (tipo: ${typeof zone.envio_gratis_monto_minimo})`)
    console.log(`   - Subtotal del paquete: ${packageInfo.totalAmount} (tipo: ${typeof packageInfo.totalAmount})`)

    let minFreeAmount = 0
    if (typeof zone.envio_gratis_monto_minimo === 'string') {
      minFreeAmount = parseFloat(zone.envio_gratis_monto_minimo)
      console.log(`   - Convertido de string a número: ${minFreeAmount}`)
    } else if (typeof zone.envio_gratis_monto_minimo === 'number') {
      minFreeAmount = zone.envio_gratis_monto_minimo
      console.log(`   - Ya es número: ${minFreeAmount}`)
    }

    // Verificar si el envío es gratuito por monto mínimo
    if (minFreeAmount > 0 && packageInfo.totalAmount >= minFreeAmount) {
      console.log(`✨ Envío gratis aplicado: subtotal ${packageInfo.totalAmount} >= monto mínimo ${minFreeAmount}`)
      return {
        price: 0,
        basePrice: 0,
        isFree: true,
        freeReason: `Envío gratuito en compras mayores a $${minFreeAmount}`,
        rule: zone,
        subtotal: packageInfo.totalAmount,
        ...packageInfo,
      }
    } else {
      console.log(`❌ No aplica envío gratis por monto: ${packageInfo.totalAmount} < ${minFreeAmount}`)
    }

    // 5. Calcular precio base
    let basePrice = parseFloat(mensajeria.precio || mensajeria.costo_base || 0)
    let finalPrice = basePrice
    let priceDetails = [`Precio base: $${basePrice}`]

    // Log detallado para diagnóstico de precios
    console.log('💰 Calculando precio de envío:', {
      zona: zone.zona || zone.nombre || 'Sin nombre',
      basePrice,
      mensajeria_precio: mensajeria.precio,
      mensajeria_costo_base: mensajeria.costo_base,
      zone_precio_base: zone.precio_base,
      packageInfo,
    })

    // Corrección: Si el precio es 0 pero la zona no tiene envío gratuito, asignar un precio base razonable
    if (basePrice === 0 && !zone.envio_gratis &&
      (!zone.envio_gratis_monto_minimo ||
        packageInfo.totalAmount < parseFloat(zone.envio_gratis_monto_minimo))) {

      console.log('⚠️ Detectada inconsistencia: precio base es 0 pero no hay razón para envío gratuito')

      // Buscar precio en la primera opción de mensajería disponible
      if (zone.opciones_mensajeria && zone.opciones_mensajeria.length > 0) {
        const firstOption = zone.opciones_mensajeria[0]
        basePrice = parseFloat(firstOption.precio || 0)
        console.log(`🔧 Usando precio de primera opción de mensajería: $${basePrice}`)
      }
      // O usar precio_base de la zona
      else if (zone.precio_base) {
        basePrice = parseFloat(zone.precio_base)
        console.log(`🔧 Usando precio_base de la zona: $${basePrice}`)
      }
      // O usar un valor predeterminado
      else {
        basePrice = zone.zona?.toLowerCase() === 'nacional' ? 200 : 0
        console.log(`🔧 Usando precio predeterminado por tipo de zona: $${basePrice}`)
      }

      finalPrice = basePrice
      priceDetails = [`Precio base (corregido): $${basePrice}`]
    }

    // 6. Aplicar reglas variables de envío
    if (zone.envio_variable) {
      // 6.1 Costo extra por peso
      const extraWeightKg = Math.max(0, packageInfo.totalWeight - (packageConfig.peso_base || 0))
      if (extraWeightKg > 0 && packageConfig.costo_por_kg_extra > 0) {
        const extraWeightCost = extraWeightKg * packageConfig.costo_por_kg_extra
        finalPrice += extraWeightCost
        priceDetails.push(`Cargo por peso extra (${extraWeightKg}kg): $${extraWeightCost}`)
      }

      // 6.2 Costo extra por productos
      const extraProducts = Math.max(0, packageInfo.totalProducts - (packageConfig.productos_base || 1))
      if (extraProducts > 0 && packageConfig.costo_por_producto_extra > 0) {
        const extraProductsCost = extraProducts * packageConfig.costo_por_producto_extra
        finalPrice += extraProductsCost
        priceDetails.push(`Cargo por productos extra (${extraProducts}): $${extraProductsCost}`)
      }

      // 6.3 Aplicar reglas específicas de la zona
      if (zone.envio_variable.reglas_peso) {
        // Ordenar reglas por peso de mayor a menor
        const weightRules = [...zone.envio_variable.reglas_peso].sort((a, b) => b.peso - a.peso)

        // Encontrar la primera regla que aplique
        const applicableRule = weightRules.find(rule => packageInfo.totalWeight >= rule.peso)
        if (applicableRule) {
          finalPrice = applicableRule.precio
          priceDetails = [`Precio por regla de peso (>${applicableRule.peso}kg): $${finalPrice}`]
        }
      }
    }

    console.log('💰 Desglose del precio:', priceDetails.join('\n'))

    return {
      price: finalPrice,
      basePrice,
      isFree: finalPrice === 0,
      priceDetails,
      exceedsLimits: false,
      ...packageInfo,
    }
  } catch (error) {
    console.error('❌ Error calculando precio de envío:', error)
    return {
      price: 0,
      basePrice: 0,
      isFree: false,
      error: error.message,
      exceedsLimits: true,
    }
  }
}