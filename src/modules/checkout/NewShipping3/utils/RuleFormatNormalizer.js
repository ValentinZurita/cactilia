/**
 * RuleFormatNormalizer.js
 * 
 * Convierte reglas de envío al formato esperado por el algoritmo Greedy
 * Solución permanente para la discrepancia de formatos entre nuestro sistema y el algoritmo
 */
import { STATE_PREFIX, NATIONAL_KEYWORD, COVERAGE_TYPES } from '../constants';

/**
 * Normaliza una regla de envío al formato esperado por el algoritmo Greedy
 * @param {Object} rule - Regla en formato original
 * @param {Object} address - Dirección del usuario (opcional, para normalización contextual)
 * @returns {Object} - Regla normalizada al formato Greedy
 */
export const normalizeShippingRule = (rule, address = null) => {
  if (!rule) return null;
  
  console.log(`🔄 Normalizando regla: ID=${rule.id}, zipcode=${rule.zipcode}, zona=${rule.zona}`);
  
  // Preservar tiempos de entrega para debugging
  if (rule.tiempo_minimo !== undefined || rule.min_days !== undefined || rule.minDays !== undefined) {
    console.log(`ℹ️ Regla ${rule.id} tiene tiempos de entrega: min=${rule.tiempo_minimo || rule.min_days || rule.minDays}, max=${rule.tiempo_maximo || rule.max_days || rule.maxDays}`);
  }
  
  // Verificar si las opciones de mensajería tienen tiempos de entrega
  if (Array.isArray(rule.opciones_mensajeria) && rule.opciones_mensajeria.length > 0) {
    console.log(`ℹ️ Regla ${rule.id} tiene ${rule.opciones_mensajeria.length} opciones de mensajería`);
    
    rule.opciones_mensajeria.forEach((opcion, idx) => {
      if (opcion.minDays !== undefined || opcion.min_days !== undefined || opcion.tiempo_minimo !== undefined) {
        console.log(`ℹ️ Opción de mensajería #${idx+1} tiene tiempos: min=${opcion.minDays || opcion.min_days || opcion.tiempo_minimo}, max=${opcion.maxDays || opcion.max_days || opcion.tiempo_maximo}`);
      }
      if (opcion.tiempo_entrega) {
        console.log(`ℹ️ Opción de mensajería #${idx+1} tiene tiempo_entrega: "${opcion.tiempo_entrega}"`);
      }
    });
  }
  
  // Crear una copia profunda para no modificar el original
  const newRule = JSON.parse(JSON.stringify(rule));
  
  // Asegurar que los tiempos de entrega se preserven en todas sus formas
  // Este paso es crucial para evitar perder datos durante la normalización
  if (rule.tiempo_minimo !== undefined) newRule.tiempo_minimo = rule.tiempo_minimo;
  if (rule.tiempo_maximo !== undefined) newRule.tiempo_maximo = rule.tiempo_maximo;
  if (rule.min_days !== undefined) newRule.min_days = rule.min_days;
  if (rule.max_days !== undefined) newRule.max_days = rule.max_days;
  if (rule.minDays !== undefined) newRule.minDays = rule.minDays;
  if (rule.maxDays !== undefined) newRule.maxDays = rule.maxDays;
  
  // Verificar si hay opciones de mensajería y preservarlas intactas
  if (Array.isArray(rule.opciones_mensajeria) && rule.opciones_mensajeria.length > 0) {
    // Asegurar que opciones_mensajeria se preserve exactamente igual
    newRule.opciones_mensajeria = JSON.parse(JSON.stringify(rule.opciones_mensajeria));
  }
  
  // Si ya tiene coverage_type definido, mantenerlo
  if (newRule.coverage_type || newRule.tipo_cobertura) {
    console.log(`ℹ️ Regla ${rule.id} ya tiene tipo de cobertura: ${newRule.coverage_type || newRule.tipo_cobertura}`);
    return newRule;
  }
  
  // Obtener estado normalizado de la dirección si está disponible
  const state = address ? (address.state || address.provincia || '').toString().toLowerCase().trim() : '';
  
  // Normalizar regla basada en sus propiedades
  
  // CASO 1: Regla de cobertura nacional
  if (rule.zona === 'Nacional' || rule.zipcode === NATIONAL_KEYWORD || (rule.zipcodes && rule.zipcodes.includes(NATIONAL_KEYWORD))) {
    // Para reglas nacionales, simplemente usar el tipo 'nacional'
    // El algoritmo isRuleValidForAddress hace un return true directo para este tipo
    newRule.coverage_type = 'nacional';
    newRule.tipo_cobertura = 'nacional';
    console.log(`✅ Normalizada regla nacional ${rule.id}`);
    return newRule;
  }
  
  // CASO 2: Regla por estado (formato estado_XXX)
  if (rule.zipcode && rule.zipcode.startsWith(STATE_PREFIX)) {
    // Extraer el código de estado del zipcode
    const stateCode = rule.zipcode.substring(STATE_PREFIX.length).toLowerCase(); // Quitar "estado_"
    
    newRule.coverage_type = 'por_estado';
    newRule.tipo_cobertura = 'por_estado';
    
    // Si la regla tiene zona definida, usarla
    if (rule.zona) {
      newRule.coverage_values = [rule.zona.toLowerCase()];
      newRule.cobertura_estados = [rule.zona.toLowerCase()];
    } else {
      // Si no, usar el código extraído del zipcode
      newRule.coverage_values = [stateCode];
      newRule.cobertura_estados = [stateCode];
    }
    
    console.log(`✅ Normalizada regla por estado ${rule.id} -> ${newRule.coverage_values[0]}`);
    return newRule;
  }
  
  // CASO 3: Regla por zona que es un estado
  if (rule.zona && rule.zona !== 'Local' && rule.zona !== 'Nacional') {
    newRule.coverage_type = 'por_estado';
    newRule.tipo_cobertura = 'por_estado';
    newRule.coverage_values = [rule.zona.toLowerCase()];
    newRule.cobertura_estados = [rule.zona.toLowerCase()];
    console.log(`✅ Normalizada regla por zona-estado ${rule.id} -> ${rule.zona}`);
    return newRule;
  }
  
  // CASO 4: Regla por código postal específico
  if (rule.zipcode && rule.zipcode !== NATIONAL_KEYWORD && !rule.zipcode.startsWith(STATE_PREFIX)) {
    newRule.coverage_type = 'por_codigo_postal';
    newRule.tipo_cobertura = 'por_codigo_postal';
    newRule.coverage_values = [rule.zipcode];
    newRule.cobertura_cp = [rule.zipcode];
    console.log(`✅ Normalizada regla por CP específico ${rule.id} -> ${rule.zipcode}`);
    return newRule;
  }
  
  // CASO 5: Regla con lista de códigos postales
  if (rule.zipcodes && Array.isArray(rule.zipcodes) && rule.zipcodes.length > 0) {
    // Verificar si uno de los códigos es "nacional"
    if (rule.zipcodes.includes(NATIONAL_KEYWORD)) {
      newRule.coverage_type = 'nacional';
      newRule.tipo_cobertura = 'nacional';
      console.log(`✅ Normalizada regla con zipcodes que incluye nacional ${rule.id}`);
      return newRule;
    }
    
    const filteredZipcodes = rule.zipcodes.filter(cp => 
      cp !== NATIONAL_KEYWORD && !cp.startsWith(STATE_PREFIX)
    );
    
    if (filteredZipcodes.length > 0) {
      newRule.coverage_type = 'por_codigo_postal';
      newRule.tipo_cobertura = 'por_codigo_postal';
      newRule.coverage_values = filteredZipcodes;
      newRule.cobertura_cp = filteredZipcodes;
      console.log(`✅ Normalizada regla por lista CPs ${rule.id} -> ${filteredZipcodes.length} códigos`);
      return newRule;
    }
  }
  
  // CASO 6: Regla local (zona = Local)
  if (rule.zona === 'Local') {
    // Si tiene zipcodes, tratarlo como una regla por código postal
    if (rule.zipcodes && Array.isArray(rule.zipcodes) && rule.zipcodes.length > 0) {
      // Si incluye nacional, tratar como nacional
      if (rule.zipcodes.includes(NATIONAL_KEYWORD)) {
        newRule.coverage_type = 'nacional';
        newRule.tipo_cobertura = 'nacional';
        console.log(`✅ Normalizada regla Local ${rule.id} como nacional porque incluye 'nacional'`);
        return newRule;
      }
      
      const filteredCPs = rule.zipcodes.filter(cp => cp !== NATIONAL_KEYWORD);
      if (filteredCPs.length > 0) {
        newRule.coverage_type = 'por_codigo_postal';
        newRule.tipo_cobertura = 'por_codigo_postal';
        newRule.coverage_values = filteredCPs;
        newRule.cobertura_cp = filteredCPs;
        // Mantener el campo zona para identificar que es una regla local
        newRule.zona = 'Local';
        console.log(`✅ Normalizada regla Local ${rule.id} a códigos postales: ${newRule.coverage_values.join(', ')}`);
        return newRule;
      }
    }
    
    // Si tiene zipcode específico, usarlo
    if (rule.zipcode && rule.zipcode !== NATIONAL_KEYWORD) {
      newRule.coverage_type = 'por_codigo_postal';
      newRule.tipo_cobertura = 'por_codigo_postal';
      newRule.coverage_values = [rule.zipcode];
      newRule.cobertura_cp = [rule.zipcode];
      // Mantener el campo zona para identificar que es una regla local
      newRule.zona = 'Local';
      console.log(`✅ Normalizada regla Local ${rule.id} a código postal: ${rule.zipcode}`);
      return newRule;
    }
    
    // MODIFICACIÓN IMPORTANTE: Si es Local pero no tiene códigos específicos,
    // usar un tipo especial para validación y asegurar que conserva el campo zona
    newRule.coverage_type = 'por_codigo_postal';
    newRule.tipo_cobertura = 'por_codigo_postal';
    // Incluir todos los códigos postales posibles y el código específico 55555
    newRule.coverage_values = [rule.zipcode || '55555', '*'];  // * indica que acepta cualquier CP
    newRule.cobertura_cp = [rule.zipcode || '55555', '*'];
    // Mantener el campo zona para identificar que es una regla local
    newRule.zona = 'Local';
    console.log(`✅ Normalizada regla Local ${rule.id} como cobertura amplia + 55555`);
    return newRule;
  }
  
  // CASO DEFAULT: Si no se pudo normalizar, marcar como nacional
  console.warn(`⚠️ No se pudo determinar formato para regla ${rule.id}, usando nacional como fallback`);
  newRule.coverage_type = 'nacional';
  newRule.tipo_cobertura = 'nacional';
  
  return newRule;
};

