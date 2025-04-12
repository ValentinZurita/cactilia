/**
 * Servicio para agrupar productos del carrito por reglas de envío
 * 
 * Este módulo proporciona funciones para agrupar productos según sus reglas de envío
 * y calcular los costos de envío para cada grupo, optimizando para el menor costo
 * y el menor número de grupos posibles.
 */

import { fetchShippingRuleById } from '../../../../admin/shipping/api/shippingApi.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Analiza los productos del carrito y obtiene sus reglas de envío.
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} userAddress - Dirección del usuario (opcional)
 * @returns {Promise<Object>} Mapa de productos a reglas y detalles
 */
export const analyzeCartItems = async (cartItems, userAddress = null) => {
  console.log(`🔍 Analizando ${cartItems?.length || 0} productos del carrito`, {
    tieneUserAddress: !!userAddress,
    tipoCartItems: typeof cartItems,
    esArray: Array.isArray(cartItems),
    longitudArray: cartItems?.length || 0
  });
  
  if (!cartItems || !cartItems.length) {
    console.log('Carrito vacío, no hay productos para analizar');
    return {
      productRules: {},
      productDetails: {},
      ruleDetails: {}
    };
  }
  
  // Log para depurar formato de primer item
  console.log('📦 Ejemplo de item del carrito:', JSON.stringify(cartItems[0], null, 2).substring(0, 500));
  
  // Map de producto a reglas de envío
  const productRules = {};
  // Detalles de cada producto
  const productDetails = {};
  // Detalles de cada regla de envío
  const ruleDetails = {};
  
  // Para cada producto en el carrito
  for (const item of cartItems) {
    console.log('🔎 Analizando item del carrito:', JSON.stringify(item).substring(0, 150));
    
    // 1. Extraer producto y cantidad del item
    let product, quantity;
    
    if (item.product && typeof item.product === 'object') {
      // Caso: {product: {...}, quantity: X}
      product = item.product;
      quantity = item.quantity || 1;
      console.log('✅ Formato estándar: producto y cantidad separados');
    } else if (item.productData && typeof item.productData === 'object') {
      // Caso: {productData: {...}, quantity: X}
      product = item.productData;
      quantity = item.quantity || 1;
      console.log('✅ Formato alternativo: productData y cantidad');
    } else if (item.id) {
      // Caso: el item es el producto directamente
      product = item;
      quantity = item.quantity || 1;
      console.log('✅ Formato plano: el item es el producto');
    } else {
      // Caso fallback: intentar con el item directamente
      product = item;
      quantity = 1;
      console.log('⚠️ Formato no reconocido, usando item como producto');
    }
    
    // Verificación final
    if (!product || !product.id) {
      console.warn('⚠️ Producto inválido en el carrito, omitiendo', {
        tieneProduct: !!item.product, 
        tipoItem: typeof item,
        contenidoItem: JSON.stringify(item).substring(0, 200)
      });
      continue;
    }
    
    console.log(`📦 Procesando producto: ${product.name || product.id} (cantidad: ${quantity})`);
    
    // 2. Guardar detalles del producto
    productDetails[product.id] = {
      id: product.id,
      name: product.name || 'Producto sin nombre',
      price: product.price || 0,
      weight: product.peso || product.weight || 1,
      quantity: quantity,
      image: product.images?.[0] || product.image || null
    };
    
    // 3. Obtener reglas de envío para este producto
    let rules = [];
    
    // CASO 1: Reglas explícitas en el producto (shipping_rules - formato array)
    if (product.shipping_rules && Array.isArray(product.shipping_rules) && product.shipping_rules.length > 0) {
      rules = product.shipping_rules;
      console.log(`✅ Producto tiene ${rules.length} reglas explícitas (shipping_rules)`);
    }
    // CASO 1B: Reglas explícitas en el producto (shippingRuleIds - formato array)
    else if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0) {
      rules = product.shippingRuleIds;
      console.log(`✅ Producto tiene ${rules.length} reglas explícitas (shippingRuleIds)`);
    }
    // CASO 2: Regla explícita única (shipping_rule - string)
    else if (product.shipping_rule && typeof product.shipping_rule === 'string') {
      rules = [product.shipping_rule];
      console.log(`✅ Producto tiene regla explícita única (shipping_rule): ${product.shipping_rule}`);
    }
    // CASO 2B: Regla explícita única (shippingRuleId - string)
    else if (product.shippingRuleId && typeof product.shippingRuleId === 'string') {
      rules = [product.shippingRuleId];
      console.log(`✅ Producto tiene regla explícita única (shippingRuleId): ${product.shippingRuleId}`);
    }
    // CASO 3: Buscar reglas por código postal
    else if (userAddress && userAddress.zipcode) {
      // Esta parte podría integrarse con un servicio de búsqueda de reglas por CP
      console.log(`🔍 Buscando reglas para CP: ${userAddress.zipcode}`);
      // Por ahora, usar regla nacional predeterminada
      const nationalRuleId = "fyfkhfITejBjMASFCMZ2"; // Ejemplo de ID
      rules = [nationalRuleId];
      console.log(`⚠️ Usando regla nacional predeterminada: ${nationalRuleId}`);
    }
    // CASO 4: Sin reglas, usar nacional predeterminada
    else {
      console.warn('⚠️ No hay reglas de envío para este producto ni dirección');
      const nationalRuleId = "fyfkhfITejBjMASFCMZ2"; // Ejemplo de ID
      rules = [nationalRuleId];
      console.log(`⚠️ Usando regla nacional predeterminada: ${nationalRuleId}`);
    }
    
    // Guardar las reglas para este producto
    productRules[product.id] = rules;
    
    // Cargar detalles de cada regla
    for (const ruleId of rules) {
      // Si ya tenemos esta regla, no la cargamos de nuevo
      if (ruleDetails[ruleId]) continue;
      
      try {
        const ruleDetail = await fetchShippingRuleById(ruleId);
        if (ruleDetail) {
          ruleDetails[ruleId] = ruleDetail;
          console.log(`✅ Regla cargada: ${ruleDetail.zona || ruleId}`);
        } else {
          console.warn(`⚠️ No se pudo cargar la regla: ${ruleId}`);
        }
      } catch (error) {
        console.error(`❌ Error cargando regla ${ruleId}:`, error);
      }
    }
  }
  
  console.log(`✅ Análisis completado: ${Object.keys(productRules).length} productos con reglas`);
  
  return {
    productRules,
    productDetails,
    ruleDetails
  };
};

