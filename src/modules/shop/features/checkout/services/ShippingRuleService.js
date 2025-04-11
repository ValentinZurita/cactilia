/**
 * Servicio para manejar las reglas de envío y agrupar productos
 */

/**
 * Agrupa los productos por las reglas de envío aplicables
 * @param {Array} cartItems - Productos en el carrito
 * @returns {Array} - Grupos de productos organizados por regla de envío
 */
export const groupProductsByShippingRule = (cartItems) => {
  if (!cartItems || cartItems.length === 0) return [];

  console.log('🔍 groupProductsByShippingRule: Analizando productos:', JSON.stringify(cartItems));

  // Normalizar items del carrito
  const normalizedItems = cartItems.map(item => {
    return {
      product: item.product || item,
      quantity: item.quantity || 1
    };
  });

  // Crear un mapa para agrupar por regla de envío
  const ruleGroups = new Map();

  // Agrupar productos por regla de envío
  normalizedItems.forEach(item => {
    const product = item.product;
    
    console.log(`🔍 Analizando producto: ${product.name || product.id}`, product);
    
    // Extraer los IDs de reglas de envío del producto
    // Múltiples formatos posibles:
    // 1. shippingRuleIds como array de strings
    // 2. shippingRuleId como string único
    // 3. shippingRules como array de objetos con id
    
    let ruleIds = [];
    
    // Verificar cada posible formato y extraer los IDs
    if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0) {
      console.log('✅ Usando shippingRuleIds (array de strings)');
      ruleIds = [...product.shippingRuleIds];
    }
    else if (product.shippingRuleId && typeof product.shippingRuleId === 'string') {
      console.log('✅ Usando shippingRuleId (string único)');
      ruleIds = [product.shippingRuleId];
    }
    else if (product.shippingRules && Array.isArray(product.shippingRules)) {
      console.log('✅ Usando shippingRules (array de objetos)');
      // Extraer IDs del array de objetos
      ruleIds = product.shippingRules
        .filter(rule => rule && (rule.id || rule.ruleId))
        .map(rule => rule.id || rule.ruleId);
    }
    
    // Si no hay reglas de envío para el producto, no lo podemos agrupar
    if (ruleIds.length === 0) {
      console.warn(`⚠️ Producto sin reglas de envío: ${product.id || 'desconocido'}`);
      return;
    }
    
    console.log(`📦 Producto ${product.id}: Reglas de envío encontradas:`, ruleIds);
    
    // Agregar el producto a todos los grupos correspondientes a sus reglas
    ruleIds.forEach(ruleId => {
      if (!ruleId) return;
      
      // Si ya existe la regla, añadir producto
      if (ruleGroups.has(ruleId)) {
        const group = ruleGroups.get(ruleId);
        group.products.push(item);
      } else {
        // Si no existe, crear nuevo grupo (la regla se añadirá después)
        ruleGroups.set(ruleId, {
          rule: { id: ruleId },
          products: [item]
        });
      }
    });
  });

  const groups = Array.from(ruleGroups.values());
  console.log(`🔍 Grupos de productos por regla: ${groups.length}`, groups);
  
  // Convertir mapa a array
  return groups;
};

/**
 * Verifica si un código postal es válido para una regla de envío
 */
