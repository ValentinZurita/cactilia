/**
 * Utilidad para determinar qué regla de envío aplicar cuando hay múltiples reglas
 * que podrían aplicar a un código postal específico
 */

// Lista de prefijos de códigos postales por estado
export const PREFIJOS_ESTADOS = {
  'AGU': ['20'], // Aguascalientes
  'BCN': ['21', '22'], // Baja California Norte
  'BCS': ['23'], // Baja California Sur
  'CAM': ['24'], // Campeche
  'CHP': ['29', '30'], // Chiapas
  'CHH': ['31', '32', '33'], // Chihuahua
  'CMX': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16'], // Ciudad de México
  'COA': ['25', '26', '27'], // Coahuila
  'COL': ['28'], // Colima
  'DUR': ['34', '35'], // Durango
  'GUA': ['36', '37', '38'], // Guanajuato
  'GRO': ['39', '40', '41'], // Guerrero
  'HID': ['42', '43'], // Hidalgo
  'JAL': ['44', '45', '46', '47', '48', '49'], // Jalisco
  'MEX': ['50', '51', '52', '53', '54', '55', '56', '57'], // Estado de México
  'MIC': ['58', '59', '60'], // Michoacán
  'MOR': ['62'], // Morelos
  'NAY': ['63'], // Nayarit
  'NLE': ['64', '65', '66', '67'], // Nuevo León
  'OAX': ['68', '69', '70', '71'], // Oaxaca
  'PUE': ['72', '73', '74', '75'], // Puebla
  'QUE': ['76'], // Querétaro
  'ROO': ['77'], // Quintana Roo
  'SLP': ['78', '79'], // San Luis Potosí
  'SIN': ['80', '81', '82'], // Sinaloa
  'SON': ['83', '84', '85'], // Sonora
  'TAB': ['86'], // Tabasco
  'TAM': ['87', '88', '89'], // Tamaulipas
  'TLA': ['90'], // Tlaxcala
  'VER': ['91', '92', '93', '94', '95', '96'], // Veracruz
  'YUC': ['97'], // Yucatán
  'ZAC': ['98', '99'] // Zacatecas
};

/**
 * Obtiene el código de estado a partir de un código postal
 * @param {string} zipCode - Código postal (5 dígitos)
 * @returns {string|null} - Código del estado o null si no se encuentra
 */
export const getEstadoFromZipCode = (zipCode) => {
  if (!zipCode || zipCode.length < 2) return null;
  
  const prefix = zipCode.substring(0, 2);
  
  for (const [estado, prefijos] of Object.entries(PREFIJOS_ESTADOS)) {
    if (prefijos.includes(prefix)) {
      return estado;
    }
  }
  
  return null;
};

/**
 * Determina si un código postal pertenece a un estado específico
 * @param {string} zipCode - Código postal a verificar
 * @param {string} estadoCode - Código del estado (ej: 'PUE' para Puebla)
 * @returns {boolean} - True si el código postal pertenece al estado
 */
export const zipCodeBelongsToState = (zipCode, estadoCode) => {
  if (!zipCode || zipCode.length < 2 || !estadoCode) return false;
  
  const prefix = zipCode.substring(0, 2);
  const prefijos = PREFIJOS_ESTADOS[estadoCode];
  
  return prefijos && prefijos.includes(prefix);
};

/**
 * Encuentra la regla de envío más específica para un código postal dado
 * Prioridad: zipcode exacto > estado > nacional
 * 
 * @param {string} zipCode - Código postal del cliente (5 dígitos)
 * @param {Array} rules - Array de reglas de envío disponibles
 * @returns {Object|null} - La regla de envío más específica o null si no hay regla aplicable
 */
export const findMostSpecificRule = (zipCode, rules) => {
  if (!zipCode || !rules || !Array.isArray(rules) || rules.length === 0) {
    return null;
  }
  
  // Extraer el código de estado del código postal del cliente
  const clienteEstado = getEstadoFromZipCode(zipCode);
  
  // Filtrar reglas activas
  const activeRules = rules.filter(rule => rule.activo !== false);
  
  // 1. Buscar coincidencia exacta de código postal
  const exactMatch = activeRules.find(rule => 
    rule.zipcodes && rule.zipcodes.includes(zipCode)
  );
  
  if (exactMatch) return exactMatch;
  
  // 2. Buscar coincidencia por estado
  if (clienteEstado) {
    const stateMatch = activeRules.find(rule => 
      rule.zipcodes && rule.zipcodes.some(code => code === `estado_${clienteEstado}`)
    );
    
    if (stateMatch) return stateMatch;
  }
  
  // 3. Buscar regla nacional
  const nationalRule = activeRules.find(rule => 
    rule.zipcodes && rule.zipcodes.includes('nacional')
  );
  
  return nationalRule || null;
};

/**
 * Valida que no haya configuraciones duplicadas en una regla de envío
 * @param {Object} rule - Regla de envío a validar
 * @param {Array} existingRules - Reglas de envío existentes
 * @returns {Object} - { valid: boolean, message: string }
 */
export const validateShippingRule = (rule, existingRules) => {
  if (!rule.zipcodes || rule.zipcodes.length === 0) {
    return { valid: false, message: 'Debe definir al menos un código postal o área de cobertura' };
  }
  
  // Si la regla incluye 'nacional', no debería incluir otros códigos
  if (rule.zipcodes.includes('nacional') && rule.zipcodes.length > 1) {
    return { 
      valid: false, 
      message: 'Si selecciona cobertura nacional, no debe incluir otros códigos o estados'
    };
  }
  
  // Revisar si hay estados duplicados
  const estados = rule.zipcodes
    .filter(code => code.startsWith('estado_'))
    .map(code => code.replace('estado_', ''));
    
  if (new Set(estados).size !== estados.length) {
    return { valid: false, message: 'Hay estados duplicados en la configuración' };
  }
  
  // Revisar si hay códigos postales específicos que ya están cubiertos por estados en la misma regla
  const specificZipCodes = rule.zipcodes.filter(code => /^\d{5}$/.test(code));
  
  for (const zipCode of specificZipCodes) {
    const estado = getEstadoFromZipCode(zipCode);
    if (estado && estados.includes(estado)) {
      return { 
        valid: false, 
        message: `El código postal ${zipCode} ya está incluido en el estado ${estado}`
      };
    }
  }

  // La validación pasó todas las pruebas
  return { valid: true };
}; 