/**
 * Calcula el peso total de un grupo de productos.
 * @param {Object} group - Grupo de productos
 * @param {Object} productDetails - Detalles de cada producto
 * @returns {number} Peso total en kg
 */
const calculateGroupWeight = (group, productDetails) => {
  const { products } = group;
  
  let totalWeight = 0;
  
  products.forEach(productId => {
    const product = productDetails[productId];
    if (product) {
      const weight = parseFloat(product.weight || 1);
      const quantity = parseInt(product.quantity || 1);
      totalWeight += weight * quantity;
    }
  });
  
  return totalWeight;
};

/**
 * Calcula el subtotal de un grupo de productos.
 * @param {Object} group - Grupo de productos
 * @param {Object} productDetails - Detalles de cada producto
 * @returns {number} Subtotal del grupo
 */
const calculateGroupSubtotal = (group, productDetails) => {
  const { products } = group;
  
  let subtotal = 0;
  
  products.forEach(productId => {
    const product = productDetails[productId];
    if (product) {
      const price = parseFloat(product.price || 0);
      const quantity = parseInt(product.quantity || 1);
      subtotal += price * quantity;
    }
  });
  
  return subtotal;
};

/**
 * Calcula las opciones de envío para un grupo de productos.
 * 
 * @param {Object} group - Grupo de productos
 * @param {Array} group.products - Productos en el grupo
 * @param {Array} group.rules - Reglas de envío del grupo
 * @param {Object} productDetails - Detalles de cada producto
 * @param {Object} ruleDetails - Detalles de cada regla de envío
 * @returns {Array} Opciones de envío para el grupo
 */