/**
 * Normaliza un array de reglas de envío
 * @param {Array} rules - Reglas en formato original
 * @param {Object} address - Dirección del usuario (opcional)
 * @returns {Array} - Reglas normalizadas
 */
export const normalizeShippingRules = (rules, address = null) => {
  if (!rules || !Array.isArray(rules)) {
    return [];
  }
  
  console.log(`🔄 Normalizando ${rules.length} reglas de envío al formato Greedy`);
  
  // Filtrar reglas nulas y normalizar
  const normalizedRules = rules
    .filter(rule => rule && rule.id) // Solo reglas con ID válido
    .map(rule => normalizeShippingRule(rule, address))
    .filter(rule => rule !== null); // Filtrar resultados nulos
  
  console.log(`✅ Normalizadas ${normalizedRules.length} reglas de ${rules.length} originales`);
  
  // Verificar que todas las reglas tengan tipo de cobertura
  const rulesWithoutType = normalizedRules.filter(rule => !rule.coverage_type && !rule.tipo_cobertura);
  if (rulesWithoutType.length > 0) {
    console.error(`⚠️ ${rulesWithoutType.length} reglas sin tipo de cobertura después de normalizar`);
    rulesWithoutType.forEach(rule => {
      console.error(`  • Regla ${rule.id} sin tipo de cobertura`);
    });
  }
  
  return normalizedRules;
};

export default {
  normalizeShippingRule,
  normalizeShippingRules
}; 