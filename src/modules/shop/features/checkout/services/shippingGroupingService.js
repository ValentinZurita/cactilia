import { fetchShippingRuleById } from '../../../../admin/shipping/api/shippingApi';

/**
 * Agrupa los productos por sus reglas de envío
 * @param {Array} cartItems - Elementos del carrito a agrupar
 * @returns {Promise<Array>} - Grupos de envío
 */
export const groupProductsByShippingRules = async (cartItems = []) => {
  console.log('🚚 Agrupando productos por reglas de envío:', cartItems.length, 'productos');
  
  if (!cartItems || cartItems.length === 0) {
    console.warn('🚨 No hay productos para agrupar');
    return [];
  }

  try {
    // Filtrar productos válidos (con reglas de envío)
    const validItems = cartItems.filter(item => {
      const product = item.product || item;
      console.log(`🔍 Verificando producto ${product.name || product.id}:`, {
        shippingRuleId: product.shippingRuleId,
        shippingRuleIds: product.shippingRuleIds,
        hasRules: !!(product.shippingRuleId || (product.shippingRuleIds && product.shippingRuleIds.length > 0))
      });
      return product.shippingRuleId || (product.shippingRuleIds && product.shippingRuleIds.length > 0);
    });

    console.log(`🚚 Productos con reglas de envío: ${validItems.length} de ${cartItems.length}`);

    if (validItems.length === 0) {
      console.warn('🚨 Ningún producto tiene reglas de envío');
      return [];
    }

    // Mapa para asociar productos con sus reglas de envío
    const productsByRuleMap = new Map();
    // Caché para reglas de envío ya consultadas
    const rulesCache = new Map();
    
    // Procesar cada elemento del carrito
    for (const item of validItems) {
      const product = item.product || item;
      
      // Obtener IDs de reglas de envío (múltiples o única)
      const ruleIds = product.shippingRuleIds && Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0
        ? product.shippingRuleIds
        : (product.shippingRuleId ? [product.shippingRuleId] : []);
      
      if (ruleIds.length === 0) {
        console.warn(`🚨 Producto ${product.name || product.id} no tiene reglas de envío asignadas (verificación redundante)`);
        continue;
      }
      
      console.log(`📦 Procesando producto ${product.name || product.id} con reglas:`, ruleIds);
      
      // Por simplicidad, usamos solo la primera regla
      const ruleId = ruleIds[0];
      
      // Si ya tenemos esta regla en el mapa, agregar el producto
      if (productsByRuleMap.has(ruleId)) {
        productsByRuleMap.get(ruleId).items.push(item);
        continue;
      }
      
      // Si ya tenemos la regla en caché, usarla
      let ruleData;
      if (rulesCache.has(ruleId)) {
        ruleData = rulesCache.get(ruleId);
        console.log(`🔍 Usando regla en caché: ${ruleId} - ${ruleData.zona || 'Sin nombre'}`);
      } else {
        // Obtener regla desde Firestore
        try {
          console.log(`🔍 Consultando regla en Firestore: ${ruleId}`);
          ruleData = await fetchShippingRuleById(ruleId);
          
          if (!ruleData) {
            console.error(`🚨 Regla de envío ${ruleId} no encontrada. El producto ${product.name || product.id} no será incluido en el cálculo.`);
            continue;
          }
          
          console.log(`✅ Regla encontrada: ${ruleId} - ${ruleData.zona || 'Sin nombre'}`);
          
          // Validar que la regla tenga opciones de mensajería
          if (!ruleData.opciones_mensajeria || !Array.isArray(ruleData.opciones_mensajeria) || ruleData.opciones_mensajeria.length === 0) {
            console.warn(`🚨 Regla ${ruleId} no tiene opciones de mensajería. El producto ${product.name || product.id} no será incluido.`);
            continue;
          }
          
          console.log(`📨 Regla ${ruleId} tiene ${ruleData.opciones_mensajeria.length} opciones de mensajería`);
          
          // Agregar a caché
          rulesCache.set(ruleId, ruleData);
        } catch (error) {
          console.error(`🚨 Error al obtener regla ${ruleId}:`, error);
          continue;
        }
      }
      
      // Crear nuevo grupo con esta regla
      productsByRuleMap.set(ruleId, {
        id: `group-${ruleId}`,
        name: `Grupo: ${ruleData.zona || 'Sin nombre'}`,
        rule: ruleData,
        rules: [ruleData],
        items: [item]
      });
    }
    
    // Convertir el mapa a un array de grupos
    const groups = Array.from(productsByRuleMap.values());
    console.log(`🚚 Se crearon ${groups.length} grupos de envío`);
    
    return groups;
  } catch (error) {
    console.error('🚨 Error al agrupar productos por reglas de envío:', error);
    throw error;
  }
};

/**
 * Prepara opciones de envío para el checkout basadas en grupos de productos
 * @param {Array} shippingGroups - Grupos de productos por regla de envío
 * @param {string} addressId - ID de la dirección seleccionada 
 * @returns {Promise<Array>} - Opciones de envío disponibles
 */