const calculateShippingOptionsForGroup = (group, productDetails, ruleDetails) => {
  const { products, rules } = group;
  
  if (!rules || rules.length === 0) {
    console.error('❌ No hay reglas de envío para este grupo');
    return [];
  }
  
  // Calcula el peso total y subtotal del grupo
  const groupWeight = calculateGroupWeight(group, productDetails);
  const groupSubtotal = calculateGroupSubtotal(group, productDetails);
  
  console.log(`📦 Calculando opciones para grupo. ${products.length} productos, ${rules.length} reglas, peso: ${groupWeight}kg, subtotal: $${groupSubtotal}`);
  
  // Opciones de envío finales para este grupo
  let shippingOptions = [];
  
  // Procesar cada regla de envío
  rules.forEach(ruleId => {
    const rule = ruleDetails[ruleId];
    
    if (!rule) {
      console.warn(`⚠️ Regla no encontrada: ${ruleId}`);
      return;
    }
    
    console.log(`🔍 Evaluando regla: ${rule.zona || ruleId}`);
    
    // Si la regla tiene envío gratis
    if (rule.envio_gratis) {
      console.log(`🎁 Regla ${ruleId} tiene envío gratis`);
      
      // Verificar si hay opciones de mensajería configuradas
      if (rule.opciones_mensajeria && Array.isArray(rule.opciones_mensajeria) && rule.opciones_mensajeria.length > 0) {
        const freeOptions = rule.opciones_mensajeria.map(option => ({
          optionId: uuidv4(),
          ruleId,
          name: `${option.nombre} - ${option.label || 'Estándar'}`,
          price: 0, // Siempre es 0 para envío gratis
          originalPrice: parseFloat(option.precio || 0),
          estimatedDelivery: option.tiempo_entrega || '3-5 días',
          isFreeShipping: true,
          zoneName: rule.zona || 'No especificada',
          details: option,
          rule: rule
        }));
        
        console.log(`✅ Agregando ${freeOptions.length} opciones gratuitas de regla ${ruleId}`);
        shippingOptions.push(...freeOptions);
      } else {
        // Crear una opción gratuita predeterminada
        const freeOption = {
          optionId: uuidv4(),
          ruleId,
          name: `Envío Gratuito (${rule.zona || 'Estándar'})`,
          price: 0,
          originalPrice: 0,
          estimatedDelivery: '3-5 días',
          isFreeShipping: true,
          zoneName: rule.zona || 'No especificada',
          details: {
            nombre: "Envío Gratuito",
            label: "Estándar",
            precio: "0",
            tiempo_entrega: "3-5 días"
          },
          rule: rule
        };
        
        console.log(`✅ Agregando opción gratuita predeterminada para regla ${ruleId}`);
        shippingOptions.push(freeOption);
      }
    } 
    // Si la regla NO tiene envío gratis 
    else {
      console.log(`📦 Regla ${ruleId} NO tiene envío gratis, buscando opciones`);
      
      // Verificar las opciones de mensajería disponibles
      let validMessagingOptions = [];
      
      // Verificar si hay opciones de mensajería configuradas en la raíz
      if (rule.opciones_mensajeria && Array.isArray(rule.opciones_mensajeria) && rule.opciones_mensajeria.length > 0) {
        console.log(`✅ Encontradas ${rule.opciones_mensajeria.length} opciones de mensajería en la raíz para regla ${ruleId}`);
        validMessagingOptions = rule.opciones_mensajeria;
      }
      // Verificar si hay opciones de mensajería en envio_variable
      else if (rule.envio_variable && 
               rule.envio_variable.opciones_mensajeria && 
               Array.isArray(rule.envio_variable.opciones_mensajeria) && 
               rule.envio_variable.opciones_mensajeria.length > 0) {
        console.log(`✅ Encontradas ${rule.envio_variable.opciones_mensajeria.length} opciones de mensajería en envio_variable para regla ${ruleId}`);
        validMessagingOptions = rule.envio_variable.opciones_mensajeria;
      }
      // Si no hay opciones configuradas, crear una predeterminada
      else {
        console.warn(`⚠️ La regla ${ruleId} no tiene opciones de mensajería válidas. Creando opción predeterminada.`);
        
        validMessagingOptions = [{
          nombre: rule.zona || "Envío Estándar",
          label: "Estándar",
          precio: rule.precio_base || "200",
          tiempo_entrega: "3-5 días",
          configuracion_paquetes: {
            peso_maximo_paquete: 20,
            costo_por_kg_extra: 10,
            maximo_productos_por_paquete: 10
          }
        }];
      }
      
      // Procesar cada opción de mensajería para crear las opciones de envío
      validMessagingOptions.forEach(option => {
        // Calcular precio
        let finalPrice = parseFloat(option.precio || 0);
        
        // Calcular costo adicional si aplica por peso
        if (option.configuracion_paquetes && groupWeight > option.configuracion_paquetes.peso_maximo_paquete) {
          const extraWeight = groupWeight - option.configuracion_paquetes.peso_maximo_paquete;
          const extraCost = extraWeight * parseFloat(option.configuracion_paquetes.costo_por_kg_extra || 0);
          finalPrice += extraCost;
          
          console.log(`📊 Peso adicional: ${extraWeight}kg, costo adicional: $${extraCost}, precio final: $${finalPrice}`);
        }
        
        const shippingOption = {
          optionId: uuidv4(),
          ruleId,
          name: `${option.nombre}${option.label ? ` - ${option.label}` : ''}`,
          price: finalPrice,
          originalPrice: parseFloat(option.precio || 0),
          estimatedDelivery: option.tiempo_entrega || '3-5 días',
          isFreeShipping: false,
          zoneName: rule.zona || 'No especificada',
          details: option,
          rule: rule
        };
        
        console.log(`✅ Agregando opción de envío: ${shippingOption.name} por $${shippingOption.price}`);
        shippingOptions.push(shippingOption);
      });
    }
  });
  
  // Si después de todo no hay opciones, devolver array vacío (sin opción predeterminada)
  if (shippingOptions.length === 0) {
    console.warn(`⚠️ No se encontraron opciones de envío para el grupo. Saltando este grupo.`);
    return [];
  }
  
  console.log(`✅ Total de opciones para el grupo: ${shippingOptions.length}`);
  return shippingOptions;
};

