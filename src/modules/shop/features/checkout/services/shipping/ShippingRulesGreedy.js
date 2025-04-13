/**
 * Algoritmo Greedy para cálculo de opciones de envío
 * 
 * Esta implementación simplificada:
 * 1. Filtra reglas compatibles con la dirección del usuario
 * 2. Asigna la mejor regla para cada producto
 * 3. Agrupa productos por regla para minimizar envíos
 * 4. Calcula costos precisos basados en los datos de Firebase
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Determina si una regla de envío es válida para la dirección proporcionada
 * @param {Object} rule - Regla de envío desde Firebase
 * @param {Object} address - Dirección del usuario
 * @returns {boolean} - true si la regla es válida
 */
const isRuleValidForAddress = (rule, address) => {
  if (!rule || !address) return false;
  
  // Normalizar datos para comparación
  const postalCode = (address.postalCode || address.zip || '').toString().trim();
  const state = (address.state || address.provincia || '').toString().toLowerCase().trim();
  const country = (address.country || 'MX').toString().toLowerCase().trim();
  
  // Verificar tipo de cobertura
  switch(rule.coverage_type || rule.tipo_cobertura) {
    // Cobertura nacional
    case 'nacional':
      return true;
    
    // Cobertura por código postal
    case 'por_codigo_postal':
    case 'postal_code':
      return Array.isArray(rule.coverage_values) && 
             rule.coverage_values.some(cp => cp.toString().trim() === postalCode);
    
    // Cobertura por estado/provincia
    case 'por_estado':
    case 'state':
      return Array.isArray(rule.coverage_values) && 
             rule.coverage_values.some(s => s.toString().toLowerCase().trim() === state);
             
    // Cobertura por país
    case 'por_pais':
    case 'country':
      return rule.coverage_country?.toLowerCase().trim() === country;
  }
  
  // Verificar campos alternativos (compatibilidad con esquema actual)
  if (Array.isArray(rule.cobertura_cp) && rule.cobertura_cp.some(cp => cp.toString().trim() === postalCode)) {
    return true;
  }
  
  if (Array.isArray(rule.cobertura_estados) && rule.cobertura_estados.some(s => s.toString().toLowerCase().trim() === state)) {
    return true;
  }
  
  return false;
};

/**
 * Calcula el costo de envío basado en datos reales
 * @param {Object} rule - Regla de envío
 * @param {Array} products - Productos a enviar
 * @returns {Object} - Información de costo y tiempo de entrega
 */
