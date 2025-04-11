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
 * @param {Array} cartItems - Todos los productos en el carrito para calcular combinaciones óptimas
 * @returns {Array} - Combinaciones de envío válidas
 */
export const generateShippingCombinations = (productGroups, addressInfo, shippingRules = [], cartItems = []) => {
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
  
  // Si recibimos los cartItems directamente, usarlos para obtener todos los productos
  if (cartItems && cartItems.length > 0) {
    cartItems.forEach(item => {
      allProductIds.add(item.product?.id || item.id);
    });
  } else {
    // Si no, obtenerlos de los grupos válidos
    validGroups.forEach(group => {
      group.products.forEach(item => {
        allProductIds.add(item.product.id);
      });
    });
  }
  
  // Calcular el total de productos en el carrito
  const totalProductsInCart = allProductIds.size;
  console.log(`📦 Total de productos únicos en el carrito: ${totalProductsInCart}`);
  
  // Clasificar los grupos por zona
  const groupsByZone = {};
  
  validGroups.forEach(group => {
    const zoneName = group.rule.zona || 'Sin zona';
    
    if (!groupsByZone[zoneName]) {
      groupsByZone[zoneName] = [];
    }
    
    groupsByZone[zoneName].push(group);
  });
  
  console.log(`📦 Agrupados por zona: ${Object.keys(groupsByZone).length} zonas`, Object.keys(groupsByZone));
  
  // Generar combinaciones individuales por zona
  Object.entries(groupsByZone).forEach(([zoneName, zoneGroups]) => {
    console.log(`📦 Procesando zona ${zoneName} con ${zoneGroups.length} grupos`);
    
    // Para cada grupo en esta zona
    zoneGroups.forEach(group => {
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
          isComplete: ruleCoversAll,
          carrier: option.nombre || "Servicio de envío",
          deliveryTime: option.tiempo_entrega || option.tiempoEntrega || '?-? días',
          totalPrice: optionPrice,
          zoneName: rule.zona,
          selections: [{
            groupId: rule.id,
            option: {
              name: option.nombre || "Servicio de envío",
              price: optionPrice,
              isFree: optionPrice === 0,
              estimatedDelivery: option.tiempo_entrega || option.tiempoEntrega || '?-? días'
            },
            products: group.products,
            ruleName: rule.zona
          }]
        });
      });
    });
  });
  
  // Si hay al menos dos zonas (e.g. local y nacional) que no cubren todos los productos individualmente,
  // crear combinaciones automáticas entre zonas
  if (Object.keys(groupsByZone).length >= 2) {
    console.log('⚡ Generando combinaciones entre zonas');
    
    const zonas = Object.keys(groupsByZone);
    
    // Buscar la zona local y nacional específicamente
    const hasLocal = zonas.some(z => z.toLowerCase().includes('local'));
    const hasNacional = zonas.some(z => z.toLowerCase().includes('nacional'));
    
    if (hasLocal && hasNacional) {
      console.log('⚡ Tenemos zona local y nacional, generando combinación local+nacional');
      
      // Obtener los mejores grupos de cada zona
      const localGroups = groupsByZone[zonas.find(z => z.toLowerCase().includes('local'))];
      const nacionalGroups = groupsByZone[zonas.find(z => z.toLowerCase().includes('nacional'))];
      
      // Para cada grupo local
      localGroups.forEach(localGroup => {
        // Para cada grupo nacional
        nacionalGroups.forEach(nacionalGroup => {
          // Verificar si estos dos grupos juntos cubren todos los productos
          const combinedProductIds = new Set();
          
          [...localGroup.products, ...nacionalGroup.products].forEach(item => {
            combinedProductIds.add(item.product.id);
          });
          
          const combinationCoversAll = Array.from(allProductIds).every(id => combinedProductIds.has(id));
          
          if (combinationCoversAll) {
            console.log('✅ Combinación local+nacional cubre todos los productos');
            
            // Separar productos que pertenecen solo a local o solo a nacional
            const localOnlyProducts = [];
            const nacionalOnlyProducts = [];
            
            // Clasificar productos
            const localProductIds = new Set(localGroup.products.map(item => item.product.id));
            const nacionalProductIds = new Set(nacionalGroup.products.map(item => item.product.id));
            
            // Usamos un Map para evitar duplicados, clave será el ID del producto
            const productMap = new Map();
            
            // Primero procesamos productos locales (tienen prioridad)
            localGroup.products.forEach(item => {
              const productId = item.product.id;
              // Guardamos en el mapa, priorizando local
              productMap.set(productId, {
                item,
                isLocal: true,
                isNacional: false
              });
            });
            
            // Luego productos nacionales, solo si no existen ya en local
            nacionalGroup.products.forEach(item => {
              const productId = item.product.id;
              if (productMap.has(productId)) {
                // Si ya existe, solo marcamos que también está en nacional
                const entry = productMap.get(productId);
                entry.isNacional = true;
              } else {
                // Si no existe, lo agregamos como producto nacional
                productMap.set(productId, {
                  item,
                  isLocal: false,
                  isNacional: true
                });
              }
            });
            
            // Ahora clasificamos en local o nacional según corresponda
            productMap.forEach((entry, productId) => {
              if (entry.isLocal && !entry.isNacional) {
                // Solo está en local
                localOnlyProducts.push(entry.item);
              } else if (!entry.isLocal && entry.isNacional) {
                // Solo está en nacional
                nacionalOnlyProducts.push(entry.item);
              } else if (entry.isLocal && entry.isNacional) {
                // Está en ambos, priorizamos local
                localOnlyProducts.push(entry.item);
              }
            });
            
            // Obtener la primera opción de cada grupo (o la mejor)
            const localOptions = localGroup.rule.opciones_mensajeria || localGroup.rule.opciones || [];
            const nacionalOptions = nacionalGroup.rule.opciones_mensajeria || nacionalGroup.rule.opciones || [];
            
            if (localOptions.length > 0 && nacionalOptions.length > 0) {
              // Para cada opción nacional (suele haber básica y express)
              nacionalOptions.forEach((nacionalOption, nacionalIndex) => {
                // Usar la primera opción local, que suele ser gratuita
                const localOption = localOptions[0];
                
                // Calcular precios y métricas para cada grupo
                const localProductCount = localOnlyProducts.reduce((count, item) => count + (item.quantity || 1), 0);
                const nacionalProductCount = nacionalOnlyProducts.reduce((count, item) => count + (item.quantity || 1), 0);
                
                const localWeight = localOnlyProducts.reduce((weight, item) => {
                  const productWeight = parseFloat(item.product.weight || item.product.peso || 0);
                  const quantity = item.quantity || 1;
                  return weight + (productWeight * quantity);
                }, 0);
                
                const nacionalWeight = nacionalOnlyProducts.reduce((weight, item) => {
                  const productWeight = parseFloat(item.product.weight || item.product.peso || 0);
                  const quantity = item.quantity || 1;
                  return weight + (productWeight * quantity);
                }, 0);
                
                const localSubtotal = localOnlyProducts.reduce((total, item) => {
                  const price = parseFloat(item.product.price || item.product.precio || 0);
                  const quantity = item.quantity || 1;
                  return total + (price * quantity);
                }, 0);
                
                const nacionalSubtotal = nacionalOnlyProducts.reduce((total, item) => {
                  const price = parseFloat(item.product.price || item.product.precio || 0);
                  const quantity = item.quantity || 1;
                  return total + (price * quantity);
                }, 0);
                
                // Descripción de la entrega nacional
                const nacionalLabel = nacionalOption.label || 
                                     (nacionalOption.nombre === "Correos de México" ? 
                                       (nacionalIndex === 0 ? "Básico" : "Express") : 
                                       (nacionalOption.nombre || `Opción ${nacionalIndex + 1}`));
                
                // Crear la combinación con detalles para visualización
                const combinedOption = {
                  id: `combined-local-nacional-${nacionalIndex}-${Date.now()}`,
                  description: `Combinado (Local + Nacional)`,
                  option: {
                    name: `Local y Nacional`,
                    label: nacionalLabel,
                    price: localOption.precio + nacionalOption.precio,
                    isFree: (localOption.precio + nacionalOption.precio) === 0,
                    estimatedDelivery: nacionalOption.tiempo_entrega || nacionalOption.tiempoEntrega || '?-? días'
                  },
                  ruleId: `combined-${localGroup.rule.id}-${nacionalGroup.rule.id}`,
                  ruleName: 'Combinado',
                  products: [...localOnlyProducts, ...nacionalOnlyProducts],
                  coversAllProducts: true,
                  isComplete: true,
                  isMixed: true,
                  carrier: 'Servicios combinados',
                  deliveryTime: nacionalOption.tiempo_entrega || nacionalOption.tiempoEntrega || '?-? días',
                  totalPrice: localOption.precio + nacionalOption.precio,
                  // Datos para la UI
                  freeProducts: localOnlyProducts,
                  paidProducts: nacionalOnlyProducts,
                  freePrice: localOption.precio,
                  paidPrice: nacionalOption.precio,
                  freeProductsCount: localProductCount,
                  paidProductsCount: nacionalProductCount,
                  freeProductsWeight: localWeight,
                  paidProductsWeight: nacionalWeight,
                  freeGroupSubtotal: localSubtotal,
                  paidGroupSubtotal: nacionalSubtotal,
                  freeGroupName: 'Local',
                  paidGroupName: 'Nacional',
                  // Selecciones para procesamiento interno
                  selections: [
                    {
                      groupId: localGroup.rule.id,
                      option: {
                        name: localOption.nombre || "Servicio local",
                        price: localOption.precio,
                        isFree: localOption.precio === 0,
                        estimatedDelivery: localOption.tiempo_entrega || localOption.tiempoEntrega || '1-1 días'
                      },
                      products: localOnlyProducts,
                      ruleName: 'Local'
                    },
                    {
                      groupId: nacionalGroup.rule.id,
                      option: {
                        name: nacionalOption.nombre || "Servicio nacional",
                        price: nacionalOption.precio,
                        isFree: nacionalOption.precio === 0,
                        estimatedDelivery: nacionalOption.tiempo_entrega || nacionalOption.tiempoEntrega || '?-? días'
                      },
                      products: nacionalOnlyProducts,
                      ruleName: 'Nacional'
                    }
                  ]
                };
                
                // Añadir a las combinaciones
                combinations.push(combinedOption);
              });
            }
          }
        });
      });
    }
  }
  
  // Después de generar todas las combinaciones individuales y mixtas...
  
  // Verificar si hay alguna combinación que cubra todos los productos
  const hasCompleteCoverage = combinations.some(combo => 
    combo.coversAllProducts === true || combo.isComplete === true
  );
  
  // Si NO hay ninguna combinación que cubra todos los productos, intentar generar una combinación óptima
  if (!hasCompleteCoverage && cartItems && cartItems.length > 0) {
    console.log('🔄 Ninguna combinación cubre todos los productos. Generando combinación óptima...');
    
    // Primero agrupar productos por las reglas de envío que los cubren
    const productCoverage = new Map(); // Map de productId -> Array de combinaciones que lo cubren
    
    // Para cada combinación, registrar qué productos cubre
    combinations.forEach(combo => {
      const productIds = new Set();
      
      if (combo.products) {
        combo.products.forEach(item => {
          const productId = item.product?.id || item.id;
          productIds.add(productId);
        });
      }
      
      productIds.forEach(productId => {
        if (!productCoverage.has(productId)) {
          productCoverage.set(productId, []);
        }
        productCoverage.get(productId).push(combo);
      });
    });
    
    // Crear una lista de todos los productos sin cobertura
    const uncoveredProducts = new Set(allProductIds);
    
    // Para cada producto, encontrar la mejor opción de envío
    const bestOptions = new Map(); // Map de productId -> mejor opción
    
    uncoveredProducts.forEach(productId => {
      const optionsForProduct = productCoverage.get(productId) || [];
      
      // Si hay opciones para este producto, encontrar la mejor (menor precio)
      if (optionsForProduct.length > 0) {
        // Ordenar por precio (menor primero)
        optionsForProduct.sort((a, b) => {
          // Primero priorizar envío gratuito
          const aIsFree = a.option?.isFree || a.isAllFree || false;
          const bIsFree = b.option?.isFree || b.isAllFree || false;
          
          if (aIsFree && !bIsFree) return -1;
          if (!aIsFree && bIsFree) return 1;
          
          // Luego por precio
          const aPrice = a.option?.price || a.totalPrice || 0;
          const bPrice = b.option?.price || b.totalPrice || 0;
          return aPrice - bPrice;
        });
        
        // La mejor opción es la primera después de ordenar
        bestOptions.set(productId, optionsForProduct[0]);
      }
    });
    
    // Ahora tenemos la mejor opción para cada producto
    // Para minimizar el número de servicios de envío, agrupar productos que pueden
    // compartir el mismo servicio
    const optimalCombinations = [];
    const optionsUsed = new Set();
    
    // Comenzar con las opciones gratuitas
    bestOptions.forEach((option, productId) => {
      const optionId = option.id;
      
      if (option.option?.isFree || option.isAllFree) {
        if (!optionsUsed.has(optionId)) {
          optimalCombinations.push(option);
          optionsUsed.add(optionId);
        }
      }
    });
    
    // Luego agregar opciones pagadas
    bestOptions.forEach((option, productId) => {
      const optionId = option.id;
      
      if (!(option.option?.isFree || option.isAllFree)) {
        if (!optionsUsed.has(optionId)) {
          optimalCombinations.push(option);
          optionsUsed.add(optionId);
        }
      }
    });
    
    // Si tenemos combinaciones óptimas
    if (optimalCombinations.length > 0) {
      // Calcular el precio total
      const totalPrice = optimalCombinations.reduce((sum, combo) => {
        const price = combo.option?.price || combo.totalPrice || 0;
        return sum + price;
      }, 0);
      
      // Crear una combinación "óptima" que incluya todas las opciones
      const optimalCombination = {
        id: `optimal-combination-${Date.now()}`,
        description: `Combinación óptima (${optimalCombinations.length} servicios)`,
        selections: optimalCombinations.map(combo => ({
          option: combo.option || {
            name: combo.ruleName || 'Servicio de envío',
            price: combo.totalPrice || 0,
            isFree: combo.isAllFree || false,
            estimatedDelivery: combo.estimatedDelivery || '3-5 días'
          },
          products: combo.products || [],
          groupId: combo.ruleId || combo.id,
          ruleName: combo.ruleName || combo.description,
        })),
        totalPrice: totalPrice,
        calculatedCost: totalPrice,
        coversAllProducts: true,
        allProductsCovered: true,
        isOptimalCombination: true,
        isMultiOption: true
      };
      
      // Agregar esta combinación óptima
      combinations.push(optimalCombination);
      
      console.log(`✅ Generada combinación óptima con ${optimalCombinations.length} servicios y precio total: $${totalPrice}`);
    }
  }
  
  // Al final, después de todas las combinaciones...
  // Marcar combinaciones completas vs. incompletas
  const processedCombinations = combinations.map(combination => {
    // Contar productos cubiertos por esta combinación
    const coveredProductIds = new Set();
    
    if (combination.products) {
      combination.products.forEach(item => {
        coveredProductIds.add(item.product?.id || item.id);
      });
    } else if (combination.selections) {
      combination.selections.forEach(selection => {
        if (selection.products) {
          selection.products.forEach(item => {
            coveredProductIds.add(item.product?.id || item.id);
          });
        }
      });
    }
    
    // Calcular si todos los productos están cubiertos
    const allProductsCovered = coveredProductIds.size === totalProductsInCart;
    const coveragePercentage = totalProductsInCart > 0 ? 
      (coveredProductIds.size / totalProductsInCart) * 100 : 0;
    
    return {
      ...combination,
      allProductsCovered,
      coveragePercentage,
      description: combination.description + (allProductsCovered || combination.isOptimalCombination ? 
        '' : 
        ` (Cubre ${coveredProductIds.size}/${totalProductsInCart} productos)`)
    };
  });
  
  // Ordenar las combinaciones: primero las que cubren todos los productos,
  // luego por precio y relevancia
  const sortedCombinations = processedCombinations.sort((a, b) => {
    // Primero priorizar cobertura completa
    if (a.allProductsCovered && !b.allProductsCovered) return -1;
    if (!a.allProductsCovered && b.allProductsCovered) return 1;
    
    // Segundo, priorizar combinaciones óptimas generadas
    if (a.isOptimalCombination && !b.isOptimalCombination) return -1;
    if (!a.isOptimalCombination && b.isOptimalCombination) return 1;
    
    // Si ambas tienen la misma cobertura, ordenar por porcentaje (mayor primero)
    if (a.coveragePercentage !== b.coveragePercentage) {
      return b.coveragePercentage - a.coveragePercentage;
    }
    
    // Si tienen el mismo porcentaje, priorizar opciones gratuitas
    const aIsFree = a.isAllFree || a.isFreeShipping || false;
    const bIsFree = b.isAllFree || b.isFreeShipping || false;
    
    if (aIsFree && !bIsFree) return -1;
    if (!aIsFree && bIsFree) return 1;
    
    // Si tienen el mismo estado de gratuidad, ordenar por precio
    const aPrice = a.totalPrice || a.option?.price || 9999;
    const bPrice = b.totalPrice || b.option?.price || 9999;
    
    return aPrice - bPrice;
  });
  
  // Devolver combinaciones ordenadas por relevancia
  return sortedCombinations;
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