/**
 * Encuentra los grupos óptimos de envío para los productos del carrito.
 * Prioriza:
 * 1. Productos con envío gratuito se agrupan por separado
 * 2. Minimizar el número de grupos
 * 3. Minimizar el costo total de envío
 * 
 * @param {Object} productRules - Mapa de producto a reglas de envío
 * @param {Object} ruleDetails - Detalles de cada regla de envío
 * @param {Object} productDetails - Detalles de cada producto
 * @returns {Array} Grupos óptimos de envío
 */
const findOptimalShippingGroups = (productRules, ruleDetails, productDetails) => {
  console.log('🔍 Iniciando búsqueda de grupos óptimos con:', {
    productRulesCount: Object.keys(productRules).length,
    ruleDetailsCount: Object.keys(ruleDetails).length,
    productDetails: Object.keys(productDetails).length
  });

  if (!productRules || Object.keys(productRules).length === 0) {
    console.warn('⚠️ No hay productos para agrupar');
    return [];
  }

  // Paso 1: Separar productos con envío gratuito
  const productsWithFreeShipping = new Set();
  const productsWithoutFreeShipping = new Set();
  
  // Productos por regla (para agrupar después por regla)
  const productsByRule = {};
  
  // Primero identificamos los productos con al menos una regla de envío gratuito
  Object.entries(productRules).forEach(([productId, rules]) => {
    let hasFreeShipping = false;
    
    // Verificar si alguna regla tiene envío gratuito
    for (const ruleId of rules) {
      const rule = ruleDetails[ruleId];
      
      // Añadir producto a su regla correspondiente para agrupar después
      if (!productsByRule[ruleId]) {
        productsByRule[ruleId] = new Set();
      }
      productsByRule[ruleId].add(productId);
      
      // Verificar si es envío gratuito
      if (rule?.envio_gratis) {
        hasFreeShipping = true;
        console.log(`✅ Producto ${productId} tiene envío gratis con regla ${ruleId}`);
        break;
      }
    }
    
    // Separar productos según si tienen envío gratuito o no
    if (hasFreeShipping) {
      productsWithFreeShipping.add(productId);
    } else {
      productsWithoutFreeShipping.add(productId);
    }
  });
  
  console.log(`📊 Análisis de productos: ${productsWithFreeShipping.size} con envío gratis, ${productsWithoutFreeShipping.size} sin envío gratis`);
  
  // Grupos finales
  const finalGroups = [];
  
  // Paso 2: Formar grupos con productos de envío gratuito
  // Agrupamos por regla de envío gratuito
  const processedFreeProducts = new Set();
  
  Object.entries(ruleDetails).forEach(([ruleId, rule]) => {
    if (rule?.envio_gratis && productsByRule[ruleId]) {
      const productsWithThisRule = new Set([...productsByRule[ruleId]].filter(
        productId => productsWithFreeShipping.has(productId) && !processedFreeProducts.has(productId)
      ));
      
      if (productsWithThisRule.size > 0) {
        console.log(`🔄 Creando grupo gratuito con regla ${ruleId} y ${productsWithThisRule.size} productos`);
        
        // Marcar estos productos como procesados
        productsWithThisRule.forEach(productId => processedFreeProducts.add(productId));
        
        // Crear el grupo
        finalGroups.push({
          products: [...productsWithThisRule],
          rules: [ruleId]
        });
      }
    }
  });
  
  // Paso 3: Para los productos sin envío gratuito, usar el algoritmo original de agrupación
  const remainingProducts = [...productsWithoutFreeShipping, 
    ...productsWithFreeShipping].filter(productId => !processedFreeProducts.has(productId));
  
  if (remainingProducts.length > 0) {
    console.log(`🔄 Procesando ${remainingProducts.length} productos restantes sin envío gratuito`);
    
    // Construir matriz de compatibilidad para los productos restantes
    const compatibilityMatrix = buildCompatibilityMatrix(
      remainingProducts, 
      productRules
    );
    
    // Encontrar grupos válidos con el algoritmo original
    const compatibleGroups = findValidGroupings(
      remainingProducts,
      compatibilityMatrix,
      productRules
    );
    
    // Añadir estos grupos a los grupos finales
    finalGroups.push(...compatibleGroups);
  }
  
  // Verificar que todos los productos están en algún grupo
  const allProductIds = new Set(Object.keys(productRules));
  const groupedProductIds = new Set();
  
  finalGroups.forEach(group => {
    group.products.forEach(productId => {
      groupedProductIds.add(productId);
    });
  });
  
  // Si hay productos que no están en ningún grupo, crear grupos individuales para ellos
  const ungroupedProducts = [...allProductIds].filter(productId => !groupedProductIds.has(productId));
  
  if (ungroupedProducts.length > 0) {
    console.warn(`⚠️ Hay ${ungroupedProducts.length} productos sin agrupar, creando grupos individuales`);
    
    ungroupedProducts.forEach(productId => {
      const productRuleIds = productRules[productId] || [];
      if (productRuleIds.length > 0) {
        // Crear un grupo con la primera regla disponible
        finalGroups.push({
          products: [productId],
          rules: [productRuleIds[0]]
        });
      } else {
        console.error(`❌ El producto ${productId} no tiene reglas de envío disponibles`);
      }
    });
  }
  
  console.log(`✅ Grupos finales creados: ${finalGroups.length}`);
  
  return finalGroups;
};