const calculateShippingDetails = (rule, products) => {
  if (!rule || !products || products.length === 0) {
    return { cost: 0, minDays: null, maxDays: null, isFree: false };
  }
  
  // Debugging para ver toda la información de tiempos en la regla
  console.log(`🕒 ANÁLISIS DE TIEMPOS DE ENTREGA - Regla ID: ${rule.id}`);
  console.log(`- tiempo_minimo: ${rule.tiempo_minimo}`);
  console.log(`- min_days: ${rule.min_days}`);
  console.log(`- tiempo_maximo: ${rule.tiempo_maximo}`);
  console.log(`- max_days: ${rule.max_days}`);
  
  // Calcular subtotal para validar envío gratis por monto mínimo
  const subtotal = products.reduce((sum, item) => {
    const product = item.product || item;
    const price = parseFloat(product.price || 0);
    const quantity = parseInt(item.quantity || 1, 10);
    return sum + (price * quantity);
  }, 0);
  
  // Por defecto, tomar datos de la regla
  let cost = parseFloat(rule.precio_base || rule.base_price || 0);
  let isFree = rule.envio_gratis === true || rule.free_shipping === true;
  
  // Calcular peso total de los productos
  const pesoTotal = products.reduce((sum, product) => {
    return sum + parseFloat(product.weight || 0);
  }, 0);
  
  // Aplicar reglas de configuración de paquetes si existen
  if (rule.configuracion_paquetes) {
    const config = rule.configuracion_paquetes;
    
    // Verificar si aplica cargo por peso extra
    if (config.peso_maximo_paquete !== undefined && config.costo_por_kg_extra !== undefined) {
      const pesoMaximo = parseFloat(config.peso_maximo_paquete);
      const costoPorKgExtra = parseFloat(config.costo_por_kg_extra);
      
      if (!isNaN(pesoMaximo) && !isNaN(costoPorKgExtra) && pesoTotal > pesoMaximo) {
        const pesoExtra = pesoTotal - pesoMaximo;
        const costoExtra = pesoExtra * costoPorKgExtra;
        
        console.log(`📦 Cargo por peso extra: ${pesoExtra.toFixed(2)}kg x ${costoPorKgExtra}$ = ${costoExtra.toFixed(2)}$`);
        cost += costoExtra;
      }
    }
    
    // Verificar si aplica cargo por producto extra
    if (config.maximo_productos_por_paquete !== undefined && config.costo_por_producto_extra !== undefined) {
      const maxProductos = parseInt(config.maximo_productos_por_paquete, 10);
      const costoPorProductoExtra = parseFloat(config.costo_por_producto_extra);
      
      if (!isNaN(maxProductos) && !isNaN(costoPorProductoExtra) && products.length > maxProductos) {
        const productosExtra = products.length - maxProductos;
        const costoExtra = productosExtra * costoPorProductoExtra;
        
        console.log(`📦 Cargo por productos extra: ${productosExtra} x ${costoPorProductoExtra}$ = ${costoExtra.toFixed(2)}$`);
        cost += costoExtra;
      }
    }
  }
  
  // Leer los tiempos de entrega SOLO de la regla sin valores por defecto
  let minDays = null;
  let maxDays = null;
  
  // Intentar obtener valores de tiempo de entrega directamente de la regla
  if (rule.tiempo_minimo !== undefined && rule.tiempo_minimo !== null) {
    minDays = parseInt(rule.tiempo_minimo, 10);
  } else if (rule.min_days !== undefined && rule.min_days !== null) {
    minDays = parseInt(rule.min_days, 10);
  } else if (rule.minDays !== undefined && rule.minDays !== null) {
    minDays = parseInt(rule.minDays, 10);
  }
  
  if (rule.tiempo_maximo !== undefined && rule.tiempo_maximo !== null) {
    maxDays = parseInt(rule.tiempo_maximo, 10);
  } else if (rule.max_days !== undefined && rule.max_days !== null) {
    maxDays = parseInt(rule.max_days, 10);
  } else if (rule.maxDays !== undefined && rule.maxDays !== null) {
    maxDays = parseInt(rule.maxDays, 10);
  }
  
  // Si tiene opciones de mensajería, usar datos de la opción preferida
  if (Array.isArray(rule.opciones_mensajeria) && rule.opciones_mensajeria.length > 0) {
    // Log para opciones de mensajería
    console.log(`- Opciones de mensajería: ${rule.opciones_mensajeria.length}`);
    rule.opciones_mensajeria.forEach((opcion, index) => {
      console.log(`  Opción #${index+1}: ${JSON.stringify(opcion)}`);
      console.log(`  - tiempo_minimo: ${opcion.tiempo_minimo}`);
      console.log(`  - min_days: ${opcion.min_days}`);
      console.log(`  - minDays: ${opcion.minDays}`);
      console.log(`  - tiempo_maximo: ${opcion.tiempo_maximo}`);
      console.log(`  - max_days: ${opcion.max_days}`);
      console.log(`  - maxDays: ${opcion.maxDays}`);
      console.log(`  - tiempo_entrega: ${opcion.tiempo_entrega}`);
    });
    
    // Ordenar por precio para obtener la más económica
    const sortedOptions = [...rule.opciones_mensajeria].sort((a, b) => 
      parseFloat(a.precio || 0) - parseFloat(b.precio || 0)
    );
    
    const bestOption = sortedOptions[0];
    cost = parseFloat(bestOption.precio || 0);
    
    // Aplicar reglas de configuración de paquetes para la opción de mensajería
    if (bestOption.configuracion_paquetes) {
      const config = bestOption.configuracion_paquetes;
      
      // Verificar si aplica cargo por peso extra
      if (config.peso_maximo_paquete !== undefined && config.costo_por_kg_extra !== undefined) {
        const pesoMaximo = parseFloat(config.peso_maximo_paquete);
        const costoPorKgExtra = parseFloat(config.costo_por_kg_extra);
        
        if (!isNaN(pesoMaximo) && !isNaN(costoPorKgExtra) && pesoTotal > pesoMaximo) {
          const pesoExtra = pesoTotal - pesoMaximo;
          const costoExtra = pesoExtra * costoPorKgExtra;
          
          console.log(`📦 [Opción] Cargo por peso extra: ${pesoExtra.toFixed(2)}kg x ${costoPorKgExtra}$ = ${costoExtra.toFixed(2)}$`);
          cost += costoExtra;
        }
      }
      
      // Verificar si aplica cargo por producto extra
      if (config.maximo_productos_por_paquete !== undefined && config.costo_por_producto_extra !== undefined) {
        const maxProductos = parseInt(config.maximo_productos_por_paquete, 10);
        const costoPorProductoExtra = parseFloat(config.costo_por_producto_extra);
        
        if (!isNaN(maxProductos) && !isNaN(costoPorProductoExtra) && products.length > maxProductos) {
          const productosExtra = products.length - maxProductos;
          const costoExtra = productosExtra * costoPorProductoExtra;
          
          console.log(`📦 [Opción] Cargo por productos extra: ${productosExtra} x ${costoPorProductoExtra}$ = ${costoExtra.toFixed(2)}$`);
          cost += costoExtra;
        }
      }
    }
    
    // Actualizar tiempos solo si están definidos en la opción
    // IMPORTANTE: Comprobar todas las posibles ubicaciones de los tiempos de entrega
    if (bestOption.tiempo_minimo !== undefined && bestOption.tiempo_minimo !== null) {
      minDays = parseInt(bestOption.tiempo_minimo, 10);
    } else if (bestOption.min_days !== undefined && bestOption.min_days !== null) {
      minDays = parseInt(bestOption.min_days, 10);
    } else if (bestOption.minDays !== undefined && bestOption.minDays !== null) {
      minDays = parseInt(bestOption.minDays, 10);
    }
    
    if (bestOption.tiempo_maximo !== undefined && bestOption.tiempo_maximo !== null) {
      maxDays = parseInt(bestOption.tiempo_maximo, 10);
    } else if (bestOption.max_days !== undefined && bestOption.max_days !== null) {
      maxDays = parseInt(bestOption.max_days, 10);
    } else if (bestOption.maxDays !== undefined && bestOption.maxDays !== null) {
      maxDays = parseInt(bestOption.maxDays, 10);
    }
    
    // Extraer tiempos desde el campo tiempo_entrega (formato "1-3 días")
    if ((minDays === null || maxDays === null) && bestOption.tiempo_entrega) {
      const tiempoMatch = bestOption.tiempo_entrega.match(/(\d+)[-\s]*(\d+)/);
      if (tiempoMatch && tiempoMatch.length >= 3) {
        if (minDays === null) minDays = parseInt(tiempoMatch[1], 10);
        if (maxDays === null) maxDays = parseInt(tiempoMatch[2], 10);
        console.log(`  - Extraídos de tiempo_entrega: min=${minDays}, max=${maxDays}`);
      } else if (bestOption.tiempo_entrega.match(/(\d+)/)) {
        // Si solo hay un número (ej: "2 días")
        const singleMatch = bestOption.tiempo_entrega.match(/(\d+)/);
        const days = parseInt(singleMatch[1], 10);
        if (minDays === null) minDays = days;
        if (maxDays === null) maxDays = days;
        console.log(`  - Extraído de tiempo_entrega (valor único): ${days} días`);
      }
    }
  }
  
  // Verificar si aplica envío gratis por monto mínimo
  if (!isFree && rule.envio_gratis_monto_minimo && subtotal >= parseFloat(rule.envio_gratis_monto_minimo)) {
    isFree = true;
  }
  
  // Si es gratis, costo cero
  if (isFree) {
    cost = 0;
  }
  
  // Asegurar que maxDays nunca sea menor que minDays si ambos existen
  if (minDays !== null && maxDays !== null && maxDays < minDays) {
    maxDays = minDays;
  }
  
  // Imprimir los valores finales para debugging
  console.log(`🕒 RESULTADO DE TIEMPOS - Regla ID: ${rule.id}`);
  console.log(`- minDays: ${minDays}`);
  console.log(`- maxDays: ${maxDays}`);
  console.log(`💰 Costo final calculado: ${cost}`);
  
  return {
    cost,
    minDays,
    maxDays,
    isFree
  };
};

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
    return true;
  }
  
  const config = rule.configuracion_paquetes;
  
  // Verificar límite de productos por paquete
  if (config.maximo_productos_por_paquete !== undefined) {
    const maxProductos = parseInt(config.maximo_productos_por_paquete, 10);
    if (!isNaN(maxProductos) && group.products.length >= maxProductos) {
      console.log(`⚠️ No se puede añadir ${product.name || product.id} al grupo: límite de ${maxProductos} productos alcanzado`);
      return false;
    }
  }
  
  // Verificar límite de peso por paquete
  if (config.peso_maximo_paquete !== undefined) {
    const pesoMaximo = parseFloat(config.peso_maximo_paquete);
    
    if (!isNaN(pesoMaximo)) {
      // Calcular peso actual del grupo
      const pesoActual = group.products.reduce((sum, p) => {
        return sum + parseFloat(p.weight || 0);
      }, 0);
      
      // Añadir el peso del nuevo producto
      const pesoTotal = pesoActual + parseFloat(product.weight || 0);
      
      if (pesoTotal > pesoMaximo) {
        console.log(`⚠️ No se puede añadir ${product.name || product.id} al grupo: peso máximo de ${pesoMaximo}kg excedido (${pesoTotal}kg)`);
        return false;
      }
    }
  }
  
  return true;
};

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
    return { success: false, error: "No hay productos en el carrito" };
  }
  
  if (!address) {
    return { success: false, error: "No se proporcionó dirección de envío" };
  }
  
  if (!shippingRules || !Array.isArray(shippingRules) || shippingRules.length === 0) {
    return { success: false, error: "No hay reglas de envío disponibles" };
  }
  
  console.log(`🔍 Procesando ${cartItems.length} productos con ${shippingRules.length} reglas de envío`);
  
  // Paso 1: Encontrar reglas válidas para cada producto
  const validRulesByProduct = {};
  const productsWithoutRules = [];
  
  cartItems.forEach(item => {
    const product = item.product || item;
    const productId = product.id;
    
    // Obtener reglas asignadas al producto
    const assignedRuleIds = product.shippingRuleIds || [];
    
    if (!assignedRuleIds.length) {
      productsWithoutRules.push(product);
      return;
    }
    
    // Filtrar reglas válidas que cubran la dirección
    const validRules = shippingRules
      .filter(rule => assignedRuleIds.includes(rule.id) && isRuleValidForAddress(rule, address));
    
    if (validRules.length > 0) {
      validRulesByProduct[productId] = validRules;
    } else {
      productsWithoutRules.push(product);
    }
  });
  
  // Si hay productos sin reglas válidas, no podemos completar el envío
  if (productsWithoutRules.length > 0) {
    const productNames = productsWithoutRules.map(p => p.name || `ID: ${p.id}`).join(', ');
    
    // Verificar si hay al menos un producto con regla válida
    if (Object.keys(validRulesByProduct).length > 0) {
      // Modificación: Continuar con los productos que sí tienen reglas válidas
      console.log(`⚠️ Envío parcial: ${productsWithoutRules.length} productos no tienen envío disponible a esta dirección: ${productNames}`);
      
      // Paso 2: Agrupar productos por regla para minimizar envíos
      const shippingGroups = [];
      const productAssignments = {};
      
      // Primera pasada: intentar agrupar productos por reglas similares
      Object.entries(validRulesByProduct).forEach(([productId, validRules]) => {
        // Encontrar el producto original
        const item = cartItems.find(item => (item.product || item).id === productId);
        if (!item) return;
        
        const product = item.product || item;
        
        // Ordenar reglas por costo (menor primero)
        const sortedRules = [...validRules].sort((a, b) => {
          const costA = parseFloat(a.precio_base || a.base_price || 100);
          const costB = parseFloat(b.precio_base || b.base_price || 100);
          return costA - costB;
        });
        
        // Intentar añadir a un grupo existente
        let addedToGroup = false;
        
        for (const group of shippingGroups) {
          // Verificar si alguna regla del producto es la misma que la del grupo
          if (sortedRules.some(rule => rule.id === group.rule.id)) {
            // Verificar restricciones de peso y cantidad
            if (canAddProductToGroup(group, product, group.rule)) {
              group.products.push(product);
              productAssignments[productId] = group.rule.id;
              addedToGroup = true;
              break;
            }
          }
        }
        
        // Si no se pudo añadir a ningún grupo, crear uno nuevo
        if (!addedToGroup) {
          const bestRule = sortedRules[0];
          const newGroup = {
            id: uuidv4(),
            rule: bestRule,
            products: [product]
          };
          
          shippingGroups.push(newGroup);
          productAssignments[productId] = bestRule.id;
        }
      });
      
      // Paso 3: Calcular costos y detalles de envío para cada grupo
      const shippingOptions = shippingGroups.map(group => {
        // REMOVE initial calculation for the whole group:
        // const { cost, minDays, maxDays, isFree } = calculateShippingDetails(group.rule, group.products);
        
        // --- START: Extract static details from the rule ---
        let minDays = null;
        let maxDays = null;
        let deliveryTimeText = '';
        const rule = group.rule; // Use a shorter alias

        // Extract min/max days (check various possible fields)
        if (rule.tiempo_minimo !== undefined && rule.tiempo_minimo !== null) minDays = parseInt(rule.tiempo_minimo, 10);
        else if (rule.min_days !== undefined && rule.min_days !== null) minDays = parseInt(rule.min_days, 10);
        else if (rule.minDays !== undefined && rule.minDays !== null) minDays = parseInt(rule.minDays, 10);

        if (rule.tiempo_maximo !== undefined && rule.tiempo_maximo !== null) maxDays = parseInt(rule.tiempo_maximo, 10);
        else if (rule.max_days !== undefined && rule.max_days !== null) maxDays = parseInt(rule.max_days, 10);
        else if (rule.maxDays !== undefined && rule.maxDays !== null) maxDays = parseInt(rule.maxDays, 10);
        
        // Use tiempos from opciones_mensajeria if available (assuming first option is preferred/cheapest)
        if (Array.isArray(rule.opciones_mensajeria) && rule.opciones_mensajeria.length > 0) {
          const bestOption = rule.opciones_mensajeria[0]; // Assuming sorted elsewhere or taking the first
          
          // Override min/max days from the specific option
          if (bestOption.tiempo_minimo !== undefined && bestOption.tiempo_minimo !== null) minDays = parseInt(bestOption.tiempo_minimo, 10);
          else if (bestOption.min_days !== undefined && bestOption.min_days !== null) minDays = parseInt(bestOption.min_days, 10);
          else if (bestOption.minDays !== undefined && bestOption.minDays !== null) minDays = parseInt(bestOption.minDays, 10);
          
          if (bestOption.tiempo_maximo !== undefined && bestOption.tiempo_maximo !== null) maxDays = parseInt(bestOption.tiempo_maximo, 10);
          else if (bestOption.max_days !== undefined && bestOption.max_days !== null) maxDays = parseInt(bestOption.max_days, 10);
          else if (bestOption.maxDays !== undefined && bestOption.maxDays !== null) maxDays = parseInt(bestOption.maxDays, 10);
          
          // Use tiempo_entrega string if present
          if (bestOption.tiempo_entrega) {
            deliveryTimeText = bestOption.tiempo_entrega;
            console.log(`📅 [Per Package] Usando tiempo_entrega predefinido: "${deliveryTimeText}"`);
            // Attempt to extract min/max if not already set
             if ((minDays === null || maxDays === null)) {
               const tiempoMatch = bestOption.tiempo_entrega.match(/(\d+)[-\s]*(\d+)/);
               if (tiempoMatch && tiempoMatch.length >= 3) {
                 if (minDays === null) minDays = parseInt(tiempoMatch[1], 10);
                 if (maxDays === null) maxDays = parseInt(tiempoMatch[2], 10);
                 console.log(`  - [Per Package] Extraídos de tiempo_entrega: min=${minDays}, max=${maxDays}`);
               } else if (bestOption.tiempo_entrega.match(/(\d+)/)) {
                 const singleMatch = bestOption.tiempo_entrega.match(/(\d+)/);
                 const days = parseInt(singleMatch[1], 10);
                 if (minDays === null) minDays = days;
                 if (maxDays === null) maxDays = days;
                 console.log(`  - [Per Package] Extraído de tiempo_entrega (valor único): ${days} días`);
               }
             }
          }
        }

        // Generate deliveryTimeText if not set by specific option
        if (!deliveryTimeText && minDays !== null && maxDays !== null) {
          if (minDays === maxDays) {
            deliveryTimeText = minDays === 1 ? `Entrega en 1 día hábil` : `Entrega en ${minDays} días hábiles`;
          } else {
            deliveryTimeText = `Entrega en ${minDays}-${maxDays} días hábiles`;
          }
          console.log(`📅 [Per Package] Tiempo de entrega generado: "${deliveryTimeText}"`);
        }
        // --- END: Extract static details from the rule ---

        
        // --- START: Package Splitting Logic (modified to keep full product objects) ---
        let packagesCount = 1;
        let packagesInfo = []; // Array to hold package details { id, products: [full_product_objects], weight, productCount, subtotal, packagePrice, isFree }
        
        const ruleConfig = rule.configuracion_paquetes || (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0 ? rule.opciones_mensajeria[0].configuracion_paquetes : {});
        const hasPackageConfig = !!ruleConfig;
        
        const maxProductsPerPackage = hasPackageConfig ? parseInt(ruleConfig.maximo_productos_por_paquete, 10) : NaN;
        const maxWeightPerPackage = hasPackageConfig ? parseFloat(ruleConfig.peso_maximo_paquete) : NaN;
        
        if (!isNaN(maxProductsPerPackage) && maxProductsPerPackage > 0 && group.products.length > maxProductsPerPackage) {
           // Split by max products
           packagesCount = Math.ceil(group.products.length / maxProductsPerPackage);
           for (let i = 0; i < packagesCount; i++) {
             const startIdx = i * maxProductsPerPackage;
             const endIdx = Math.min(startIdx + maxProductsPerPackage, group.products.length);
             const packageProducts = group.products.slice(startIdx, endIdx); // Keep full objects
             packagesInfo.push({
               id: `pkg_${group.id}_${i+1}`,
               products: packageProducts, // Store full product objects
               productCount: packageProducts.length,
               weight: packageProducts.reduce((sum, p) => sum + parseFloat(p.weight || 0), 0) // Calculate weight
             });
           }
           console.log(`📦 [Per Package] Se dividirá en ${packagesCount} paquetes por restricción de ${maxProductsPerPackage} productos.`);
        
        } else if (!isNaN(maxWeightPerPackage) && maxWeightPerPackage > 0) {
            // Try splitting by max weight
            let currentPackageProducts = [];
            let currentPackageWeight = 0;
            packagesInfo = [];

            for (const product of group.products) {
              const productWeight = parseFloat(product.weight || 0);
              // Check if adding this product exceeds max weight (and the package isn't empty)
              if (currentPackageWeight + productWeight > maxWeightPerPackage && currentPackageProducts.length > 0) {
                // Finalize previous package
                packagesInfo.push({
                  id: `pkg_${group.id}_${packagesInfo.length + 1}`,
                  products: currentPackageProducts, // Store full objects
                  productCount: currentPackageProducts.length,
                  weight: currentPackageWeight
                });
                // Start new package
                currentPackageProducts = [product];
                currentPackageWeight = productWeight;
              } else {
                // Add to current package
                currentPackageProducts.push(product);
                currentPackageWeight += productWeight;
              }
            }
            // Add the last package if it has products
            if (currentPackageProducts.length > 0) {
              packagesInfo.push({
                id: `pkg_${group.id}_${packagesInfo.length + 1}`,
                products: currentPackageProducts, // Store full objects
                productCount: currentPackageProducts.length,
                weight: currentPackageWeight
              });
            }
            packagesCount = packagesInfo.length;
            if (packagesCount > 1) {
              console.log(`📦 [Per Package] Se dividirá en ${packagesCount} paquetes por restricción de peso (${maxWeightPerPackage}kg).`);
            } else {
              // Ensure the single package info is stored if not split
              packagesInfo = [{
                 id: `pkg_${group.id}_1`,
                 products: group.products, // Store full objects
                 productCount: group.products.length,
                 weight: group.products.reduce((sum, p) => sum + parseFloat(p.weight || 0), 0)
              }];
               console.log(`📦 [Per Package] No se requiere dividir por peso (${maxWeightPerPackage}kg). Paquete único creado.`);
            }

        } else {
            // No splitting needed, create a single package entry
            packagesInfo = [{
               id: `pkg_${group.id}_1`,
               products: group.products, // Store full objects
               productCount: group.products.length,
               weight: group.products.reduce((sum, p) => sum + parseFloat(p.weight || 0), 0)
            }];
            packagesCount = 1;
             console.log(`📦 [Per Package] No se requiere dividir. Paquete único creado.`);
        }
        // --- END: Package Splitting Logic ---

        // --- START: Calculate Cost Per Package ---
        let totalOptionCost = 0;
        const freeShippingMinAmount = parseFloat(rule.envio_gratis_monto_minimo); // Get only once
        const basePrice = parseFloat(rule.precio_base || (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0 ? rule.opciones_mensajeria[0].precio : 0) || 0);
        const costPerKgExtra = hasPackageConfig ? parseFloat(ruleConfig.costo_por_kg_extra || 0) : 0;
        // Note: cost_por_producto_extra is not implemented here yet, assuming weight is primary for now.
        
        console.log(`💰 [Per Package] Calculando costos individuales. Regla ID: ${rule.id}, Base: ${basePrice}, Min Gratis: ${freeShippingMinAmount || 'N/A'}, Kg Extra: ${costPerKgExtra}, Peso Max: ${maxWeightPerPackage || 'N/A'}`);

        packagesInfo.forEach((pkg, index) => {
          // 1. Calculate package subtotal
          pkg.subtotal = pkg.products.reduce((sum, p) => sum + (parseFloat(p.price || 0) * (p.quantity || 1)), 0);
          
          // 2. Check for free shipping based on package subtotal
          pkg.isFree = false;
          if (!isNaN(freeShippingMinAmount) && freeShippingMinAmount > 0 && pkg.subtotal >= freeShippingMinAmount) {
            pkg.isFree = true;
             console.log(`💰 [Per Package] Paquete ${pkg.id}: Subtotal ${pkg.subtotal.toFixed(2)} >= ${freeShippingMinAmount} -> ENVÍO GRATIS`);
          } else {
             console.log(`💰 [Per Package] Paquete ${pkg.id}: Subtotal ${pkg.subtotal.toFixed(2)} < ${freeShippingMinAmount || 'N/A'} -> CALCULAR COSTO`);
          }

          // 3. Calculate package cost if not free
          if (pkg.isFree) {
            pkg.packagePrice = 0;
          } else {
            let currentPackagePrice = basePrice;
            
            // Apply extra weight cost if applicable
            if (costPerKgExtra > 0 && !isNaN(maxWeightPerPackage) && pkg.weight > maxWeightPerPackage) {
              const extraWeight = pkg.weight - maxWeightPerPackage;
              const extraKgsRoundedUp = Math.ceil(extraWeight); // Assuming charge per whole kg over limit
              const extraCost = extraKgsRoundedUp * costPerKgExtra;
              currentPackagePrice += extraCost;
              console.log(`  - [Per Package] Paquete ${pkg.id}: Peso ${pkg.weight.toFixed(2)}kg > ${maxWeightPerPackage}kg. Extra: ${extraWeight.toFixed(2)}kg -> ${extraKgsRoundedUp}kg. Costo extra: ${extraCost.toFixed(2)}`);
            } else {
               console.log(`  - [Per Package] Paquete ${pkg.id}: Peso ${pkg.weight.toFixed(2)}kg <= ${maxWeightPerPackage || 'N/A'}kg. Sin costo extra por peso.`);
            }
            
            // TODO: Apply cost_por_producto_extra if needed based on pkg.productCount and maxProductsPerPackage

            pkg.packagePrice = currentPackagePrice;
          }
          
          console.log(`  - [Per Package] Costo final Paquete ${pkg.id}: ${pkg.packagePrice.toFixed(2)}`);
          
          // 4. Add package cost to total option cost
          totalOptionCost += pkg.packagePrice;
        });
        
        console.log(`💰 [Per Package] Costo total calculado para la opción (Regla ${rule.id}): ${totalOptionCost.toFixed(2)}`);
        // --- END: Calculate Cost Per Package ---

        // Determine overall 'isFree' for the option (true only if total cost is 0)
        const finalIsFree = totalOptionCost === 0;

        const option = {
          id: `ship_${group.id}_${uuidv4()}`, // Make ID more specific
          name: rule.zona || rule.nombre || rule.name || 'Envío Estándar',
          carrier: rule.carrier || rule.proveedor || '',
          description: rule.descripcion || rule.description || '', // Will be overwritten later
          price: totalOptionCost, // Use the summed cost
          products: group.products.map(p => p.id), // Still list all products covered by option
          isFree: finalIsFree, // Reflect if the final summed cost is zero
          rule_id: rule.id,
          minDays,
          maxDays,
          isNational: (rule.coverage_type === 'nacional' || rule.tipo === 'nacional'),
          zoneType: rule.coverage_type || rule.tipo || 'standard',
          deliveryTime: deliveryTimeText,
          // Add relevant config details used in calculation
          precio_base: basePrice,
          envio_gratis_monto_minimo: freeShippingMinAmount > 0 ? freeShippingMinAmount : undefined,
          configuracion_paquetes: ruleConfig, // Include the config used
          opciones_mensajeria: rule.opciones_mensajeria,
          // Package breakdown
          packagesCount,
          packagesInfo, // Include detailed package info with costs
          // Mark that prices were calculated per package
          packagesWithPrices: true 
        };
        
        // Generate detailed description based on packages
        option.description = generateDetailedDescription(option, group.products); // Pass original products for description context
        
        return option;
      });
      
      return {
        success: true,
        options: shippingOptions,
        productAssignments,
        products_without_shipping: productsWithoutRules.map(p => p.id),
        partial_shipping: true,
        unavailable_products: productNames
      };
    }
    
    // Si ningún producto tiene reglas válidas, retornar error
    return { 
      success: false, 
      error: `No hay opciones de envío disponibles para: ${productNames}`,
      products_without_shipping: productsWithoutRules.map(p => p.id)
    };
  }
  
  // Paso 2: Agrupar productos por regla para minimizar envíos
  const shippingGroups = [];
  const productAssignments = {};
  
  // Primera pasada: intentar agrupar productos por reglas similares
  cartItems.forEach(item => {
    const product = item.product || item;
    const productId = product.id;
    const validRules = validRulesByProduct[productId] || [];
    
    if (validRules.length === 0) return;
    
    // Ordenar reglas por costo (menor primero)
    const sortedRules = [...validRules].sort((a, b) => {
      const costA = parseFloat(a.precio_base || a.base_price || 100);
      const costB = parseFloat(b.precio_base || b.base_price || 100);
      return costA - costB;
    });
    
    // Intentar añadir a un grupo existente
    let addedToGroup = false;
    
    for (const group of shippingGroups) {
      // Verificar si alguna regla del producto es la misma que la del grupo
      if (sortedRules.some(rule => rule.id === group.rule.id)) {
        // Verificar restricciones de peso y cantidad
        if (canAddProductToGroup(group, product, group.rule)) {
          group.products.push(product);
          productAssignments[productId] = group.rule.id;
          addedToGroup = true;
          break;
        }
      }
    }
    
    // Si no se pudo añadir a ningún grupo, crear uno nuevo
    if (!addedToGroup) {
      const bestRule = sortedRules[0];
      const newGroup = {
        id: uuidv4(),
        rule: bestRule,
        products: [product]
      };
      
      shippingGroups.push(newGroup);
      productAssignments[productId] = bestRule.id;
    }
  });
  
  // Paso 3: Calcular costos y detalles de envío para cada grupo
  const shippingOptions = shippingGroups.map(group => {
    // REMOVE initial calculation for the whole group:
    // const { cost, minDays, maxDays, isFree } = calculateShippingDetails(group.rule, group.products);
    
    // --- START: Extract static details from the rule ---
    let minDays = null;
    let maxDays = null;
    let deliveryTimeText = '';
    const rule = group.rule; // Use a shorter alias

    // Extract min/max days (check various possible fields)
    if (rule.tiempo_minimo !== undefined && rule.tiempo_minimo !== null) minDays = parseInt(rule.tiempo_minimo, 10);
    else if (rule.min_days !== undefined && rule.min_days !== null) minDays = parseInt(rule.min_days, 10);
    else if (rule.minDays !== undefined && rule.minDays !== null) minDays = parseInt(rule.minDays, 10);

    if (rule.tiempo_maximo !== undefined && rule.tiempo_maximo !== null) maxDays = parseInt(rule.tiempo_maximo, 10);
    else if (rule.max_days !== undefined && rule.max_days !== null) maxDays = parseInt(rule.max_days, 10);
    else if (rule.maxDays !== undefined && rule.maxDays !== null) maxDays = parseInt(rule.maxDays, 10);
    
    // Use tiempos from opciones_mensajeria if available (assuming first option is preferred/cheapest)
    if (Array.isArray(rule.opciones_mensajeria) && rule.opciones_mensajeria.length > 0) {
      const bestOption = rule.opciones_mensajeria[0]; // Assuming sorted elsewhere or taking the first
      
      // Override min/max days from the specific option
      if (bestOption.tiempo_minimo !== undefined && bestOption.tiempo_minimo !== null) minDays = parseInt(bestOption.tiempo_minimo, 10);
      else if (bestOption.min_days !== undefined && bestOption.min_days !== null) minDays = parseInt(bestOption.min_days, 10);
      else if (bestOption.minDays !== undefined && bestOption.minDays !== null) minDays = parseInt(bestOption.minDays, 10);
      
      if (bestOption.tiempo_maximo !== undefined && bestOption.tiempo_maximo !== null) maxDays = parseInt(bestOption.tiempo_maximo, 10);
      else if (bestOption.max_days !== undefined && bestOption.max_days !== null) maxDays = parseInt(bestOption.max_days, 10);
      else if (bestOption.maxDays !== undefined && bestOption.maxDays !== null) maxDays = parseInt(bestOption.maxDays, 10);
      
      // Use tiempo_entrega string if present
      if (bestOption.tiempo_entrega) {
        deliveryTimeText = bestOption.tiempo_entrega;
        console.log(`📅 [Per Package] Usando tiempo_entrega predefinido: "${deliveryTimeText}"`);
        // Attempt to extract min/max if not already set
         if ((minDays === null || maxDays === null)) {
           const tiempoMatch = bestOption.tiempo_entrega.match(/(\d+)[-\s]*(\d+)/);
           if (tiempoMatch && tiempoMatch.length >= 3) {
             if (minDays === null) minDays = parseInt(tiempoMatch[1], 10);
             if (maxDays === null) maxDays = parseInt(tiempoMatch[2], 10);
             console.log(`  - [Per Package] Extraídos de tiempo_entrega: min=${minDays}, max=${maxDays}`);
           } else if (bestOption.tiempo_entrega.match(/(\d+)/)) {
             const singleMatch = bestOption.tiempo_entrega.match(/(\d+)/);
             const days = parseInt(singleMatch[1], 10);
             if (minDays === null) minDays = days;
             if (maxDays === null) maxDays = days;
             console.log(`  - [Per Package] Extraído de tiempo_entrega (valor único): ${days} días`);
           }
         }
      }
    }

    // Generate deliveryTimeText if not set by specific option
    if (!deliveryTimeText && minDays !== null && maxDays !== null) {
      if (minDays === maxDays) {
        deliveryTimeText = minDays === 1 ? `Entrega en 1 día hábil` : `Entrega en ${minDays} días hábiles`;
      } else {
        deliveryTimeText = `Entrega en ${minDays}-${maxDays} días hábiles`;
      }
      console.log(`📅 [Per Package] Tiempo de entrega generado: "${deliveryTimeText}"`);
    }
    // --- END: Extract static details from the rule ---

    
    // --- START: Package Splitting Logic (modified to keep full product objects) ---
    let packagesCount = 1;
    let packagesInfo = []; // Array to hold package details { id, products: [full_product_objects], weight, productCount, subtotal, packagePrice, isFree }
    
    const ruleConfig = rule.configuracion_paquetes || (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0 ? rule.opciones_mensajeria[0].configuracion_paquetes : {});
    const hasPackageConfig = !!ruleConfig;
    
    const maxProductsPerPackage = hasPackageConfig ? parseInt(ruleConfig.maximo_productos_por_paquete, 10) : NaN;
    const maxWeightPerPackage = hasPackageConfig ? parseFloat(ruleConfig.peso_maximo_paquete) : NaN;
    
    if (!isNaN(maxProductsPerPackage) && maxProductsPerPackage > 0 && group.products.length > maxProductsPerPackage) {
       // Split by max products
       packagesCount = Math.ceil(group.products.length / maxProductsPerPackage);
       for (let i = 0; i < packagesCount; i++) {
         const startIdx = i * maxProductsPerPackage;
         const endIdx = Math.min(startIdx + maxProductsPerPackage, group.products.length);
         const packageProducts = group.products.slice(startIdx, endIdx); // Keep full objects
         packagesInfo.push({
           id: `pkg_${group.id}_${i+1}`,
           products: packageProducts, // Store full product objects
           productCount: packageProducts.length,
           weight: packageProducts.reduce((sum, p) => sum + parseFloat(p.weight || 0), 0) // Calculate weight
         });
       }
       console.log(`📦 [Per Package] Se dividirá en ${packagesCount} paquetes por restricción de ${maxProductsPerPackage} productos.`);
    
    } else if (!isNaN(maxWeightPerPackage) && maxWeightPerPackage > 0) {
        // Try splitting by max weight
        let currentPackageProducts = [];
        let currentPackageWeight = 0;
        packagesInfo = [];

        for (const product of group.products) {
          const productWeight = parseFloat(product.weight || 0);
          // Check if adding this product exceeds max weight (and the package isn't empty)
          if (currentPackageWeight + productWeight > maxWeightPerPackage && currentPackageProducts.length > 0) {
            // Finalize previous package
            packagesInfo.push({
              id: `pkg_${group.id}_${packagesInfo.length + 1}`,
              products: currentPackageProducts, // Store full objects
              productCount: currentPackageProducts.length,
              weight: currentPackageWeight
            });
            // Start new package
            currentPackageProducts = [product];
            currentPackageWeight = productWeight;
          } else {
            // Add to current package
            currentPackageProducts.push(product);
            currentPackageWeight += productWeight;
          }
        }
        // Add the last package if it has products
        if (currentPackageProducts.length > 0) {
          packagesInfo.push({
            id: `pkg_${group.id}_${packagesInfo.length + 1}`,
            products: currentPackageProducts, // Store full objects
            productCount: currentPackageProducts.length,
            weight: currentPackageWeight
          });
        }
        packagesCount = packagesInfo.length;
        if (packagesCount > 1) {
          console.log(`📦 [Per Package] Se dividirá en ${packagesCount} paquetes por restricción de peso (${maxWeightPerPackage}kg).`);
        } else {
          // Ensure the single package info is stored if not split
          packagesInfo = [{
             id: `pkg_${group.id}_1`,
             products: group.products, // Store full objects
             productCount: group.products.length,
             weight: group.products.reduce((sum, p) => sum + parseFloat(p.weight || 0), 0)
          }];
           console.log(`📦 [Per Package] No se requiere dividir por peso (${maxWeightPerPackage}kg). Paquete único creado.`);
        }

    } else {
        // No splitting needed, create a single package entry
        packagesInfo = [{
           id: `pkg_${group.id}_1`,
           products: group.products, // Store full objects
           productCount: group.products.length,
           weight: group.products.reduce((sum, p) => sum + parseFloat(p.weight || 0), 0)
        }];
        packagesCount = 1;
         console.log(`📦 [Per Package] No se requiere dividir. Paquete único creado.`);
    }
    // --- END: Package Splitting Logic ---

    // --- START: Calculate Cost Per Package ---
    let totalOptionCost = 0;
    const freeShippingMinAmount = parseFloat(rule.envio_gratis_monto_minimo); // Get only once
    const basePrice = parseFloat(rule.precio_base || (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0 ? rule.opciones_mensajeria[0].precio : 0) || 0);
    const costPerKgExtra = hasPackageConfig ? parseFloat(ruleConfig.costo_por_kg_extra || 0) : 0;
    // Note: cost_por_producto_extra is not implemented here yet, assuming weight is primary for now.
    
    console.log(`💰 [Per Package] Calculando costos individuales. Regla ID: ${rule.id}, Base: ${basePrice}, Min Gratis: ${freeShippingMinAmount || 'N/A'}, Kg Extra: ${costPerKgExtra}, Peso Max: ${maxWeightPerPackage || 'N/A'}`);

    packagesInfo.forEach((pkg, index) => {
      // 1. Calculate package subtotal
      pkg.subtotal = pkg.products.reduce((sum, p) => sum + (parseFloat(p.price || 0) * (p.quantity || 1)), 0);
      
      // 2. Check for free shipping based on package subtotal
      pkg.isFree = false;
      if (!isNaN(freeShippingMinAmount) && freeShippingMinAmount > 0 && pkg.subtotal >= freeShippingMinAmount) {
        pkg.isFree = true;
         console.log(`💰 [Per Package] Paquete ${pkg.id}: Subtotal ${pkg.subtotal.toFixed(2)} >= ${freeShippingMinAmount} -> ENVÍO GRATIS`);
      } else {
         console.log(`💰 [Per Package] Paquete ${pkg.id}: Subtotal ${pkg.subtotal.toFixed(2)} < ${freeShippingMinAmount || 'N/A'} -> CALCULAR COSTO`);
      }

      // 3. Calculate package cost if not free
      if (pkg.isFree) {
        pkg.packagePrice = 0;
      } else {
        let currentPackagePrice = basePrice;
        
        // Apply extra weight cost if applicable
        if (costPerKgExtra > 0 && !isNaN(maxWeightPerPackage) && pkg.weight > maxWeightPerPackage) {
          const extraWeight = pkg.weight - maxWeightPerPackage;
          const extraKgsRoundedUp = Math.ceil(extraWeight); // Assuming charge per whole kg over limit
          const extraCost = extraKgsRoundedUp * costPerKgExtra;
          currentPackagePrice += extraCost;
          console.log(`  - [Per Package] Paquete ${pkg.id}: Peso ${pkg.weight.toFixed(2)}kg > ${maxWeightPerPackage}kg. Extra: ${extraWeight.toFixed(2)}kg -> ${extraKgsRoundedUp}kg. Costo extra: ${extraCost.toFixed(2)}`);
        } else {
           console.log(`  - [Per Package] Paquete ${pkg.id}: Peso ${pkg.weight.toFixed(2)}kg <= ${maxWeightPerPackage || 'N/A'}kg. Sin costo extra por peso.`);
        }
        
        // TODO: Apply cost_por_producto_extra if needed based on pkg.productCount and maxProductsPerPackage

        pkg.packagePrice = currentPackagePrice;
      }
      
      console.log(`  - [Per Package] Costo final Paquete ${pkg.id}: ${pkg.packagePrice.toFixed(2)}`);
      
      // 4. Add package cost to total option cost
      totalOptionCost += pkg.packagePrice;
    });
    
    console.log(`💰 [Per Package] Costo total calculado para la opción (Regla ${rule.id}): ${totalOptionCost.toFixed(2)}`);
    // --- END: Calculate Cost Per Package ---

    // Determine overall 'isFree' for the option (true only if total cost is 0)
    const finalIsFree = totalOptionCost === 0;

    const option = {
      id: `ship_${group.id}_${uuidv4()}`, // Make ID more specific
      name: rule.zona || rule.nombre || rule.name || 'Envío Estándar',
      carrier: rule.carrier || rule.proveedor || '',
      description: rule.descripcion || rule.description || '', // Will be overwritten later
      price: totalOptionCost, // Use the summed cost
      products: group.products.map(p => p.id), // Still list all products covered by option
      isFree: finalIsFree, // Reflect if the final summed cost is zero
      rule_id: rule.id,
      minDays,
      maxDays,
      isNational: (rule.coverage_type === 'nacional' || rule.tipo === 'nacional'),
      zoneType: rule.coverage_type || rule.tipo || 'standard',
      deliveryTime: deliveryTimeText,
      // Add relevant config details used in calculation
      precio_base: basePrice,
      envio_gratis_monto_minimo: freeShippingMinAmount > 0 ? freeShippingMinAmount : undefined,
      configuracion_paquetes: ruleConfig, // Include the config used
      opciones_mensajeria: rule.opciones_mensajeria,
      // Package breakdown
      packagesCount,
      packagesInfo, // Include detailed package info with costs
      // Mark that prices were calculated per package
      packagesWithPrices: true 
    };
    
    // Generate detailed description based on packages
    option.description = generateDetailedDescription(option, group.products); // Pass original products for description context
    
    return option;
  });
  
  return {
    success: true,
    options: shippingOptions,
    productAssignments
  };
};

