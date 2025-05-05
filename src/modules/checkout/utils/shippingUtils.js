/**
 * Utilidades adicionales para el manejo de envíos
 */

/**
 * Calcula el subtotal de un grupo de productos
 * @param {Array} items - Productos en el grupo
 * @returns {number} Subtotal
 */
export const calculateGroupSubtotal = (items) => {
  return items.reduce((total, item) => {
    const product = item.product || item;
    const price = parseFloat(product.price || 0);
    const quantity = parseInt(item.quantity || 1);
    return total + (price * quantity);
  }, 0);
};

/**
 * Calcula el peso total de un grupo de productos
 * @param {Array} items - Productos en el grupo
 * @returns {number} Peso total en kg
 */
export const calculateGroupWeight = (items) => {
  return items.reduce((total, item) => {
    const product = item.product || item;
    const weight = parseFloat(product.weight || 1); // Peso por defecto: 1kg
    const quantity = parseInt(item.quantity || 1);
    return total + (weight * quantity);
  }, 0);
};

/**
 * Formatea el costo de envío para visualización
 * @param {number} cost - Costo de envío
 * @param {boolean} isFree - Si el envío es gratuito
 * @returns {string} Costo formateado
 */
export const formatShippingCost = (cost, isFree = false) => {
  if (isFree || cost === 0) {
    return 'Gratis';
  }

  return `$${cost.toFixed(2)}`;
};

/**
 * Verifica si una opción de envío es gratuita (precio es 0)
 * @param {Object} option - La opción de envío
 * @returns {boolean} - True si el envío es gratis
 */
export const isFreeShipping = (option) => {
  // Considera gratis si el precio es 0 o explícitamente marcado (si hubiera un campo así)
  return option?.price === 0;
};

/**
 * Obtiene un nombre legible para una opción de envío.
 * @param {Object} option - La opción de envío.
 * @returns {string} - El nombre a mostrar.
 */
export const getDisplayName = (option) => {
  if (!option) return 'Opción inválida';
  // Prioritize specific fields, fallback to generic names
  return option.name || option.label || option.service_name || option.carrier || 'Opción de Envío';
};

/**
 * Calcula o extrae el tiempo de entrega estimado de una opción de envío.
 * @param {Object} option - La opción de envío.
 * @returns {string} - El tiempo de entrega estimado o un texto por defecto.
 */
export const calculateDeliveryTime = (option) => {
  if (!option) return 'Tiempo no disponible';
  // Busca en varios campos posibles donde podría estar el tiempo de entrega
  const time = option.tiempo_entrega || option.delivery_time || option.estimatedDelivery || option.deliveryTime;
  return time || 'Tiempo estimado no disponible';
};

/**
 * Crea una regla de envío por defecto
 * @param {string} id - ID opcional para la regla
 * @returns {Object} Regla de envío por defecto
 */
export const createDefaultShippingRule = (id = 'default-rule') => {
  return {
    id,
    zona: 'Envío estándar',
    activo: true,
    zipcodes: ['nacional'],
    opciones_mensajeria: [{
      nombre: 'Estándar',
      precio: 150,
      tiempo_entrega: '3-5 días',
      configuracion_paquetes: {
        peso_maximo_paquete: 20,
        costo_por_kg_extra: 10,
        maximo_productos_por_paquete: 10
      }
    }]
  };
};

/**
 * Obtiene el código de estado desde un código postal
 * Simplificación: para una implementación real, se requeriría una base de datos
 * completa de códigos postales
 *
 * @param {string} zipCode - Código postal
 * @returns {string} Código del estado (o null si no se pudo determinar)
 */
export const getStateFromZipCode = (zipCode) => {
  if (!zipCode || typeof zipCode !== 'string') return null;

  // Simplificación: primeros dígitos como indicación del estado
  // En una implementación real se requeriría una tabla de búsqueda completa
  const prefix = zipCode.substring(0, 2);

  const stateMap = {
    '01': 'AGU', // Aguascalientes
    '02': 'BCN', // Baja California
    '03': 'BCS', // Baja California Sur
    '04': 'CAM', // Campeche
    '05': 'CHP', // Chiapas
    '06': 'CHH', // Chihuahua
    '07': 'CMX', // Ciudad de México
    '08': 'COA', // Coahuila
    '09': 'COL', // Colima
    '10': 'DUR', // Durango
    '11': 'GUA', // Guanajuato
    '12': 'GRO', // Guerrero
    '13': 'HID', // Hidalgo
    '14': 'JAL', // Jalisco
    '15': 'MEX', // Estado de México
    '16': 'MIC', // Michoacán
    '17': 'MOR', // Morelos
    '18': 'NAY', // Nayarit
    '19': 'NLE', // Nuevo León
    '20': 'OAX', // Oaxaca
    '21': 'PUE', // Puebla
    '22': 'QUE', // Querétaro
    '23': 'ROO', // Quintana Roo
    '24': 'SLP', // San Luis Potosí
    '25': 'SIN', // Sinaloa
    '26': 'SON', // Sonora
    '27': 'TAB', // Tabasco
    '28': 'TAM', // Tamaulipas
    '29': 'TLA', // Tlaxcala
    '30': 'VER', // Veracruz
    '31': 'YUC', // Yucatán
    '32': 'ZAC', // Zacatecas
  };

  return stateMap[prefix] || null;
};