/**
 * Construye una matriz de compatibilidad entre productos.
 * Dos productos son compatibles si comparten al menos una regla de envío.
 * 
 * @param {Array} products - Lista de IDs de productos
 * @param {Object} productRules - Mapa de producto a reglas de envío
 * @returns {Map} Matriz de compatibilidad (Map de productId -> Set de productIds compatibles)
 */
const buildCompatibilityMatrix = (products, productRules) => {
  console.log(`🔄 Construyendo matriz de compatibilidad para ${products.length} productos`);
  
  // Matriz de compatibilidad: productId -> Set de productIds compatibles
  const compatibilityMatrix = new Map();
  
  // Inicializar matriz
  products.forEach(productId => {
    compatibilityMatrix.set(productId, new Set());
  });
  
  // Llenar matriz verificando cada par de productos
  for (let i = 0; i < products.length; i++) {
    const productId1 = products[i];
    const rules1 = productRules[productId1] || [];
    
    for (let j = i + 1; j < products.length; j++) {
      const productId2 = products[j];
      const rules2 = productRules[productId2] || [];
      
      // Verificar si comparten alguna regla
      const hasSharedRule = rules1.some(rule => rules2.includes(rule));
      
      if (hasSharedRule) {
        // Son compatibles en ambas direcciones
        compatibilityMatrix.get(productId1).add(productId2);
        compatibilityMatrix.get(productId2).add(productId1);
      }
    }
  }
  
  // Un producto siempre es compatible consigo mismo
  products.forEach(productId => {
    compatibilityMatrix.get(productId).add(productId);
  });
  
  // Información para debug
  products.forEach(productId => {
    const compatibleCount = compatibilityMatrix.get(productId).size;
    console.log(`📊 Producto ${productId}: compatible con ${compatibleCount} productos`);
  });
  
  return compatibilityMatrix;
};

/**
 * Encuentra agrupaciones válidas de productos basadas en la matriz de compatibilidad.
 * 
 * @param {Array} products - Lista de IDs de productos
 * @param {Map} compatibilityMatrix - Matriz de compatibilidad
 * @param {Object} productRules - Mapa de producto a reglas de envío
 * @returns {Array} Grupos válidos de productos
 */