/**
 * Genera una descripción detallada para una opción de envío
 * @param {Object} option - Opción de envío
 * @param {Array} products - Productos asociados
 * @returns {string} - Descripción detallada
 */
export const generateDetailedDescription = (option, products = []) => {
  if (!option) return '';

  const isFree = option.isFree || option.price === 0;
  let description = '';

  // Tipo de envío
  if (option.isNational) {
    description += 'Envío nacional';
  } else if (option.zoneType === 'local') {
    description += 'Envío local';
  } else if (option.zoneType === 'express') {
    description += 'Envío express';
  } else {
    description += 'Envío estándar';
  }

  // Tiempo de entrega - solo si hay datos disponibles
  if (option.deliveryTime && option.deliveryTime.length > 0) {
    description += ` - ${option.deliveryTime}`;
  } else if (option.minDays !== null && option.maxDays !== null) {
    if (option.minDays === option.maxDays) {
      if (option.minDays === 1) {
        description += ` - Entrega en 1 día hábil`;
      } else {
        description += ` - Entrega en ${option.minDays} días hábiles`;
      }
    } else {
      description += ` - Entrega en ${option.minDays}-${option.maxDays} días hábiles`;
    }
  }

  // Precio
  if (isFree) {
    description += ' - GRATIS';
  } else {
    const formattedPrice = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(option.price);
    description += ` - ${formattedPrice}`;
  }

  // Información de paquetes
  if (option.packagesInfo && option.packagesInfo.length > 1) {
    description += `\nSe dividirá en ${option.packagesInfo.length} paquetes debido a restricciones de tamaño o peso`;
  }

  // Información de producto si es relevante
  if (products && products.length > 0) {
    if (products.length === 1) {
      const product = products[0];
      description += `\nProducto: ${product.name || 'Producto único'}`;
    } else {
      description += `\nIncluye envío para ${products.length} productos`;
    }
  }

  // Información de restricciones de paquetes si existen
  if (option.maxProductsPerPackage) {
    description += `\nMáximo ${option.maxProductsPerPackage} productos por paquete`;
  }
  
  if (option.maxWeightPerPackage) {
    description += `\nPeso máximo de ${option.maxWeightPerPackage}kg por paquete`;
  }

  // Información de carrier si está disponible
  if (option.carrier) {
    description += `\nTransportista: ${option.carrier}`;
  }

  return description;
};

/**
 * Función principal que encuentra las mejores opciones de envío
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} address - Dirección del usuario
 * @param {Array} shippingRules - Reglas de envío disponibles
 * @returns {Object} - Resultado con opciones de envío
 */
export const findBestShippingOptions = (cartItems, address, shippingRules) => {
  return findBestShippingOptionsGreedy(cartItems, address, shippingRules);
}; 