export const isPostalCodeValidForRule = (rule, postalCode, userState) => {
  // Si no hay código postal, no podemos validar
  if (!postalCode) {
    console.log(`⚠️ No hay código postal para validar la regla ${rule.id}`);
    return false;
  }

  // Verificar si la regla tiene un zipcode especial "nacional"
  if (rule.zipcode === "nacional" || 
      (rule.zipcodes && Array.isArray(rule.zipcodes) && rule.zipcodes.includes("nacional")) ||
      rule.zona === "Nacional") {
    console.log(`✅ Regla ${rule.id} tiene zipcode 'nacional' o zona 'Nacional': VÁLIDO para todos los códigos`);
    return true;
  }

  // Verificar códigos postales específicos si están definidos
  if (rule.codigos_postales && Array.isArray(rule.codigos_postales) && rule.codigos_postales.length > 0) {
    const isValid = rule.codigos_postales.includes(postalCode);
    console.log(`✓ Validación por lista codigos_postales: ${isValid ? 'VÁLIDO' : 'NO VÁLIDO'}`);
    return isValid;
  }
  
  // Verificar zipcodes como alternativa (formato usado en algunos casos)
  if (rule.zipcodes && (Array.isArray(rule.zipcodes) || typeof rule.zipcodes === 'object')) {
    // Si zipcodes es un array, comparar directamente
    if (Array.isArray(rule.zipcodes) && rule.zipcodes.length > 0) {
      // Ignorar valores especiales como "nacional" que ya fueron procesados
      const specificZipcodes = rule.zipcodes.filter(z => z !== "nacional");
      
      if (specificZipcodes.length > 0) {
        const isValid = specificZipcodes.includes(postalCode);
        console.log(`✓ Validación por zipcodes específicos: ${isValid ? 'VÁLIDO' : 'NO VÁLIDO'}`);
        return isValid;
      }
    }
    
    // Si zipcodes es un objeto (como en algunos formatos de datos), intentar extraer como array
    if (typeof rule.zipcodes === 'object' && Object.values(rule.zipcodes).length > 0) {
      const zipcodesList = Object.values(rule.zipcodes).filter(z => z !== "nacional");
      if (zipcodesList.length > 0) {
        const isValid = zipcodesList.includes(postalCode);
        console.log(`✓ Validación por objeto zipcodes: ${isValid ? 'VÁLIDO' : 'NO VÁLIDO'}`);
        return isValid;
      }
    }
  }
  
  // Verificar rangos de códigos postales si están definidos
  if (rule.rangos_postales && Array.isArray(rule.rangos_postales) && rule.rangos_postales.length > 0) {
    for (const rango of rule.rangos_postales) {
      if (postalCode >= rango.inicio && postalCode <= rango.fin) {
        console.log(`✓ Validación por rango: VÁLIDO (${rango.inicio}-${rango.fin})`);
        return true;
      }
    }
    console.log(`✓ Validación por rangos: NO VÁLIDO`);
    return false;
  }
  
  // Si no hay reglas explícitas pero la zona es "Nacional", la regla aplica
  if (rule.zona === "Nacional") {
    console.log(`✅ Regla con zona="Nacional": VÁLIDO para todos los códigos`);
    return true;
  }
  
  // Si la regla tiene envío gratuito global y no tiene restricciones de código postal,
  // asumimos que es válida para todos los códigos postales
  if (rule.envio_gratis === true && 
      !rule.codigos_postales && 
      !rule.zipcodes && 
      !rule.rangos_postales) {
    console.log(`✅ Regla con envío gratuito sin restricciones de CP: VÁLIDO para todos los códigos`);
    return true;
  }
  
  // Si no hay reglas explícitas, la regla no aplica al código postal
  console.log(`✓ Regla sin criterios de validación explícitos para códigos postales: NO VÁLIDO`);
  return false;
}

/**
 * Genera combinaciones válidas de envío basadas en reglas y productos
 * 
 * @param {Array} productGroups - Grupos de productos agrupados por regla de envío
 * @param {Object} addressInfo - Información de la dirección (código postal, estado, etc.)
 * @param {Array} shippingRules - Reglas de envío
 * @returns {Array} - Combinaciones de envío válidas
 */