const findValidGroupings = (products, compatibilityMatrix, productRules) => {
  if (products.length === 0) return [];
  
  console.log(`🔍 Buscando agrupaciones válidas para ${products.length} productos`);
  
  // Estrategia: Intentar agrupar productos compatibles usando reglas compartidas
  const groups = [];
  const processedProducts = new Set();
  
  // Ordenar productos por el número de compatibles (menos compatibles primero)
  // Esto ayuda a procesar primero los productos más difíciles de agrupar
  const sortedProducts = [...products].sort((a, b) => {
    return compatibilityMatrix.get(a).size - compatibilityMatrix.get(b).size;
  });
  
  // Procesar cada producto
  for (const productId of sortedProducts) {
    if (processedProducts.has(productId)) continue;
    
    // Obtener productos compatibles con este
    const compatibleProducts = compatibilityMatrix.get(productId);
    
    // Filtrar los que aún no han sido procesados
    const availableCompatibles = [...compatibleProducts].filter(
      id => !processedProducts.has(id)
    );
    
    if (availableCompatibles.length === 0) {
      // Si no hay compatibles disponibles, el producto va solo
      groups.push({
        products: [productId],
        rules: productRules[productId] || []
      });
      processedProducts.add(productId);
      continue;
    }
    
    // Encontrar las reglas compartidas entre este producto y sus compatibles
    const productRuleIds = productRules[productId] || [];
    const sharedRuleIds = [];
    
    for (const ruleId of productRuleIds) {
      // Verificar si esta regla es compartida por todos los compatibles
      const allCompatiblesShareRule = availableCompatibles.every(
        compatibleId => (productRules[compatibleId] || []).includes(ruleId)
      );
      
      if (allCompatiblesShareRule) {
        sharedRuleIds.push(ruleId);
      }
    }
    
    // Si no hay reglas compartidas, el producto va solo
    if (sharedRuleIds.length === 0) {
      groups.push({
        products: [productId],
        rules: productRuleIds
      });
      processedProducts.add(productId);
      continue;
    }
    
    // Crear un grupo con todos los productos compatibles que comparten reglas
    const group = {
      products: [productId, ...availableCompatibles],
      rules: sharedRuleIds
    };
    
    groups.push(group);
    
    // Marcar todos estos productos como procesados
    processedProducts.add(productId);
    availableCompatibles.forEach(id => processedProducts.add(id));
  }
  
  console.log(`✅ Encontrados ${groups.length} grupos válidos`);
  return groups;
};

/**
 * Procesa los productos del carrito para calcular opciones de envío.
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} userAddress - Dirección del usuario (opcional)
 * @returns {Promise<Object>} Información de opciones de envío
 */
