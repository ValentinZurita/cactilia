/**
 * Utilidades adicionales para el manejo de envíos
 */

/**
 * Verifica si una regla de envío aplica para una dirección específica
 * @param {Object} rule - Regla de envío
 * @param {Object} address - Dirección del usuario
 * @returns {boolean} Si la regla aplica o no
 */
export const isRuleValidForAddress = (rule, address) => {
  if (!rule || !address) return false;

  // Obtener código postal de la dirección
  const zipCode = address.zipCode || address.postalCode;
  if (!zipCode) return false;

  // Si la regla no tiene códigos postales, se asume nacional
  if (!rule.zipcodes || rule.zipcodes.length === 0) {
    return true;
  }

  // Si la regla incluye cobertura nacional
  if (rule.zipcodes.includes('nacional')) {
    return true;
  }

  // Si la regla incluye el código postal específico
  if (rule.zipcodes.includes(zipCode)) {
    return true;
  }

  // Verificar si la regla incluye el estado
  const stateCode = address.state;
  if (stateCode && rule.zipcodes.some(z => z.startsWith(`estado_${stateCode}`))) {
    return true;
  }

  // Verificar rangos de códigos postales
  if (rule.zipcodes.some(zipCodeRange => {
    if (zipCodeRange.includes('-')) {
      const [start, end] = zipCodeRange.split('-');
      const zipNum = parseInt(zipCode);
      const startNum = parseInt(start);
      const endNum = parseInt(end);

      return !isNaN(zipNum) && !isNaN(startNum) && !isNaN(endNum) &&
        zipNum >= startNum && zipNum <= endNum;
    }
    return false;
  })) {
    return true;
  }

  return false;
};

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