export const prepareShippingOptionsForCheckout = async (shippingGroups = [], addressId = '') => {
  console.log('🚚 Preparando opciones de envío para', shippingGroups.length, 'grupos');
  
  if (!shippingGroups || shippingGroups.length === 0) {
    console.warn('🚨 No hay grupos de productos para calcular opciones de envío');
    return [];
  }
  
  try {
    // Para cada grupo, calcular opciones de envío
    let totalOptions = [];
    
    // Procesar cada grupo
    for (const group of shippingGroups) {
      // Extraer regla del grupo
      const rule = group.rule;
      if (!rule) {
        console.warn('🚨 Grupo sin regla definida:', group.id);
        continue;
      }
      
      // Validar opciones de mensajería
      if (!rule.opciones_mensajeria || !Array.isArray(rule.opciones_mensajeria)) {
        console.warn('🚨 Regla sin opciones de mensajería:', rule.id);
        continue;
      }
      
      // Calcular peso y cantidad total
      let totalWeight = 0;
      let totalQuantity = 0;
      
      for (const item of group.items) {
        const product = item.product || item;
        const weight = parseFloat(product.weight || 1);
        const quantity = parseInt(item.quantity || 1);
        
        totalWeight += (isNaN(weight) ? 1 : weight) * (isNaN(quantity) ? 1 : quantity);
        totalQuantity += (isNaN(quantity) ? 1 : quantity);
      }
      
      // Agregar información al grupo
      group.totalWeight = totalWeight;
      group.totalQuantity = totalQuantity;
      group.shippingOptions = [];
      
      // Calcular subtotal del grupo para envío gratis
      const subtotal = group.items.reduce((sum, item) => {
        const price = parseFloat((item.product || item).price || 0);
        const quantity = parseInt(item.quantity || 1);
        return sum + (isNaN(price) ? 0 : price) * (isNaN(quantity) ? 1 : quantity);
      }, 0);
      
      group.subtotal = subtotal;
      
      // Verificar si aplica envío gratis
      const freeShippingMinimumAmount = parseFloat(rule.envio_gratis_monto_minimo || 0);
      const isFreeShipping = 
        rule.envio_gratis === true || 
        (freeShippingMinimumAmount > 0 && subtotal >= freeShippingMinimumAmount);
      
      group.isFreeShipping = isFreeShipping;
      
      // Procesar cada método de envío
      for (const method of rule.opciones_mensajeria) {
        // Crear ID único para la opción
        const optionId = `${rule.id}-${method.nombre?.replace(/\s+/g, '-')?.toLowerCase() || 'option'}`;
        
        // Extraer información del método
        const basePrice = parseFloat(method.precio || 0);
        const minDays = parseInt(method.minDays || method.tiempo_entrega_min || 3);
        const maxDays = parseInt(method.maxDays || method.tiempo_entrega_max || 5);
        
        // Calcular costo de envío
        const deliveryCost = isFreeShipping ? 0 : basePrice;
        
        // Crear opción de envío para este grupo
        const groupOption = {
          id: optionId,
          ruleId: rule.id,
          groupId: group.id,
          carrier: method.nombre || 'Envío',
          label: method.label || method.nombre || 'Envío',
          basePrice,
          calculatedCost: deliveryCost,
          totalCost: deliveryCost,
          deliveryTime: method.tiempo_entrega || `${minDays}-${maxDays} días`,
          isFreeShipping,
          details: `${method.tiempo_entrega || `${minDays}-${maxDays} días`} (${isFreeShipping ? 'Gratis' : `$${deliveryCost.toFixed(2)}`})`,
          group
        };
        
        // Añadir al grupo
        group.shippingOptions.push(groupOption);
        
        // Verificar si ya existe esta opción en las opciones totales
        const existingOption = totalOptions.find(opt => opt.carrier === method.nombre);
        
        if (existingOption) {
          // Agregar este grupo a la opción existente
          existingOption.groups.push(group);
          existingOption.totalCost += deliveryCost;
          existingOption.isFreeShipping = existingOption.isFreeShipping && isFreeShipping;
        } else {
          // Crear nueva opción total
          totalOptions.push({
            id: optionId,
            carrier: method.nombre || 'Envío',
            label: method.label || method.nombre || 'Envío',
            basePrice,
            totalCost: deliveryCost,
            deliveryTime: method.tiempo_entrega || `${minDays}-${maxDays} días`,
            isFreeShipping,
            details: `${method.tiempo_entrega || `${minDays}-${maxDays} días`} (${isFreeShipping ? 'Gratis' : `$${deliveryCost.toFixed(2)}`})`,
            groups: [group]
          });
        }
      }
    }
    
    // Ordenar opciones totales por costo
    totalOptions.sort((a, b) => {
      // Primero envío gratis
      if (a.isFreeShipping && !b.isFreeShipping) return -1;
      if (!a.isFreeShipping && b.isFreeShipping) return 1;
      
      // Luego por costo
      return a.totalCost - b.totalCost;
    });
    
    console.log(`🚚 Opciones de envío calculadas: ${totalOptions.length}`);
    
    return {
      groups: shippingGroups,
      totalOptions
    };
  } catch (error) {
    console.error('🚨 Error al preparar opciones de envío:', error);
    throw error;
  }
}; 