const processCartForShipping = async (cartItems, userAddress = null) => {
  console.log('🚚 Procesando carrito para opciones de envío:', { 
    productos: cartItems?.length || 0, 
    tieneUserAddress: !!userAddress,
    direccion: userAddress ? `${userAddress.street}, ${userAddress.city}, ${userAddress.zipcode || userAddress.zip}` : 'No disponible',
    codigoPostal: userAddress?.zipcode || userAddress?.zip || 'No disponible'
  });
  
  // Validar entrada
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    console.log('⚠️ Carrito vacío o inválido, no hay nada que procesar');
    return {
      groups: [],
      combinations: [],
      error: 'El carrito está vacío o tiene un formato inválido'
    };
  }
  
  // Guardar el código postal para validaciones posteriores
  const userZipCode = userAddress?.zipcode || userAddress?.zip;
  console.log(`📮 Código postal para validación: ${userZipCode || 'No disponible'}`);
  
  try {
    // Paso 1: Analizar los productos y sus reglas de envío
    let productRules, productDetails, ruleDetails;
    try {
      const result = await analyzeCartItems(cartItems, userAddress);
      productRules = result.productRules || {};
      productDetails = result.productDetails || {};
      ruleDetails = result.ruleDetails || {};
    } catch (analyzeError) {
      console.error('❌ Error al analizar productos del carrito:', analyzeError);
      return {
        groups: [],
        combinations: [],
        error: `Error al analizar productos: ${analyzeError.message}`,
        debug: { errorStack: analyzeError.stack }
      };
    }
    
    console.log(`✅ Análisis completado: ${Object.keys(productRules).length} productos, ${Object.keys(ruleDetails).length} reglas de envío`);
    
    // Verificación adicional: Si no hay reglas cargadas pero sí productos, algo salió mal
    if (Object.keys(productRules).length > 0 && Object.keys(ruleDetails).length === 0) {
      console.warn('⚠️ Se detectaron productos pero no se pudieron cargar reglas de envío');
      
      // Intentar cargar al menos una regla nacional predeterminada como respaldo
      try {
        const defaultNationalRuleId = "fyfkhfITejBjMASFCMZ2"; // ID de regla nacional por defecto
        const defaultRule = await fetchShippingRuleById(defaultNationalRuleId);
        
        if (defaultRule) {
          console.log('✅ Cargada regla nacional predeterminada como contingencia');
          
          // Crear grupos manuales con esta regla predeterminada
          ruleDetails[defaultNationalRuleId] = defaultRule;
          
          // Asignar esta regla a todos los productos
          Object.keys(productRules).forEach(productId => {
            productRules[productId] = [defaultNationalRuleId];
          });
        } else {
          // Si no se pudo cargar la regla predeterminada
          console.error('❌ No se pudo cargar la regla nacional predeterminada');
          return {
            groups: [],
            combinations: [],
            error: 'No se pudieron cargar reglas de envío. Configuración de envío incompleta.',
            debug: {
              productsCount: Object.keys(productRules).length,
              rulesCount: 0
            }
          };
        }
      } catch (error) {
        console.error('❌ Error al cargar regla predeterminada:', error);
        return {
          groups: [],
          combinations: [],
          error: 'No se pudieron cargar reglas de envío. Error en configuración de mensajería.',
          debug: { errorStack: error.stack }
        };
      }
    }
    
    // Paso 2: Encontrar agrupaciones óptimas de envío
    let shippingGroups = [];
    try {
      shippingGroups = findOptimalShippingGroups(productRules, ruleDetails, productDetails);
      console.log(`📦 Grupos de envío creados: ${shippingGroups.length}`);
    } catch (groupError) {
      console.error('❌ Error al encontrar grupos óptimos:', groupError);
      return {
        groups: [],
        combinations: [],
        error: `Error al agrupar productos: ${groupError.message}`,
        debug: { errorStack: groupError.stack }
      };
    }
    
    if (shippingGroups.length === 0) {
      console.warn('⚠️ No se encontraron grupos de envío válidos. Debug:', {
        productRulesCount: Object.keys(productRules).length,
        ruleDetailsCount: Object.keys(ruleDetails).length,
        productDetailsCount: Object.keys(productDetails).length,
        ruleIds: Object.keys(ruleDetails)
      });
      
      return {
        groups: [],
        combinations: [],
        error: 'No se pudieron determinar opciones de envío para estos productos',
        debug: {
          productRules,
          ruleDetails: Object.keys(ruleDetails),
          productDetails: Object.keys(productDetails)
        }
      };
    }
    
    // Paso 3: Calcular opciones de envío para cada grupo, validando el código postal
    let groupsWithOptions = [];
    try {
      groupsWithOptions = shippingGroups.map(group => {
        // Filtrar las reglas que aplican al código postal actual
        const validRulesForZipCode = group.rules.filter(ruleId => {
          const rule = ruleDetails[ruleId];
          
          // Si la regla no existe, no es válida
          if (!rule) return false;
          
          // Si no hay código postal del usuario, aceptar todas las reglas (condición de fallback)
          if (!userZipCode) return true;
          
          // Si es una regla nacional sin restricción de CP, es válida
          if (rule.es_nacional && !rule.codigos_postales_incluidos) return true;
          
          // Si tiene códigos postales específicos, verificar si el CP del usuario está incluido
          if (rule.codigos_postales_incluidos && Array.isArray(rule.codigos_postales_incluidos)) {
            return rule.codigos_postales_incluidos.includes(userZipCode);
          }
          
          // Por defecto, aceptar la regla
          return true;
        });
        
        console.log(`📦 Grupo: ${validRulesForZipCode.length} de ${group.rules.length} reglas válidas para CP ${userZipCode || 'N/A'}`);
        
        // Calcular opciones solo con las reglas que aplican para este código postal
        const filteredGroup = {
          ...group,
          rules: validRulesForZipCode
        };
        
        const options = calculateShippingOptionsForGroup(filteredGroup, productDetails, ruleDetails);
        
        return {
          id: uuidv4(),
          products: group.products.map(productId => productDetails[productId] || { id: productId }),
          rules: validRulesForZipCode.map(ruleId => ruleDetails[ruleId] || { id: ruleId }),
          shippingOptions: options
        };
      });
      
      console.log(`📊 Grupos con opciones: ${groupsWithOptions.length}`);
    } catch (optionsError) {
      console.error('❌ Error al calcular opciones de envío para grupos:', optionsError);
      return {
        groups: [],
        combinations: [],
        error: `Error al calcular opciones: ${optionsError.message}`,
        debug: { errorStack: optionsError.stack }
      };
    }
    
    // Verificar si algún grupo no tiene opciones de envío
    const groupsWithoutOptions = groupsWithOptions.filter(group => 
      !group.shippingOptions || group.shippingOptions.length === 0
    );
    
    if (groupsWithoutOptions.length > 0) {
      console.warn(`⚠️ Hay ${groupsWithoutOptions.length} grupos sin opciones de envío`);
    }
    
    // Paso 4: Generar todas las combinaciones posibles de opciones de envío
    let shippingCombinations = [];
    try {
      shippingCombinations = generateShippingCombinations(groupsWithOptions);
      console.log(`🔄 Combinaciones de envío generadas: ${shippingCombinations.length}`);
    } catch (combinationsError) {
      console.error('❌ Error al generar combinaciones de envío:', combinationsError);
      return {
        groups: groupsWithOptions,
        combinations: [],
        error: `Error al generar combinaciones: ${combinationsError.message}`,
        debug: { errorStack: combinationsError.stack }
      };
    }
    
    if (shippingCombinations.length === 0) {
      console.warn('⚠️ No se pudieron generar combinaciones de envío');
      
      // Información de debug
      console.log('Grupos con sus opciones:');
      groupsWithOptions.forEach(group => {
        console.log(`- Grupo con ${group.products.length} productos: ${group.shippingOptions?.length || 0} opciones`);
      });
      
      return {
        groups: groupsWithOptions,
        combinations: [],
        debug: {
          productRules,
          shippingGroups,
          ruleDetails: Object.keys(ruleDetails),
          groupsWithOptions: groupsWithOptions.map(g => ({
            id: g.id,
            products: g.products.length,
            rules: g.rules.length,
            options: g.shippingOptions?.length || 0
          }))
        },
        error: 'No se pudieron determinar combinaciones de envío para estos productos'
      };
    }
    
    // Ordenar combinaciones por precio (menor a mayor)
    const sortedCombinations = shippingCombinations.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
    
    return {
      groups: groupsWithOptions,
      combinations: sortedCombinations,
      error: null
    };
  } catch (error) {
    console.error('❌ Error procesando carrito para envío:', error);
    return {
      groups: [],
      combinations: [],
      error: error.message,
      debug: { errorStack: error.stack }
    };
  }
};

