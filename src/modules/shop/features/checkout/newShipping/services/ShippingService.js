import { collection, getDocs, query, where } from 'firebase/firestore';
import { FirebaseDB } from '../../../../../../config/firebase/firebaseConfig';

/**
 * Obtiene todas las zonas de envío activas desde Firebase
 */
export const getActiveShippingZones = async () => {
  try {
    const shippingZonesRef = collection(FirebaseDB, 'zonas_envio');
    const q = query(shippingZonesRef, where('activo', '==', true));
    const querySnapshot = await getDocs(q);
    
    const zones = [];
    querySnapshot.forEach(doc => {
      zones.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return zones;
  } catch (error) {
    console.error('Error al obtener zonas de envío:', error);
    return [];
  }
};

/**
 * Determina si una zona de envío es válida para una dirección
 */
export const isZoneValidForAddress = (zone, address) => {
  if (!zone || !address) return false;

  // Si la dirección no tiene código postal o estado, no podemos validar
  if (!address.zip && !address.state) return false;
  
  // Normalizar el código de estado para comparaciones
  const addressState = (address.state || '').toUpperCase();
  
  // Verificar si la zona es para este estado específicamente
  if (zone.zipcode && zone.zipcode.startsWith('estado_')) {
    const zoneState = zone.zipcode.replace('estado_', '').toUpperCase();
    if (zoneState === addressState) return true;
  }
  
  // Comprobar si coincide con alguno de los zipcodes de la zona
  if (zone.zipcodes && Array.isArray(zone.zipcodes)) {
    // Comprobar si algún zipcode de la zona coincide con el estado
    for (const zipcode of zone.zipcodes) {
      if (zipcode.startsWith('estado_')) {
        const zoneState = zipcode.replace('estado_', '').toUpperCase();
        if (zoneState === addressState) return true;
      } else if (address.zip && zipcode === address.zip) {
        // Comprobar si el código postal coincide directamente
        return true;
      }
    }
  }

  // Para compatibilidad, también verificar si el nombre de zona coincide con el estado
  if (zone.zona && addressState.includes(zone.zona.toUpperCase())) return true;
  
  // Verificar si es una zona global (sin restricciones de ubicación)
  // La zona es global si no tiene restricciones de zipcodes específicos o estados
  if ((zone.zipcodes && zone.zipcodes.length === 0) || 
      (!zone.zipcode && (!zone.zipcodes || zone.zipcodes.length === 0))) {
    return true;
  }

  return false;
};

/**
 * Calcula detalles de envío en base a la zona y los productos
 */
export const calculateShippingDetails = (zone, products) => {
  if (!zone || !products || products.length === 0) {
    return null;
  }

  // Obtener valores desde la zona
  const result = {
    cost: parseFloat(zone.precio_base || 0),
    minDays: null,
    maxDays: null,
    isFree: Boolean(zone.envio_gratis),
    carrierId: null,
    carrierName: null,
    deliveryTime: null
  };

  // Calcular subtotal para verificar envío gratis por monto mínimo
  const subtotal = products.reduce((sum, item) => {
    const product = item.product || item;
    const price = parseFloat(product.price || 0);
    const quantity = parseInt(item.quantity || 1, 10);
    return sum + (price * quantity);
  }, 0);

  // Verificar envío gratis por monto mínimo
  if (zone.envio_gratis_monto_minimo) {
    const minAmount = parseFloat(zone.envio_gratis_monto_minimo);
    if (minAmount > 0 && subtotal >= minAmount) {
      result.isFree = true;
    }
  }

  // Calcular peso total
  const totalWeight = products.reduce((sum, item) => {
    const product = item.product || item;
    const weight = parseFloat(product.weight || 0);
    const quantity = parseInt(item.quantity || 1, 10);
    return sum + (weight * quantity);
  }, 0);

  // Si hay opciones de mensajería, usar la más económica
  if (zone.opciones_mensajeria && Array.isArray(zone.opciones_mensajeria) && zone.opciones_mensajeria.length > 0) {
    // Ordenar opciones por precio para obtener la más económica
    const sortedOptions = [...zone.opciones_mensajeria].sort((a, b) => {
      const priceA = parseFloat(a.precio || 0);
      const priceB = parseFloat(b.precio || 0);
      return priceA - priceB;
    });

    const bestOption = sortedOptions[0];
    
    // Actualizar detalles con la opción seleccionada
    result.cost = parseFloat(bestOption.precio || 0);
    result.minDays = parseInt(bestOption.minDays || 0, 10);
    result.maxDays = parseInt(bestOption.maxDays || 0, 10);
    result.carrierId = bestOption.id;
    result.carrierName = bestOption.nombre;
    result.deliveryTime = bestOption.tiempo_entrega;

    // Si hay configuración de paquetes, aplicar lógica de cálculo
    if (bestOption.configuracion_paquetes) {
      const config = bestOption.configuracion_paquetes;
      
      // Calcular costo adicional según peso
      if (config.costo_por_kg_extra && config.peso_maximo_paquete && totalWeight > config.peso_maximo_paquete) {
        const extraWeight = totalWeight - config.peso_maximo_paquete;
        const extraCost = parseFloat(config.costo_por_kg_extra) * extraWeight;
        result.cost += extraCost;
      }
    }
  }

  // Si el envío es gratuito, el costo es cero
  if (result.isFree) {
    result.cost = 0;
  }

  return result;
};

/**
 * Encuentra las mejores opciones de envío para un carrito
 */
export const findBestShippingOptions = async (cartItems, address) => {
  if (!cartItems?.length || !address) {
    return { success: false, error: "Faltan datos requeridos" };
  }

  try {
    // Obtener todas las zonas de envío activas
    const shippingZones = await getActiveShippingZones();
    
    console.log(`📦 Encontradas ${shippingZones.length} zonas de envío activas`);
    
    if (!shippingZones.length) {
      return { success: false, error: "No hay zonas de envío disponibles" };
    }

    // Obtener zonas válidas para esta dirección
    const validZones = shippingZones.filter(zone => isZoneValidForAddress(zone, address));
    
    console.log(`🏠 Encontradas ${validZones.length} zonas válidas para la dirección`);
    if (validZones.length > 0) {
      console.log('Zonas válidas:', validZones.map(z => ({ 
        id: z.id, 
        nombre: z.zona, 
        zipcode: z.zipcode, 
        zipcodes: z.zipcodes 
      })));
    } else {
      console.log('Información de todas las zonas:', shippingZones.map(z => ({ 
        id: z.id, 
        nombre: z.zona, 
        zipcode: z.zipcode, 
        zipcodes: z.zipcodes 
      })));
      console.log('Dirección usada para validación:', {
        estado: address.state, 
        cp: address.zip, 
        ciudad: address.city
      });
    }
    
    if (!validZones.length) {
      return { success: false, error: "No hay zonas de envío disponibles para esta dirección" };
    }

    // Paso 1: Verificar qué productos tienen reglas de envío asignadas
    const productsWithoutRules = cartItems.filter(item => {
      const product = item.product || item;
      return !product.shippingRuleId && (!product.shippingRuleIds || !product.shippingRuleIds.length);
    });

    if (productsWithoutRules.length > 0) {
      const productNames = productsWithoutRules.map(item => (item.product || item).name || 'Producto').join(', ');
      return { 
        success: false, 
        error: `Algunos productos no tienen reglas de envío: ${productNames}` 
      };
    }

    // Paso 2: Agrupar productos por zona de envío
    const productGroups = {};
    
    // Para cada producto, intentar asignar a una zona
    for (const item of cartItems) {
      const product = item.product || item;
      const shippingRuleIds = product.shippingRuleIds || (product.shippingRuleId ? [product.shippingRuleId] : []);
      
      // Encontrar la zona más económica para este producto
      let bestZone = null;
      let lowestCost = Infinity;

      for (const zone of validZones) {
        // Solo zonas que sean parte de las reglas de este producto
        if (shippingRuleIds.includes(zone.id)) {
          const details = calculateShippingDetails(zone, [item]);
          
          if (details && (details.isFree || details.cost < lowestCost)) {
            bestZone = zone;
            lowestCost = details.isFree ? 0 : details.cost;
          }
        }
      }

      if (!bestZone) {
        return { 
          success: false, 
          error: `No hay opciones de envío disponibles para ${product.name || 'un producto'}`
        };
      }

      // Agregar producto al grupo de esta zona
      if (!productGroups[bestZone.id]) {
        productGroups[bestZone.id] = {
          zoneId: bestZone.id,
          zone: bestZone,
          products: []
        };
      }
      
      productGroups[bestZone.id].products.push(item);
    }

    // Paso 3: Calcular detalles de envío para cada grupo
    const options = [];
    
    for (const groupId in productGroups) {
      const group = productGroups[groupId];
      const details = calculateShippingDetails(group.zone, group.products);
      
      if (!details) continue;
      
      options.push({
        id: `shipping-${group.zoneId}-${Date.now()}`,
        name: group.zone.zona || 'Envío',
        price: details.cost,
        isFree: details.isFree,
        products: group.products.map(item => (item.product || item).id),
        deliveryTime: details.deliveryTime || `${details.minDays || ''}-${details.maxDays || ''} días`,
        minDays: details.minDays,
        maxDays: details.maxDays,
        carrierName: details.carrierName,
        zoneId: group.zoneId,
        zoneName: group.zone.zona
      });
    }

    // Ordenar opciones: gratis primero, luego por precio
    options.sort((a, b) => {
      if (a.isFree && !b.isFree) return -1;
      if (!a.isFree && b.isFree) return 1;
      return a.price - b.price;
    });

    return {
      success: true,
      options
    };
  } catch (error) {
    console.error('Error al calcular opciones de envío:', error);
    return { success: false, error: error.message || "Error al calcular envío" };
  }
};

/**
 * Obtiene y procesa opciones de envío para un carrito y dirección
 */
export const getShippingOptions = async (cartItems, userAddress) => {
  try {
    // Normalizar dirección para búsqueda
    const address = {
      ...userAddress,
      zip: userAddress.zip || userAddress.postalCode || userAddress.zipcode || userAddress.zip_code || '',
      state: userAddress.state || userAddress.provincia || userAddress.estado || userAddress.region || '',
      city: userAddress.city || userAddress.ciudad || userAddress.localidad || userAddress.municipio || '',
      country: userAddress.country || userAddress.pais || 'México'
    };
    
    // Imprimir la información de dirección para diagnóstico
    console.log('🔍 Buscando opciones de envío para dirección:', {
      estado: address.state,
      cp: address.zip, 
      ciudad: address.city
    });

    // Normalizar items del carrito
    const items = cartItems.map(item => {
      const product = item.product || item;
      return {
        ...item,
        product: { ...product }
      };
    });

    // Obtener opciones
    const result = await findBestShippingOptions(items, address);
    
    if (!result.success) {
      console.warn(`Error al obtener opciones de envío: ${result.error}`);
      return [];
    }
    
    return result.options || [];
  } catch (error) {
    console.error('Error en servicio de envío:', error);
    return [];
  }
}; 