// ¿Deberíamos importar estas constantes de shippingConstants.js o definirlas aquí?
// Por ahora, las definimos localmente como fallback, asumiendo que ShippingConstants2.js no existe o no es accesible
const SHIPPING_TYPES = {
  EXPRESS: 'express',
  LOCAL: 'local',
  NATIONAL: 'national',
  INTERNATIONAL: 'international',
  STANDARD: 'standard',
};
const GROUP_PRIORITIES = {
  express: 10,
  local: 20,
  national: 30,
  international: 40,
  standard: 50,
};
const EXPRESS_TERMS = ['express', 'rápido', 'urgente', '24h'];
const LOCAL_TERMS = ['local', 'ciudad', 'pickup', 'recogida'];
const NATIONAL_TERMS = ['nacional', 'estándar', 'normal'];

/**
 * Identifica el tipo de envío basado en el nombre y descripción
 * (Función auxiliar para calculateShippingOptionsGroups)
 * @param {string} name - Nombre de la opción de envío
 * @param {string} description - Descripción de la opción
 * @returns {string} - Tipo identificado
 */
const identifyShippingType = (name, description) => {
  // Convert to lowercase string for comparison
  const searchText = `${name || ''} ${description || ''}`.toLowerCase();

  // Check for express terms
  if (EXPRESS_TERMS.some(term => searchText.includes(term))) {
    return SHIPPING_TYPES.EXPRESS;
  }
  // Check for local terms
  if (LOCAL_TERMS.some(term => searchText.includes(term))) {
    return SHIPPING_TYPES.LOCAL;
  }
  // Check for national terms
  if (NATIONAL_TERMS.some(term => searchText.includes(term))) {
    return SHIPPING_TYPES.NATIONAL;
  }
  // Si incluye gratis, podría ser local o un tipo especial
  if (searchText.includes('gratis') || searchText.includes('free')) {
    // Podríamos necesitar más lógica aquí, por ahora asumimos LOCAL si es gratis y no express/national
    return SHIPPING_TYPES.LOCAL; 
  }
  // Default to standard
  // En el código original de Greedy, usamos option.zoneType o option.isNational,
  // esta función identifyShippingType parece ser una alternativa basada en texto.
  // Podríamos necesitar refinarla o usar la lógica de Greedy directamente si es más fiable.
  return SHIPPING_TYPES.STANDARD; // O NATIONAL como fallback?
}

/**
 * Agrupa las opciones de envío por tipo (e.g., Standard, Express).
 * @param {Array} options - Opciones de envío a agrupar (salida de calculateGreedyShippingOptions)
 * @returns {Object} - Opciones agrupadas por tipo: { tipo: [opciones] }
 */
export const calculateShippingOptionsGroups = (options) => {
  if (!options || !Array.isArray(options) || options.length === 0) {
    console.warn('⚠️ No hay opciones de envío para agrupar');
    return [];
  }

  console.log('🚚 Agrupando opciones de envío:', options.length);

  try {
    // Map options by type (express, local, national)
    const typeMap = {};

    options.forEach(option => {
      // Usar el zoneType calculado por Greedy si existe, sino identificar por texto
      const type = option.zoneType || identifyShippingType(option.name, option.description);

      if (!typeMap[type]) {
        typeMap[type] = [];
      }
      typeMap[type].push(option);
    });

    // Sort options in each group by price, free options first
    Object.keys(typeMap).forEach(type => {
      typeMap[type].sort((a, b) => {
        const isAFree = a.isFree || a.price === 0;
        const isBFree = b.isFree || b.price === 0;
        if (isAFree && !isBFree) return -1;
        if (!isAFree && isBFree) return 1;
        return (a.price || 0) - (b.price || 0); // Sort by price (lowest first)
      });
    });

    // Convert map to array of groups
    const groups = Object.keys(typeMap).map(type => ({
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1), // Poner primera letra en mayúscula como label simple
      priority: GROUP_PRIORITIES[type] || 100, // Usar prioridad definida
      options: typeMap[type],
    }));

    // Sort groups by priority
    groups.sort((a, b) => a.priority - b.priority);

    console.log('✅ Grupos de envío calculados:', groups.length);
    return groups;

  } catch (error) {
    console.error('❌ Error al agrupar opciones de envío:', error);
    // Fallback: devolver un solo grupo con todas las opciones
    return [{
      type: 'all',
      label: 'Todas las opciones',
      priority: 1,
      options: [...options].sort((a,b) => (a.price || 0) - (b.price || 0)), // Ordenar por precio al menos
    }];
  }
}