export const generateShippingCombinations = (productGroups, addressInfo, shippingRules = []) => {
  if (!productGroups || productGroups.length === 0) return [];
  
  // Normalizar información de dirección
  const userPostalCode = addressInfo?.postalCode || addressInfo?.zip || addressInfo?.zipcode || '';
  const userState = addressInfo?.state || addressInfo?.provincia || '';
  
  console.log(`🔍 Filtrando reglas por: CP=${userPostalCode}, Estado=${userState}`);
  
  // Primero, completar información de reglas en los grupos
  productGroups.forEach(group => {
    const ruleId = group.rule.id;
    // Buscar la regla completa en la lista de reglas de envío
    const fullRule = shippingRules.find(r => r.id === ruleId);
    if (fullRule) {
      console.log(`🔍 Encontrada regla completa para ${ruleId}:`, fullRule);
      group.rule = { ...fullRule };
    } else {
      console.log(`⚠️ No se encontró regla completa para ${ruleId}`);
    }
  });
  
  // Filtrar reglas que no aplican al código postal
  const validGroups = productGroups.filter(group => {
    const isValid = isPostalCodeValidForRule(group.rule, userPostalCode, userState);
    
    // Log detallado para diagnóstico
    if (isValid) {
      console.log(`✅ Regla ${group.rule.id} (${group.rule.zona || 'sin zona'}) es válida para CP=${userPostalCode}`);
    } else {
      console.log(`❌ Regla ${group.rule.id} (${group.rule.zona || 'sin zona'}) NO es válida para CP=${userPostalCode}`);
    }
    
    return isValid;
  });
  
  if (validGroups.length === 0) {
    console.log(`⚠️ No hay grupos válidos para CP=${userPostalCode}`);
    return [];
  }
  
  console.log('📦 Procesando grupos válidos:', validGroups.length);
  
  // Combinaciones individuales (una regla cubre todos los productos)
  let combinations = [];
  
  // Obtener todos los IDs de productos en el carrito
  const allProductIds = new Set();
  validGroups.forEach(group => {
    group.products.forEach(item => {
      allProductIds.add(item.product.id);
    });
  });
  
  // Generar combinaciones individuales por regla
  validGroups.forEach(group => {
    const rule = group.rule;
    console.log(`📦 Procesando regla ${rule.id} (${rule.zona || 'sin zona'}):`, rule);
    
    // Usar opciones_mensajeria o opciones dependiendo de lo que esté disponible
    let shippingOptions = rule.opciones_mensajeria || rule.opciones || [];
    
    // Si tenemos shippingOptions como número, es posible que solo sea un contador
    if (typeof shippingOptions === 'number') {
      console.log(`⚠️ La regla ${rule.id} tiene opciones como número: ${shippingOptions}, intentando buscar de otra forma`);
      
      // Intenta buscar directamente en las reglas del panel de diagnóstico
      if (window.__SHIPPING_RULES__) {
        const debugRule = window.__SHIPPING_RULES__.find(r => r.id === rule.id);
        if (debugRule && debugRule.opciones && Array.isArray(debugRule.opciones)) {
          console.log(`✅ Encontradas opciones en panel de diagnóstico para ${rule.id}:`, debugRule.opciones);
          shippingOptions = debugRule.opciones;
        }
      }
    }
    
    if (!shippingOptions || !Array.isArray(shippingOptions) || shippingOptions.length === 0) {
      console.warn(`⚠️ La regla ${rule.id} (${rule.zona || 'sin zona'}) no tiene opciones de mensajería válidas. Contenido:`, rule);
      return;
    }
    
    console.log(`✅ Procesando ${shippingOptions.length} opciones para ${rule.id} (${rule.zona || 'sin zona'})`);
    
    // Verificar si esta regla cubre todos los productos
    const coveredProductIds = new Set();
    group.products.forEach(item => {
      coveredProductIds.add(item.product.id);
    });
    
    const ruleCoversAll = Array.from(allProductIds).every(id => coveredProductIds.has(id));
    
    // Para cada opción de envío de esta regla
    shippingOptions.forEach((option, optionIndex) => {
      // Obtener label si existe, o generar uno a partir del nombre
      const optionLabel = option.label || 
                         (option.nombre === "Correos de México" ? 
                           (optionIndex === 0 ? "Basico" : "Express") : 
                           (option.nombre || `Opción ${optionIndex + 1}`));
      
      // Calcular precio según configuración avanzada de la regla
      let optionPrice = parseFloat(option.precio || 0);
      
      // Calcular el subtotal de los productos en este grupo
      const groupSubtotal = group.products.reduce((total, item) => {
        const price = parseFloat(item.product.price || item.product.precio || 0);
        const quantity = item.quantity || 1;
        return total + (price * quantity);
      }, 0);
      
      // Calcular número total de productos y peso total
      const productCount = group.products.reduce((count, item) => count + (item.quantity || 1), 0);
      const totalWeight = group.products.reduce((weight, item) => {
        const productWeight = parseFloat(item.product.weight || item.product.peso || 0);
        const quantity = item.quantity || 1;
        return weight + (productWeight * quantity);
      }, 0);
      
      console.log(`📦 Grupo ${rule.id}: ${productCount} productos, peso total: ${totalWeight}kg, subtotal: $${groupSubtotal}`);
      
      // Verificar si aplica envío gratuito por cualquier razón
      let isFreeShipping = false;
      let freeShippingReason = '';
      
      // 1. Verificar si la regla tiene envío gratuito global
      if (rule.envio_gratis === true) {
        isFreeShipping = true;
        freeShippingReason = 'Envío gratuito para todos los productos de esta regla';
      }
      
      // 2. Verificar si aplica envío gratuito por monto mínimo
      else if (rule.envio_gratis_monto_minimo && 
              typeof rule.envio_gratis_monto_minimo === 'number' && 
              groupSubtotal >= rule.envio_gratis_monto_minimo) {
        isFreeShipping = true;
        freeShippingReason = `Subtotal ($${groupSubtotal}) mayor al mínimo para envío gratis ($${rule.envio_gratis_monto_minimo})`;
      }
      
      // 3. Verificar otras condiciones de envío gratuito
      else if (rule.condiciones_envio_gratis) {
        // Si hay una condición por número de productos
        if (rule.condiciones_envio_gratis.minimo_productos && 
            productCount >= rule.condiciones_envio_gratis.minimo_productos) {
          isFreeShipping = true;
          freeShippingReason = `Cantidad de productos (${productCount}) mayor al mínimo para envío gratis (${rule.condiciones_envio_gratis.minimo_productos})`;
        }
      }
      
      // Si aplica envío gratuito, el precio es 0
      if (isFreeShipping) {
        console.log(`✅ Envío gratuito aplicado: ${freeShippingReason}`);
        optionPrice = 0;
      } else {
        // Calcular costos adicionales si no es gratuito
        
        // 1. Costo adicional por producto extra
        if (rule.costo_por_producto_extra && productCount > 1) {
          const extraProducts = productCount - 1; // El primer producto ya está en el precio base
          const extraProductCost = extraProducts * parseFloat(rule.costo_por_producto_extra);
          optionPrice += extraProductCost;
          console.log(`💰 Costo adicional por ${extraProducts} productos extra: $${extraProductCost}`);
        }
        
        // 2. Costo adicional por peso extra
        if (rule.costo_por_kg_extra && rule.peso_base) {
          const baseWeight = parseFloat(rule.peso_base);
          if (totalWeight > baseWeight) {
            const extraWeight = totalWeight - baseWeight;
            const extraWeightCost = extraWeight * parseFloat(rule.costo_por_kg_extra);
            optionPrice += extraWeightCost;
            console.log(`💰 Costo adicional por ${extraWeight}kg extra: $${extraWeightCost}`);
          }
        }
        
        // 3. Verificar límites máximos
        let exceedsLimits = false;
        let limitMessage = '';
        
        // Verificar límite máximo de productos por paquete
        if (rule.maximo_productos_por_paquete && productCount > rule.maximo_productos_por_paquete) {
          exceedsLimits = true;
          limitMessage = `Excede el máximo de productos por paquete (${rule.maximo_productos_por_paquete})`;
        }
        
        // Verificar límite máximo de peso por paquete
        if (rule.peso_maximo_paquete && totalWeight > rule.peso_maximo_paquete) {
          exceedsLimits = true;
          limitMessage = `${limitMessage ? limitMessage + ' y ' : ''}excede el peso máximo por paquete (${rule.peso_maximo_paquete}kg)`;
        }
        
        // Si excede límites, marcar esta combinación
        if (exceedsLimits) {
          console.warn(`⚠️ ${limitMessage}. Esto podría requerir división en múltiples paquetes.`);
          // En lugar de descartar, podríamos dividir en subpaquetes (implementación más avanzada)
        }
      }
      
      // Crear una combinación para esta opción
      combinations.push({
        id: `${rule.id}-${(option.nombre || '').toLowerCase().replace(/\s+/g, '-')}-${optionIndex}`,
        description: rule.zona,
        option: {
          name: option.nombre || "Servicio de envío",
          label: optionLabel,
          price: optionPrice,
          isFree: optionPrice === 0,
          freeReason: isFreeShipping ? freeShippingReason : '',
          estimatedDelivery: option.tiempo_entrega || option.tiempoEntrega || '?-? días'
        },
        ruleId: rule.id,
        ruleName: rule.zona,
        products: group.products,
        productCount: productCount,
        totalWeight: totalWeight,
        groupSubtotal: groupSubtotal,
        coversAllProducts: ruleCoversAll,
        isComplete: ruleCoversAll
      });
    });
  });
  
  // Si ninguna regla individual cubre todos los productos, generar combinaciones múltiples
  if (!combinations.some(combo => combo.coversAllProducts)) {
    // Aquí iría la lógica para generar combinaciones que cubran todos los productos
    // usando múltiples reglas
    console.log('Ninguna regla individual cubre todos los productos - generando combinaciones mixtas');
    
    // Identificar reglas con envío gratuito vs reglas con costo
    const freeShippingGroups = validGroups.filter(g => g.rule?.envio_gratis === true);
    const paidShippingGroups = validGroups.filter(g => g.rule?.envio_gratis !== true);
    
    // Si tenemos al menos una regla gratuita y una con costo, podemos crear combinaciones mixtas
    if (freeShippingGroups.length > 0 && paidShippingGroups.length > 0) {
      console.log(`✅ Generando combinaciones mixtas (gratuitas: ${freeShippingGroups.length}, con costo: ${paidShippingGroups.length})`);
      
      // Para cada grupo gratuito
      freeShippingGroups.forEach(freeGroup => {
        // Para cada grupo con costo
        paidShippingGroups.forEach(paidGroup => {
          // Verificar si la combinación de ambos grupos cubre todos los productos
          const combinedProductIds = new Set();
          const freeProducts = [];
          const paidProducts = [];
          
          // Clasificar productos en gratuitos y pagados para esta combinación
          [...freeGroup.products, ...paidGroup.products].forEach(item => {
            combinedProductIds.add(item.product.id);
            
            // Verificar si ya está en alguna lista para evitar duplicados
            const productInFree = freeProducts.some(p => p.product.id === item.product.id);
            const productInPaid = paidProducts.some(p => p.product.id === item.product.id);
            
            if (!productInFree && !productInPaid) {
              // Si el producto está en ambos grupos, priorizamos el gratuito
              const isInFreeGroup = freeGroup.products.some(p => p.product.id === item.product.id);
              
              if (isInFreeGroup) {
                freeProducts.push(item);
              } else {
                paidProducts.push(item);
              }
            }
          });
          
          const combinationCoversAll = Array.from(allProductIds).every(id => 
            combinedProductIds.has(id)
          );
          
          if (combinationCoversAll) {
            console.log(`✅ Combinación mixta cubre todos los productos (${freeProducts.length} gratuitos, ${paidProducts.length} con costo)`);
            
            // Usar la primera opción de cada grupo
            const freeOptions = freeGroup.rule.opciones_mensajeria || freeGroup.rule.opciones || [];
            const paidOptions = paidGroup.rule.opciones_mensajeria || paidGroup.rule.opciones || [];
            
            if (freeOptions.length > 0 && paidOptions.length > 0) {
              paidOptions.forEach((paidOption, paidIndex) => {
                const freeOption = freeOptions[0]; // Primera opción gratuita
                
                // Calcular datos de productos en grupos libres y pagados
                const freeProductsCount = freeProducts.reduce((count, item) => count + (item.quantity || 1), 0);
                const paidProductsCount = paidProducts.reduce((count, item) => count + (item.quantity || 1), 0);
                
                const freeProductsWeight = freeProducts.reduce((weight, item) => {
                  const productWeight = parseFloat(item.product.weight || item.product.peso || 0);
                  const quantity = item.quantity || 1;
                  return weight + (productWeight * quantity);
                }, 0);
                
                const paidProductsWeight = paidProducts.reduce((weight, item) => {
                  const productWeight = parseFloat(item.product.weight || item.product.peso || 0);
                  const quantity = item.quantity || 1;
                  return weight + (productWeight * quantity);
                }, 0);
                
                const freeGroupSubtotal = freeProducts.reduce((total, item) => {
                  const price = parseFloat(item.product.price || item.product.precio || 0);
                  const quantity = item.quantity || 1;
                  return total + (price * quantity);
                }, 0);
                
                const paidGroupSubtotal = paidProducts.reduce((total, item) => {
                  const price = parseFloat(item.product.price || item.product.precio || 0);
                  const quantity = item.quantity || 1;
                  return total + (price * quantity);
                }, 0);
                
                // Calcular precio final de la opción pagada
                let paidPrice = parseFloat(paidOption.precio || 0);
                let paidFreeReason = '';
                let isPaidFree = false;
                
                // Verificar si el grupo pagado aplica para envío gratuito
                if (paidGroup.rule.envio_gratis) {
                  isPaidFree = true;
                  paidFreeReason = 'Envío gratuito para todos los productos de esta regla';
                } 
                // Verificar monto mínimo para envío gratuito
                else if (paidGroup.rule.envio_gratis_monto_minimo && 
                         typeof paidGroup.rule.envio_gratis_monto_minimo === 'number' && 
                         paidGroupSubtotal >= paidGroup.rule.envio_gratis_monto_minimo) {
                  isPaidFree = true;
                  paidFreeReason = `Subtotal ($${paidGroupSubtotal}) mayor al mínimo para envío gratis ($${paidGroup.rule.envio_gratis_monto_minimo})`;
                }
                
                // Si aplica envío gratuito, el precio es 0
                if (isPaidFree) {
                  console.log(`✅ Envío gratuito aplicado para grupo pagado: ${paidFreeReason}`);
                  paidPrice = 0;
                } else {
                  // Calcular costos adicionales si no es gratuito
                  
                  // 1. Costo adicional por producto extra
                  if (paidGroup.rule.costo_por_producto_extra && paidProductsCount > 1) {
                    const extraProducts = paidProductsCount - 1;
                    const extraProductCost = extraProducts * parseFloat(paidGroup.rule.costo_por_producto_extra);
                    paidPrice += extraProductCost;
                    console.log(`💰 Grupo pagado: costo adicional por ${extraProducts} productos extra: $${extraProductCost}`);
                  }
                  
                  // 2. Costo adicional por peso extra
                  if (paidGroup.rule.costo_por_kg_extra && paidGroup.rule.peso_base) {
                    const baseWeight = parseFloat(paidGroup.rule.peso_base);
                    if (paidProductsWeight > baseWeight) {
                      const extraWeight = paidProductsWeight - baseWeight;
                      const extraWeightCost = extraWeight * parseFloat(paidGroup.rule.costo_por_kg_extra);
                      paidPrice += extraWeightCost;
                      console.log(`💰 Grupo pagado: costo adicional por ${extraWeight}kg extra: $${extraWeightCost}`);
                    }
                  }
                  
                  // 3. Verificar límites máximos
                  let paidExceedsLimits = false;
                  let paidLimitMessage = '';
                  
                  // Verificar límite máximo de productos por paquete
                  if (paidGroup.rule.maximo_productos_por_paquete && paidProductsCount > paidGroup.rule.maximo_productos_por_paquete) {
                    paidExceedsLimits = true;
                    paidLimitMessage = `Excede el máximo de productos por paquete (${paidGroup.rule.maximo_productos_por_paquete})`;
                  }
                  
                  // Verificar límite máximo de peso por paquete
                  if (paidGroup.rule.peso_maximo_paquete && paidProductsWeight > paidGroup.rule.peso_maximo_paquete) {
                    paidExceedsLimits = true;
                    paidLimitMessage = `${paidLimitMessage ? paidLimitMessage + ' y ' : ''}excede el peso máximo por paquete (${paidGroup.rule.peso_maximo_paquete}kg)`;
                  }
                  
                  // Si excede límites, marcar esta combinación
                  if (paidExceedsLimits) {
                    console.warn(`⚠️ Grupo pagado: ${paidLimitMessage}. Esto podría requerir división en múltiples paquetes.`);
                  }
                }
                
                // Precio gratuito (siempre 0)
                const freePrice = 0;
                
                // Verificar límites máximos para el grupo gratuito
                let freeExceedsLimits = false;
                let freeLimitMessage = '';
                
                // Verificar límite máximo de productos por paquete
                if (freeGroup.rule.maximo_productos_por_paquete && freeProductsCount > freeGroup.rule.maximo_productos_por_paquete) {
                  freeExceedsLimits = true;
                  freeLimitMessage = `Excede el máximo de productos por paquete (${freeGroup.rule.maximo_productos_por_paquete})`;
                }
                
                // Verificar límite máximo de peso por paquete
                if (freeGroup.rule.peso_maximo_paquete && freeProductsWeight > freeGroup.rule.peso_maximo_paquete) {
                  freeExceedsLimits = true;
                  freeLimitMessage = `${freeLimitMessage ? freeLimitMessage + ' y ' : ''}excede el peso máximo por paquete (${freeGroup.rule.peso_maximo_paquete}kg)`;
                }
                
                // Si excede límites, marcar esta combinación
                if (freeExceedsLimits) {
                  console.warn(`⚠️ Grupo gratuito: ${freeLimitMessage}. Esto podría requerir división en múltiples paquetes.`);
                }
                
                // Obtener o generar labels
                const paidLabel = paidOption.label || 
                                 (paidOption.nombre === "Correos de México" ? 
                                   (paidIndex === 0 ? "Basico" : "Express") : 
                                   (paidOption.nombre || `Opción ${paidIndex + 1}`));
                
                // Crear la combinación mixta
                combinations.push({
                  id: `mixed-${freeGroup.rule.id}-${paidGroup.rule.id}-${paidIndex}`,
                  description: `Mixto: ${paidLabel}`,
                  option: {
                    name: `Combinado (${freeGroup.rule.zona} + ${paidGroup.rule.zona})`,
                    label: paidLabel,
                    price: paidPrice + freePrice,
                    isFree: paidPrice + freePrice === 0,
                    freeReason: isPaidFree ? `${paidFreeReason} en el grupo pagado` : '',
                    estimatedDelivery: paidOption.tiempo_entrega || paidOption.tiempoEntrega || '?-? días'
                  },
                  ruleId: `mixed-${freeGroup.rule.id}-${paidGroup.rule.id}`,
                  ruleName: 'Combinado',
                  // Incluir los productos clasificados para mejor visualización
                  products: [...freeProducts, ...paidProducts],
                  // Metadatos para mejor visualización
                  freeProducts: freeProducts,
                  paidProducts: paidProducts,
                  freePrice: freePrice,
                  paidPrice: paidPrice,
                  freeProductsCount: freeProductsCount,
                  paidProductsCount: paidProductsCount,
                  freeProductsWeight: freeProductsWeight,
                  paidProductsWeight: paidProductsWeight,
                  freeGroupSubtotal: freeGroupSubtotal,
                  paidGroupSubtotal: paidGroupSubtotal,
                  isFreeGroup: true,
                  freeGroupName: freeGroup.rule.zona,
                  paidGroupName: paidGroup.rule.zona,
                  // Información de validación
                  freeExceedsLimits: freeExceedsLimits,
                  freeLimitMessage: freeLimitMessage,
                  paidExceedsLimits: paidExceedsLimits, 
                  paidLimitMessage: paidLimitMessage,
                  // Información de cobertura
                  coversAllProducts: true,
                  isComplete: true,
                  isMixed: true
                });
              });
            }
          }
        });
      });
    }
  }
  
  // Ordenar y optimizar las combinaciones para mostrar las más relevantes primero
  const sortedCombinations = combinations.sort((a, b) => {
    // Puntuación de relevancia (menor es mejor)
    let scoreA = 0;
    let scoreB = 0;
    
    // Factor 1: Cobertura completa de productos (muy importante)
    if (a.coversAllProducts) scoreA -= 1000;
    if (b.coversAllProducts) scoreB -= 1000;
    
    // Factor 2: Envío gratuito (muy importante)
    if (a.option.isFree) scoreA -= 500;
    if (b.option.isFree) scoreB -= 500;
    
    // Factor 3: Precio más bajo (importante)
    scoreA += a.option.price;
    scoreB += b.option.price;
    
    // Factor 4: Preferir opciones no mixtas sobre mixtas (menos importante)
    if (a.isMixed) scoreA += 50;
    if (b.isMixed) scoreB += 50;
    
    // Factor 5: Penalizar opciones que exceden límites
    if (a.limitMessage) scoreA += 100;
    if (b.limitMessage) scoreB += 100;
    
    // Factor 6: Tiempo de entrega (si disponible)
    // Extraer números de dias para comparación
    const getMaxDays = (str) => {
      if (!str) return 999; // Si no hay información, asumir que es muy tardado
      const matches = str.match(/(\d+)\s*días/i);
      if (matches && matches[1]) {
        return parseInt(matches[1], 10);
      }
      return 999;
    };
    
    scoreA += getMaxDays(a.option.estimatedDelivery) * 5; // Multiplicar por un factor menor
    scoreB += getMaxDays(b.option.estimatedDelivery) * 5;
    
    // Comparar puntuaciones finales (menor es mejor)
    if (scoreA !== scoreB) {
      return scoreA - scoreB;
    }
    
    // Si hay empate, usar alfabeticamente la descripción
    return (a.description || '').localeCompare(b.description || '');
  });
  
  // Agregar puntuación a cada combinación para posible uso en UI
  const scoredCombinations = sortedCombinations.map((combo, index) => {
    return {
      ...combo,
      relevanceScore: index, // El índice después de ordenar es su puntuación (0 = mejor)
      isRecommended: index === 0 // Marcar la mejor opción como recomendada
    };
  });
  
  // Devolver combinaciones ordenadas por relevancia
  return scoredCombinations;
};

/**
 * Verifica si una combinación de selecciones cubre todos los productos
 * @param {Array} selections - Selecciones de opciones de envío
 * @param {Array} cartItems - Productos en el carrito
 * @returns {boolean} - True si todas las selecciones cubren todos los productos
 */
export const allProductsCovered = (selections, cartItems) => {
  if (!selections || !cartItems) return false;
  
  // Obtener IDs de todos los productos en el carrito
  const allProductIds = new Set(cartItems.map(item => 
    (item.product?.id || item.id)
  ));
  
  // Obtener IDs de productos cubiertos por las selecciones
  const coveredProductIds = new Set();
  
  selections.forEach(selection => {
    if (!selection.products) return;
    
    selection.products.forEach(product => {
      coveredProductIds.add(product.product?.id || product.id);
    });
  });
  
  // Verificar que todos los productos estén cubiertos
  return Array.from(allProductIds).every(id => coveredProductIds.has(id));
}; 