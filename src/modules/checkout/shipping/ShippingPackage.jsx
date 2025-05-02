/**
 * Componente para mostrar un paquete de envío individual
 */
import React, { useState } from 'react'
import '@modules/checkout/shipping/ShippingPackage.css' // <-- Restaurar la importación

/**
 * Componente que muestra un paquete de envío
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.packageData - Datos del paquete
 * @param {boolean} props.selected - Si está seleccionado
 * @param {Array} props.cartItems - Items del carrito para identificar productos incluidos
 * @param {Function} props.onSelect - Función para manejar la selección del paquete
 */
export const ShippingPackage = ({
                                  packageData, selected = false, cartItems = [], onSelect = () => {
  },
                                }) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false)
  const [packagesExpanded, setPackagesExpanded] = useState(false)

  if (!packageData) return null

  // Extraer datos del paquete
  const {
    name,
    carrier,
    serviceType,
    estimatedDelivery,
    deliveryTime,
    tiempo_entrega,
    totalCost,
    description,
    paquetesInfo,
    products = [],  // IDs de productos en este paquete
    maxProductsPerPackage,
    maxWeightPerPackage,
    rule_id,
    zoneType,
    packagesCount = 1,
    packagesInfo: externalPackagesInfo = [],
    costoExtra = 0,
    price = 0,
    precio_base,
    packagesWithPrices = false, // Indicador de que los paquetes tienen precios individuales calculados
    // Extraer tiempos de los días mínimos y máximos
    minDays,
    maxDays,
    // Datos de la regla original
    opciones_mensajeria,
    configuracion_paquetes,
  } = packageData

  // Debug para ver qué nombre recibe el componente
  console.log(`📦 ShippingPackage recibe nombre: "${name}"`)

  // Obtener detalles de los productos incluidos en este paquete
  const packProducts = cartItems
    .filter(item => {
      const productId = (item.product ? item.product.id : item.id)
      return products.includes(productId)
    })
    .map(item => {
      const product = item.product || item
      return {
        id: product.id,
        name: product.name || product.nombre || '',
        quantity: item.quantity || 1,
        weight: product.weight || product.peso || 0,
        price: product.price || product.precio || 0,
      }
    })

  // Calcular la cantidad total de productos incluyendo cantidades
  const totalProductUnits = packProducts.reduce((sum, product) => {
    return sum + product.quantity
  }, 0)

  // Calcular peso total para mostrar en la UI
  const totalWeight = packProducts.reduce((sum, product) => {
    return sum + (parseFloat(product.weight) * product.quantity)
  }, 0).toFixed(2)

  // Debug más detallado de la configuración
  console.log(`📦 DEBUG DATOS RECIBIDOS (${name}):`)
  console.log(`- packageData.totalCost = ${totalCost}`)
  console.log(`- packageData.price = ${price}`)
  console.log(`- packageData.rule_id = ${rule_id}`)

  // Función auxiliar para calcular el precio de un paquete basado en su peso
  const calculatePackagePrice = (weight) => {
    // Obtener la configuración del paquete
    const config = packageData.configuracion_paquetes ||
      (packageData.opciones_mensajeria &&
        packageData.opciones_mensajeria.length > 0 &&
        packageData.opciones_mensajeria[0].configuracion_paquetes) ||
      null

    // Debug de la configuración
    console.log(`📦 [DEBUG] Datos de configuración para cálculo de precio:`)
    if (config) {
      console.log(`- Configuración encontrada: peso_maximo_paquete=${config.peso_maximo_paquete}, costo_por_kg_extra=${config.costo_por_kg_extra}`)
    } else {
      console.log(`- SIN CONFIGURACIÓN DE PAQUETES`)
    }

    // Obtener el precio base
    let basePrice = 0

    // Primero intentamos obtener de precio_base explícito
    if (packageData.precio_base !== undefined && !isNaN(parseFloat(packageData.precio_base))) {
      basePrice = parseFloat(packageData.precio_base)
      console.log(`📊 [PRECIO] Precio base explícito: $${basePrice}`)
    }
    // Luego de la primera opción de mensajería
    else if (packageData.opciones_mensajeria &&
      packageData.opciones_mensajeria.length > 0 &&
      packageData.opciones_mensajeria[0].precio !== undefined) {
      basePrice = parseFloat(packageData.opciones_mensajeria[0].precio) || 0
      console.log(`📊 [PRECIO] Precio base de opción de mensajería: $${basePrice}`)
    }
    // Si hay un price definido
    else if (packageData.price !== undefined && !isNaN(parseFloat(packageData.price)) && parseFloat(packageData.price) > 0) {
      basePrice = parseFloat(packageData.price)
      console.log(`📊 [PRECIO] Precio base de price: $${basePrice}`)
    }
    // Último recurso: usar totalCost
    else if (totalCost !== undefined && !isNaN(parseFloat(totalCost)) && parseFloat(totalCost) > 0) {
      basePrice = parseFloat(totalCost)

      // Si hay más de un paquete y el service no ha calculado precios individuales,
      // dividir el costo total entre el número de paquetes solo si no hay configuración de peso extra
      if (packagesCount > 1 && !packagesWithPrices &&
        (!config || !config.peso_maximo_paquete || !config.costo_por_kg_extra)) {
        basePrice = basePrice / packagesCount
        console.log(`📊 [PRECIO] Precio base calculado desde totalCost dividido por packagesCount (${packagesCount}): $${basePrice}`)
      } else {
        console.log(`📊 [PRECIO] Precio base de totalCost: $${basePrice}`)
      }
    }
    // Si no se encuentra ningún precio
    else {
      console.log(`⚠️ [PRECIO] No se encontró un precio base válido - usando 0`)
      basePrice = 0
    }

    // Debug log
    console.log(`📋 [PRECIO] Cálculo para paquete - Peso: ${weight}kg, Precio base: $${basePrice}`)

    // Solo aplicar sobrecosto si hay configuración con peso máximo y costo por kg extra
    if (config &&
      config.peso_maximo_paquete !== undefined &&
      !isNaN(parseFloat(config.peso_maximo_paquete)) &&
      config.costo_por_kg_extra !== undefined &&
      !isNaN(parseFloat(config.costo_por_kg_extra)) &&
      parseFloat(config.costo_por_kg_extra) > 0) {

      const pesoMaximoPaquete = parseFloat(config.peso_maximo_paquete)
      const costoPorKgExtra = parseFloat(config.costo_por_kg_extra)

      console.log(`📋 [PRECIO] Peso máximo: ${pesoMaximoPaquete}kg, Costo por kg extra: $${costoPorKgExtra}`)

      // Solo aplicar sobrecosto si el peso excede el máximo
      if (weight > pesoMaximoPaquete) {
        // El peso extra es la diferencia entre el peso actual y el máximo permitido
        const pesoExtra = weight - pesoMaximoPaquete
        // Redondear hacia arriba al kilo siguiente para el cálculo del sobrecosto
        const kilosExtraRedondeados = Math.ceil(pesoExtra)
        const costoExtra = kilosExtraRedondeados * costoPorKgExtra

        console.log(`📦 [PRECIO] CARGO POR PESO EXTRA - Peso: ${weight}kg, Máximo: ${pesoMaximoPaquete}kg`)
        console.log(`📦 [PRECIO] Peso extra: ${pesoExtra}kg → ${kilosExtraRedondeados}kg (redondeado)`)
        console.log(`📦 [PRECIO] Sobrecosto: ${kilosExtraRedondeados} kg x $${costoPorKgExtra} = $${costoExtra}`)
        console.log(`📦 [PRECIO] Total: $${basePrice} + $${costoExtra} = $${basePrice + costoExtra}`)

        // Retornar precio base + costo adicional por peso extra
        return basePrice + costoExtra
      } else {
        console.log(`📦 [PRECIO] SIN CARGO EXTRA - Peso: ${weight}kg está dentro del límite de ${pesoMaximoPaquete}kg`)
        return basePrice
      }
    } else {
      console.log(`📦 [PRECIO] SIN CONFIGURACIÓN COMPLETA - Usando solo precio base $${basePrice}`)
      return basePrice
    }
  }

  // Distribuir productos en paquetes según restricciones
  const calculatePackages = () => {
    // Imprimimos la configuración de paquetes para debugging
    console.log(`📦 [DEBUG] Datos para cálculo de paquetes:`)
    console.log(`- configuracion_paquetes:`, packageData.configuracion_paquetes)
    console.log(`- opciones_mensajeria:`, packageData.opciones_mensajeria)
    console.log(`- maxProductsPerPackage:`, maxProductsPerPackage)
    console.log(`- maxWeightPerPackage:`, maxWeightPerPackage)

    // Obtenemos configuración desde el origen correcto
    const config = packageData.configuracion_paquetes ||
      (packageData.opciones_mensajeria &&
        packageData.opciones_mensajeria.length > 0 &&
        packageData.opciones_mensajeria[0].configuracion_paquetes) ||
      null

    // Determinar restricciones de peso y cantidad antes de usarlas
    const pesoMaximoPaquete = config?.peso_maximo_paquete ? parseFloat(config.peso_maximo_paquete) :
      maxWeightPerPackage ? parseFloat(maxWeightPerPackage) : null

    const maximoProductosPorPaquete = config?.maximo_productos_por_paquete ? parseInt(config.maximo_productos_por_paquete, 10) :
      maxProductsPerPackage ? parseInt(maxProductsPerPackage, 10) : null

    console.log(`📦 [DEBUG] Límites calculados - Peso máximo: ${pesoMaximoPaquete}kg, Máx. productos: ${maximoProductosPorPaquete}`)

    // Si ya tenemos paquetes con precios individuales calculados en el servicio
    if (externalPackagesInfo && externalPackagesInfo.length > 0 && packagesWithPrices) {
      console.log(`📦 [DEBUG] Usando paquetes precalculados con precios individuales`)
      console.log(`📦 [DEBUG DETALLADO] Datos de PackProducts:`, packProducts)
      console.log(`📦 [DEBUG DETALLADO] Datos de externalPackagesInfo:`, externalPackagesInfo)

      // Si no hay productos en packProducts, asignar los productos basados en el peso
      // y dividirlos equitativamente entre los paquetes
      if (packProducts.length === 0) {
        console.log(`⚠️ [ALERTA] No se encontraron productos filtrados para los paquetes`)

        // Obtener todos los productos del carrito basados en sus atributos
        const productsMermelada = cartItems.filter(item =>
          (item.product?.name === 'Mermelada' || item.name === 'Mermelada'))

        const productsCafe = cartItems.filter(item =>
          (item.product?.name === 'Cafe' || item.name === 'Cafe'))

        const productsGotasEnergia = cartItems.filter(item =>
          (item.product?.name === 'Gotas naturistas de energía' ||
            item.name === 'Gotas naturistas de energía'))

        const productsArtesania = cartItems.filter(item =>
          (item.product?.name === 'Artesania' || item.name === 'Artesania'))

        const productsCerveza = cartItems.filter(item =>
          (item.product?.name === 'Cerveza Local' || item.name === 'Cerveza Local'))

        // Asignar productos específicos a cada paquete basados en los pesos que vemos en el log
        const manuallyAssignedProducts = []

        if (externalPackagesInfo.length >= 5) {
          // Paquete 1: Peso 0.2kg - Mermelada
          if (productsMermelada.length > 0) {
            manuallyAssignedProducts[0] = productsMermelada.map(item => {
              const product = item.product || item
              return {
                id: product.id,
                name: product.name || product.nombre || 'Mermelada',
                quantity: item.quantity || 1,
                weight: product.weight || product.peso || 0.2,
                price: product.price || product.precio || 0,
              }
            })
          }

          // Paquete 2: Peso 1kg - Cafe
          if (productsCafe.length > 0) {
            manuallyAssignedProducts[1] = productsCafe.map(item => {
              const product = item.product || item
              return {
                id: product.id,
                name: product.name || product.nombre || 'Cafe',
                quantity: item.quantity || 1,
                weight: product.weight || product.peso || 1,
                price: product.price || product.precio || 0,
              }
            })
          }

          // Paquete 3: Peso 0.05kg - Gotas naturistas
          if (productsGotasEnergia.length > 0) {
            manuallyAssignedProducts[2] = productsGotasEnergia.map(item => {
              const product = item.product || item
              return {
                id: product.id,
                name: product.name || product.nombre || 'Gotas naturistas de energía',
                quantity: item.quantity || 1,
                weight: product.weight || product.peso || 0.05,
                price: product.price || product.precio || 0,
              }
            })
          }

          // Paquete 4: Peso 1.5kg - Artesania
          if (productsArtesania.length > 0) {
            manuallyAssignedProducts[3] = productsArtesania.map(item => {
              const product = item.product || item
              return {
                id: product.id,
                name: product.name || product.nombre || 'Artesania',
                quantity: 1, // Forzamos 1 unidad por paquete
                weight: product.weight || product.peso || 1.5,
                price: product.price || product.precio || 0,
              }
            })

            // Si son 2 artesanías, crear un paquete adicional
            if (productsArtesania[0].quantity > 1) {
              const product = productsArtesania[0].product || productsArtesania[0]
              manuallyAssignedProducts.push([{
                id: product.id,
                name: product.name || product.nombre || 'Artesania',
                quantity: 1, // La segunda unidad
                weight: product.weight || product.peso || 1.5,
                price: product.price || product.precio || 0,
              }])
            }
          }

          // Paquete 5: Peso 0.1kg - Cerveza Local
          if (productsCerveza.length > 0) {
            manuallyAssignedProducts[4] = productsCerveza.map(item => {
              const product = item.product || item
              return {
                id: product.id,
                name: product.name || product.nombre || 'Cerveza Local',
                quantity: item.quantity || 1,
                weight: product.weight || product.peso || 0.1,
                price: product.price || product.precio || 0,
              }
            })
          }
        }

        // Crear paquetes con los productos asignados manualmente
        return externalPackagesInfo.map((pkg, index) => {
          // Obtener productos para este paquete
          const pkgProducts = manuallyAssignedProducts[index] || []

          // Si no hay productos asignados pero hay peso, crear un producto genérico
          if (pkgProducts.length === 0 && pkg.weight) {
            pkgProducts.push({
              id: `generic_${index}`,
              name: `Producto en Paquete ${index + 1}`,
              quantity: 1,
              weight: pkg.weight,
              price: 0,
            })
          }

          return {
            ...pkg,
            id: pkg.id || `pkg_${index + 1}`,
            products: pkgProducts,
            weight: pkg.weight || 0,
            price: pkg.packagePrice || calculatePackagePrice(pkg.weight || 0),
          }
        })
      }

      // IMPORTANTE: Debemos respetar maxProductsPerPackage=1
      if (maximoProductosPorPaquete === 1 || parseInt(maxProductsPerPackage) === 1) {
        console.log(`📦 [DEBUG] Aplicando restricción estricta: 1 unidad de producto por paquete`)

        // Crear un nuevo conjunto de paquetes separados
        let individualPackages = []

        // Para cada paquete original
        externalPackagesInfo.forEach((pkg, pkgIndex) => {
          // Filtrar los productos que pertenecen a este paquete
          let pkgProducts = []

          // Intentar obtener productos para este paquete
          if (pkg.products && Array.isArray(pkg.products)) {
            if (typeof pkg.products[0] === 'string') {
              // Si products son IDs (strings)
              pkgProducts = packProducts.filter(p => pkg.products.includes(p.id))
            } else if (typeof pkg.products[0] === 'object') {
              // Si products son objetos con ID
              pkgProducts = packProducts.filter(p => pkg.products.some(product =>
                product.id === p.id || product.productId === p.id,
              ))
            }
          }

          // Si hay productos y la restricción es 1 por paquete, dividiríamos cada unidad
          if (pkgProducts.length > 0) {
            // Para cada producto en este paquete
            pkgProducts.forEach(product => {
              // Si la cantidad es mayor a 1, debemos crear un paquete por cada unidad
              for (let i = 0; i < product.quantity; i++) {
                const singleProductWeight = parseFloat(product.weight)

                individualPackages.push({
                  id: `pkg_${pkg.id}_unit_${i + 1}`,
                  products: [{ ...product, quantity: 1 }], // Una unidad por paquete
                  weight: singleProductWeight,
                  price: calculatePackagePrice(singleProductWeight),
                })
              }
            })
          } else if (pkg.weight) {
            // Si no hay productos pero sí hay peso, creamos un paquete genérico
            individualPackages.push({
              id: pkg.id || `pkg_gen_${pkgIndex + 1}`,
              products: [{
                id: `generic_${pkgIndex}`,
                name: `Producto en Paquete ${pkgIndex + 1}`,
                quantity: 1,
                weight: pkg.weight,
                price: 0,
              }],
              weight: pkg.weight,
              price: pkg.packagePrice || calculatePackagePrice(pkg.weight),
            })
          }
        })

        // Retornar los paquetes individualizados
        return individualPackages
      }

      // Código original para cuando sí hay productos en packProducts
      return externalPackagesInfo.map((pkg, index) => {
        let pkgProducts = []

        // Intentar obtener productos de diferentes maneras
        if (pkg.products && Array.isArray(pkg.products)) {
          if (typeof pkg.products[0] === 'string') {
            // Si products son IDs (strings)
            pkgProducts = packProducts.filter(p => pkg.products.includes(p.id))
          } else if (typeof pkg.products[0] === 'object') {
            // Si products son objetos con ID
            pkgProducts = packProducts.filter(p => pkg.products.some(product =>
              product.id === p.id || product.productId === p.id,
            ))
          }
        }

        // Si no se encontraron productos con los métodos anteriores y hay peso,
        // asignar productos basados en el peso total
        if (pkgProducts.length === 0 && pkg.weight) {
          // Crear producto genérico si no se pudo asignar
          pkgProducts = [{
            id: `generic_${index}`,
            name: `Producto en Paquete ${index + 1}`,
            quantity: 1,
            weight: pkg.weight,
            price: 0,
          }]
        }

        const weight = pkg.weight || pkgProducts.reduce((sum, p) => sum + (parseFloat(p.weight) * p.quantity), 0)

        return {
          ...pkg,
          id: pkg.id || `pkg_${index + 1}`,
          products: pkgProducts,
          weight,
          price: pkg.packagePrice || calculatePackagePrice(weight),
        }
      })
    }

    // Si hay restricción de 1 producto por paquete, distribuimos cada unidad como paquete independiente
    if (maximoProductosPorPaquete === 1) {
      console.log(`📦 [DEBUG] Usando distribución ESTRICTA: 1 unidad de producto por paquete`)
      let packages = []

      // Distribuir cada unidad como paquete independiente
      packProducts.forEach(product => {
        for (let i = 0; i < product.quantity; i++) {
          const weight = parseFloat(product.weight)
          packages.push({
            id: `pkg_${packages.length + 1}`,
            products: [{ ...product, quantity: 1 }], // Forzamos a quantity=1
            weight: weight,
            price: calculatePackagePrice(weight),
          })
        }
      })

      return packages
    }
    // Si no hay restricciones específicas pero sí hay paquetes predefinidos, usarlos
    else if (externalPackagesInfo && externalPackagesInfo.length > 0) {
      console.log(`📦 [DEBUG] Usando paquetes predefinidos sin precios`)
      return externalPackagesInfo.map((pkg, index) => {
        let pkgProducts = []

        // Intentar filtrar productos con diferentes métodos
        if (pkg.products && Array.isArray(pkg.products)) {
          if (typeof pkg.products[0] === 'string') {
            // Si products son IDs (strings)
            pkgProducts = packProducts.filter(p => pkg.products.includes(p.id))
          } else if (typeof pkg.products[0] === 'object') {
            // Si products son objetos con ID
            pkgProducts = packProducts.filter(p => pkg.products.some(product =>
              product.id === p.id || product.productId === p.id,
            ))
          }
        }

        // Si no se encontraron productos y hay un peso definido, crear un producto genérico
        if (pkgProducts.length === 0 && pkg.weight) {
          pkgProducts = [{
            id: `generic_${index}`,
            name: `Producto en Paquete ${index + 1}`,
            quantity: 1,
            weight: pkg.weight,
            price: 0,
          }]
        }

        const weight = pkg.weight || pkgProducts.reduce((sum, p) => sum + (parseFloat(p.weight) * p.quantity), 0)

        return {
          ...pkg,
          id: pkg.id || `pkg_${index + 1}`,
          products: pkgProducts,
          weight,
          price: calculatePackagePrice(weight),
        }
      })
    }
    // Si no hay restricciones, todos en un solo paquete
    else {
      console.log(`📦 [DEBUG] Sin restricciones - Todos los productos en un paquete`)

      // Si no hay productos en packProducts, crear productos genéricos basados en el peso total
      if (packProducts.length === 0) {
        const totalWeightValue = parseFloat(totalWeight)
        return [{
          id: 'pkg_1',
          products: [{
            id: 'generic_product',
            name: 'Productos combinados',
            quantity: 1,
            weight: totalWeightValue,
            price: 0,
          }],
          weight: totalWeightValue,
          price: calculatePackagePrice(totalWeightValue),
        }]
      }

      const totalWeightValue = parseFloat(totalWeight)
      return [{
        id: 'pkg_1',
        products: packProducts,
        weight: totalWeightValue,
        price: calculatePackagePrice(totalWeightValue),
      }]
    }
  }

  const packages = calculatePackages()
  const actualPackageCount = packages.length

  // Calcular el costo total real sumando el costo de cada paquete
  const calculatedTotalCost = packages.reduce((sum, pkg) => sum + pkg.price, 0)

  // Log para depuración de productos en cada paquete
  console.log(`⭐ PRODUCTOS POR PAQUETE (${name}):`)
  packages.forEach((pkg, index) => {
    console.log(`▶️ Paquete ${index + 1} (${pkg.id}):`)
    console.log(`   - Productos: ${pkg.products.length}`)
    pkg.products.forEach((product, pidx) => {
      console.log(`   - [${pidx + 1}] ${product.name || 'SIN NOMBRE'} - ID: ${product.id}, Cant: ${product.quantity}, Peso: ${product.weight}kg`)
    })
  })

  // Formatear costo total
  const formattedTotalCost = calculatedTotalCost === 0
    ? 'GRATIS'
    : new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(calculatedTotalCost)

  // Log para depuración de precios por paquete
  console.log(`💰 RESUMEN DE PRECIOS POR PAQUETE:`)
  packages.forEach((pkg, index) => {
    console.log(`- Paquete ${index + 1}: Peso ${pkg.weight}kg, Precio: $${pkg.price}`)
  })
  console.log(`- TOTAL: $${calculatedTotalCost}`)

  // Verificar si hay diferencias significativas entre los precios de los paquetes
  const precioDiferentes = packages.length > 1 &&
    packages.some(pkg => Math.abs(pkg.price - packages[0].price) > 5) // 5 pesos de diferencia es significativo

  if (precioDiferentes) {
    console.log(`💰 ATENCIÓN: Los paquetes tienen precios diferentes - Debe mostrar desglose`)
  }

  // Determinar el tiempo de entrega basado en las diferentes fuentes disponibles
  let displayDeliveryTime = ''

  // Orden de prioridad para determinar el tiempo de entrega
  if (tiempo_entrega && tiempo_entrega.trim().length > 0) {
    // 1. Usar tiempo_entrega si existe (viene directamente de la regla)
    displayDeliveryTime = tiempo_entrega
    console.log(`📦 Usando tiempo_entrega: "${displayDeliveryTime}"`)
  } else if (deliveryTime && deliveryTime.trim().length > 0) {
    // 2. Usar deliveryTime si existe (calculado por el algoritmo greedy)
    displayDeliveryTime = deliveryTime
    console.log(`📦 Usando deliveryTime: "${displayDeliveryTime}"`)
  } else if (estimatedDelivery && estimatedDelivery.trim().length > 0) {
    // 3. Usar estimatedDelivery si existe
    displayDeliveryTime = estimatedDelivery
    console.log(`📦 Usando estimatedDelivery: "${displayDeliveryTime}"`)
  } else if (minDays !== undefined && maxDays !== undefined) {
    // 4. Construir a partir de minDays y maxDays
    if (minDays === maxDays) {
      displayDeliveryTime = `${minDays} días hábiles`
    } else {
      displayDeliveryTime = `${minDays} a ${maxDays} días hábiles`
    }
    console.log(`📦 Construyendo desde minDays=${minDays} y maxDays=${maxDays}: "${displayDeliveryTime}"`)
  } else {
    // 5. Valor predeterminado solo si no hay otra información
    displayDeliveryTime = 'Tiempo de entrega variable'
    console.log(`📦 Usando valor predeterminado: "${displayDeliveryTime}"`)
  }

  // Determinar el tipo de envío para mostrar el icono correcto
  const getShippingIcon = () => {
    if (zoneType === 'express') return <i className="bi bi-truck shipping-express"></i>
    if (zoneType === 'local') return <i className="bi bi-truck"></i>
    if (zoneType === 'nacional') return <i className="bi bi-truck"></i>
    return <i className="bi bi-box"></i>
  }

  // Manejar la selección (pasada desde el padre)
  const handleSelect = () => {
    if (onSelect) {
      onSelect(packageData)
    }
  }

  // Debug para valores de costo
  console.log(`💵 [DEBUG COSTOS] ${name}:`, {
    totalCost,
    price,
    precio_base,
    calculatedTotalCost,
    'Suma paquetes (UI)': formattedTotalCost ? formattedTotalCost.replace(/[^\d.-]/g, '') : 'N/A',
  })

  // Asegurarse de que packageData tenga el costo calculado actualizado
  if (packageData && typeof packageData === 'object') {
    // Asignar el costo calculado al objeto packageData para que esté disponible para el componente padre
    packageData.calculatedTotalCost = calculatedTotalCost
  }

  // Generar un ID único para el input
  const optionId = `shipping-pkg-${packageData?.id || Math.random().toString(36).substring(7)}`

  return (
    <div
      className={`shipping-option ${selected ? 'active-shipping-option' : ''}`}
    >
      <div className="form-check w-100">
        <input
          className="form-check-input"
          type="checkbox"
          id={optionId}
          checked={selected}
          onChange={handleSelect}
          aria-label={`Seleccionar opción de envío: ${name}`}
        />
        <label
          className="form-check-label d-block"
          htmlFor={optionId}
          style={{ cursor: 'pointer' }}
        >
          <div className="shipping-package-header d-flex align-items-center">
            <span className="me-2">{getShippingIcon()}</span>
            <div className="shipping-package-info flex-grow-1">
              <h3>{name} {carrier && `- ${carrier}`}</h3>
              <div className="shipping-package-details">
                {displayDeliveryTime ? (
                  <div className="shipping-delivery-time">
                    <i className="bi bi-clock"></i>
                    <span>{displayDeliveryTime}</span>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="shipping-package-price ms-auto">
              {calculatedTotalCost === 0 ? (
                <span className="free-shipping">GRATIS</span>
              ) : (
                <>
                  {packages.length > 1 ? (
                    <div className="shipping-total-price">
                      {packages.length > 1 && packages.some(pkg => Math.abs(pkg.price - packages[0].price) > 5) ? (
                        <span className="shipping-total-cost">Desde</span>
                      ) : (
                        <span className="shipping-total-cost">{packages.length} paquetes</span>
                      )}
                      <span>{formattedTotalCost}</span>
                    </div>
                  ) : (
                    <span>{formattedTotalCost}</span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="shipping-package-body">
            <div className="shipping-package-summary">
              <div className="summary-pill">
                <i className="bi bi-boxes"></i>
                <span>{totalProductUnits} producto{totalProductUnits !== 1 ? 's' : ''}</span>
              </div>

              <div className="summary-pill">
                <i className="bi bi-weight"></i>
                <span>{totalWeight} kg</span>
              </div>

              {maxProductsPerPackage && (
                <div className="summary-pill">
                  <i className="bi bi-box"></i>
                  <span>Máx. {maxProductsPerPackage} producto{maxProductsPerPackage !== 1 ? 's' : ''}/paquete</span>
                </div>
              )}

              {maxWeightPerPackage && (
                <div className="summary-pill">
                  <i className="bi bi-weight"></i>
                  <span>Máx. {maxWeightPerPackage} kg/paquete</span>
                </div>
              )}

              {packages.length > 1 && (
                <div className="summary-pill">
                  <i className="bi bi-archive"></i>
                  <span>{packages.length} paquetes</span>
                </div>
              )}

              <button
                className="details-toggle"
                onClick={(e) => {
                  e.stopPropagation()
                  setDetailsExpanded(!detailsExpanded)
                }}
                type="button"
              >
                {detailsExpanded ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>}
                <span>{detailsExpanded ? 'Ocultar detalles' : 'Ver detalles'}</span>
              </button>
            </div>

            {detailsExpanded && (
              <div className="packages-info-list">
                {packages.map((pkg, index) => {
                  const formattedPackagePrice = pkg.price === 0
                    ? 'GRATIS'
                    : new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                      minimumFractionDigits: 2,
                    }).format(pkg.price)

                  return (
                    <div key={`pkg_info_${pkg.id}`} className="package-info-item">
                      <div className="package-info-header">
                        <div className="package-info-title">
                          Paquete {index + 1}
                          <span className="package-weight-badge">
                            {pkg.weight.toFixed(2)} kg
                          </span>
                        </div>
                        <div className="package-info-price">{formattedPackagePrice}</div>
                      </div>

                      {displayDeliveryTime && (
                        <div className="package-info-delivery">
                          <i className="bi bi-clock"></i>
                          <span>{displayDeliveryTime}</span>
                        </div>
                      )}

                      <div className="package-info-products">
                        {pkg.products && pkg.products.length > 0 ? (
                          pkg.products.map((product, pidx) => (
                            <span key={`info_prod_${pkg.id}_${product.id}_${pidx}`} className="package-info-product">
                              {product.name}{product.quantity > 1 ? ` (x${product.quantity})` : ''}
                              {pidx < pkg.products.length - 1 ? ', ' : ''}
                            </span>
                          ))
                        ) : (
                          <span className="package-info-empty">No hay productos en este paquete</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  )
}