/**
 * Genera todas las combinaciones posibles de opciones de envío para los grupos.
 * @param {Array} groups - Grupos de envío con sus opciones
 * @returns {Array} Combinaciones de opciones de envío
 */
const generateShippingCombinations = (groups) => {
  if (!groups || groups.length === 0) {
    console.warn('⚠️ No hay grupos para generar combinaciones');
    return [];
  }
  
  console.log(`🔄 Generando combinaciones para ${groups.length} grupos`);
  
  // Función auxiliar recursiva para generar combinaciones
  const generateCombinations = (currentIndex, currentSelections) => {
    // Si hemos procesado todos los grupos, tenemos una combinación completa
    if (currentIndex >= groups.length) {
      console.log(`✅ Combinación creada con ${currentSelections.length} grupos`);
      
      // Calcular precio total
      let totalPrice = 0;
      let description = '';
      let isAllFree = true;
      
      currentSelections.forEach(selection => {
        totalPrice += selection.option.price;
        description += `${selection.option.name} ($${selection.option.price}), `;
        if (!selection.option.isFreeShipping) {
          isAllFree = false;
        }
      });
      
      // Eliminar la última coma
      if (description.endsWith(', ')) {
        description = description.slice(0, -2);
      }
      
      return [{
        id: uuidv4(),
        selections: currentSelections,
        totalPrice,
        description,
        isAllFree
      }];
    }
    
    const currentGroup = groups[currentIndex];
    
    // Si el grupo no tiene opciones, este es un caso extremo que no debería ocurrir
    // Pero lo manejamos creando una opción predeterminada
    if (!currentGroup.shippingOptions || currentGroup.shippingOptions.length === 0) {
      console.warn(`⚠️ Grupo ${currentIndex} no tiene opciones de envío, creando predeterminada`);
      
      const defaultOption = {
        optionId: uuidv4(),
        ruleId: currentGroup.rules[0]?.id || 'default',
        name: 'Envío Estándar',
        price: 200,
        originalPrice: 200,
        estimatedDelivery: '3-5 días',
        isFreeShipping: false,
        zoneName: 'Nacional'
      };
      
      // Agregar la opción predeterminada y continuar
      currentGroup.shippingOptions = [defaultOption];
    }
    
    // Generar todas las combinaciones posibles con este grupo
    const combinations = [];
    
    for (const option of currentGroup.shippingOptions) {
      // Crear selección para esta opción
      const selection = {
        groupId: currentGroup.id,
        option,
        products: currentGroup.products
      };
      
      // Agregar esta selección a las actuales y continuar recursivamente
      const nextSelections = [...currentSelections, selection];
      const nextCombinations = generateCombinations(currentIndex + 1, nextSelections);
      
      combinations.push(...nextCombinations);
    }
    
    return combinations;
  };
  
  // Comenzar la generación de combinaciones con el primer grupo
  const combinations = generateCombinations(0, []);
  
  console.log(`✅ Generadas ${combinations.length} combinaciones totales`);
  return combinations;
};

export {
  processCartForShipping,
  generateShippingCombinations
}; 