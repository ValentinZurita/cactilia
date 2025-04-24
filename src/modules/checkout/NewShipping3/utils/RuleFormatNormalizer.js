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
  
  // Preservar tiempos de entrega originales para debugging
  if (rule.opciones_mensajeria && Array.isArray(rule.opciones_mensajeria)) {
     console.log(`ℹ️ Regla ${rule.id} tiene ${rule.opciones_mensajeria.length} opciones de mensajería`);
     rule.opciones_mensajeria.forEach((opcion, idx) => {
       if (opcion.minDays !== undefined || opcion.maxDays !== undefined) {
         console.log(`ℹ️ Opción de mensajería #${idx+1} tiene tiempos: min=${opcion.minDays}, max=${opcion.maxDays}`);
       }
       if (opcion.tiempo_entrega) {
         console.log(`ℹ️ Opción de mensajería #${idx+1} tiene tiempo_entrega: "${opcion.tiempo_entrega}"`);
       }
     });
  }
  
  // Crear una copia profunda para no modificar el original
  const newRule = JSON.parse(JSON.stringify(rule));
  
  // --- START Preserve Original Time Fields ---
  // Preserve all possible variants of delivery time fields
  const timeFields = ['tiempo_minimo', 'tiempo_maximo', 'min_days', 'max_days', 'minDays', 'maxDays'];
  timeFields.forEach(field => {
    if (rule[field] !== undefined) newRule[field] = rule[field];
  });
  // Preserve messaging options exactly
  if (Array.isArray(rule.opciones_mensajeria)) {
    newRule.opciones_mensajeria = JSON.parse(JSON.stringify(rule.opciones_mensajeria));
  }
  // --- END Preserve Original Time Fields ---
  
  // Si ya tiene coverage_type definido, asumimos que ya está normalizada
  if (newRule.coverage_type || newRule.tipo_cobertura) {
    // Ensure both fields exist if one does, using the existing value
    const existingType = newRule.coverage_type || newRule.tipo_cobertura;
    newRule.coverage_type = existingType;
    newRule.tipo_cobertura = existingType;
    console.log(`ℹ️ Regla ${rule.id} ya tiene tipo de cobertura: ${existingType}`);
    return newRule;
  }
  
  // --- START NEW UNIFIED STATE LOGIC ---
  let stateIdentifiers = [];
  // Prioritize 'zipcodes' array if it exists and contains state codes
  if (rule.zipcodes && Array.isArray(rule.zipcodes) && rule.zipcodes.some(zc => typeof zc === 'string' && zc.startsWith(STATE_PREFIX))) {
      stateIdentifiers = rule.zipcodes.filter(zc => typeof zc === 'string' && zc.startsWith(STATE_PREFIX));
      console.log(`ℹ️ Regla ${rule.id}: Encontrados ${stateIdentifiers.length} identificadores de estado en 'zipcodes'`);
  }
  // Fallback to 'zipcode' string if it's a state code AND 'zipcodes' didn't contain states
  else if (rule.zipcode && typeof rule.zipcode === 'string' && rule.zipcode.startsWith(STATE_PREFIX)) {
      stateIdentifiers = [rule.zipcode];
      console.log(`ℹ️ Regla ${rule.id}: Encontrado identificador de estado en 'zipcode'`);
  }
   // Add check for existing cobertura_estados if migrating data (useful fallback)
   else if (rule.cobertura_estados && Array.isArray(rule.cobertura_estados) && rule.cobertura_estados.length > 0) {
        // If this field exists and has values, trust it directly
        const normalizedStatesFromField = rule.cobertura_estados
            .filter(s => typeof s === 'string')
            .map(s => s.toLowerCase().trim())
            .filter(Boolean);

        if (normalizedStatesFromField.length > 0) {
            newRule.coverage_type = COVERAGE_TYPES.STATE;
            newRule.tipo_cobertura = COVERAGE_TYPES.STATE;
            newRule.coverage_values = normalizedStatesFromField;
            newRule.cobertura_estados = normalizedStatesFromField; // Ensure this is also set
            console.log(`✅ Normalizada regla ${rule.id} por campo preexistente 'cobertura_estados' -> ${newRule.coverage_values.join(', ')}`);
            return newRule;
        }
   }

  // If we found state identifiers via STATE_PREFIX, process them
  if (stateIdentifiers.length > 0) {
    const normalizedStates = stateIdentifiers
      .map(identifier => identifier.substring(STATE_PREFIX.length).toLowerCase().trim())
      .filter(state => state); // Remove empty strings if any issue

    if (normalizedStates.length > 0) {
      newRule.coverage_type = COVERAGE_TYPES.STATE;
      newRule.tipo_cobertura = COVERAGE_TYPES.STATE;
      newRule.coverage_values = normalizedStates;
      newRule.cobertura_estados = normalizedStates; // Add this field consistently
      console.log(`✅ Normalizada regla por estado ${rule.id} -> ${normalizedStates.join(', ')}`);
      console.log(`[DEBUG] Antes de retornar ESTADO para ${rule.id}: coverage_type=${newRule.coverage_type}`);
      return newRule; // IMPORTANT: Return early once handled as state rule
    } else {
       console.warn(`⚠️ Regla ${rule.id}: Se encontraron identificadores con prefijo '${STATE_PREFIX}' pero resultaron vacíos tras normalizar.`);
    }
  }
  // --- END NEW UNIFIED STATE LOGIC ---
  
  // CASO: Regla de cobertura nacional (Checked AFTER state logic fails)
  if (rule.zona === 'Nacional' || rule.zipcode === NATIONAL_KEYWORD || (rule.zipcodes && rule.zipcodes.includes(NATIONAL_KEYWORD))) {
      newRule.coverage_type = COVERAGE_TYPES.NATIONAL;
      newRule.tipo_cobertura = COVERAGE_TYPES.NATIONAL;
      console.log(`✅ Normalizada regla nacional ${rule.id}`);
      return newRule;
  }
  
  // CASO: Regla por código postal específico (Checked AFTER state logic fails)
  // Ensure it's not a state code being processed here again
  if (rule.zipcode && typeof rule.zipcode === 'string' && rule.zipcode !== NATIONAL_KEYWORD && !rule.zipcode.startsWith(STATE_PREFIX)) {
      newRule.coverage_type = COVERAGE_TYPES.ZIP;
      newRule.tipo_cobertura = COVERAGE_TYPES.ZIP;
      newRule.coverage_values = [rule.zipcode];
      newRule.cobertura_cp = [rule.zipcode]; // Add this field consistently
      console.log(`✅ Normalizada regla por CP específico ${rule.id} -> ${rule.zipcode}`);
      console.log(`[DEBUG] Antes de retornar CP para ${rule.id}: coverage_type=${newRule.coverage_type}`);
      return newRule;
  }
  
  // CASO: Regla con lista de códigos postales (Checked AFTER state logic fails)
  if (rule.zipcodes && Array.isArray(rule.zipcodes) && rule.zipcodes.length > 0) {
      // Filter out national keyword and state prefixes (already handled or irrelevant for CP list)
      const specificZipcodes = rule.zipcodes.filter(cp =>
          typeof cp === 'string' && cp !== NATIONAL_KEYWORD && !cp.startsWith(STATE_PREFIX)
      );

      if (specificZipcodes.length > 0) {
          newRule.coverage_type = COVERAGE_TYPES.ZIP;
          newRule.tipo_cobertura = COVERAGE_TYPES.ZIP;
          newRule.coverage_values = specificZipcodes;
          newRule.cobertura_cp = specificZipcodes; // Add this field consistently
          console.log(`✅ Normalizada regla por lista CPs ${rule.id} -> ${specificZipcodes.length} códigos`);
          console.log(`[DEBUG] Antes de retornar Lista CP para ${rule.id}: coverage_type=${newRule.coverage_type}`);
          return newRule;
      }
  }
  
  // CASO: Regla local (zona = Local) (Checked near the end)
   if (rule.zona === 'Local') {
    // For local rules, explicitly define as BY_ZIPCODE but keep zona for specific logic elsewhere
    newRule.coverage_type = COVERAGE_TYPES.ZIP;
    newRule.tipo_cobertura = COVERAGE_TYPES.ZIP;
    newRule.zona = 'Local'; // Preserve zona for local check

    // Try to get specific CPs if available
    let localCPs = [];
    if (rule.zipcodes && Array.isArray(rule.zipcodes)) {
        localCPs = rule.zipcodes.filter(cp => typeof cp === 'string' && cp !== NATIONAL_KEYWORD && !cp.startsWith(STATE_PREFIX));
    } else if (rule.zipcode && typeof rule.zipcode === 'string' && rule.zipcode !== NATIONAL_KEYWORD && !rule.zipcode.startsWith(STATE_PREFIX)) {
        localCPs = [rule.zipcode];
    }

    // If specific CPs found, use them.
    if (localCPs.length > 0) {
       newRule.coverage_values = localCPs;
       newRule.cobertura_cp = localCPs;
       console.log(`✅ Normalizada regla Local ${rule.id} a códigos postales específicos: ${newRule.coverage_values.join(', ')}`);
    } else {
       // If Local rule has no specific zip codes, use '*' as a placeholder.
       // The logic checking for 'Local' rules needs to handle this '*' or rely solely on rule.zona === 'Local'.
       newRule.coverage_values = ['*']; // '*' signifies broad local match potential
       newRule.cobertura_cp = ['*'];
       console.log(`✅ Normalizada regla Local ${rule.id} como cobertura amplia local (usa '*' como placeholder)`);
    }
    console.log(`[DEBUG] Antes de retornar LOCAL para ${rule.id}: coverage_type=${newRule.coverage_type}`);
    return newRule;
  }
  
  // CASO DEFAULT: Fallback a nacional (Si nada más coincide)
  console.warn(`⚠️ No se pudo determinar formato específico para regla ${rule.id} (Zona: ${rule.zona}, Zipcode: ${rule.zipcode}). Usando 'nacional' como fallback.`);
  newRule.coverage_type = COVERAGE_TYPES.NATIONAL;
  newRule.tipo_cobertura = COVERAGE_TYPES.NATIONAL;
  
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
  
  const normalizedRules = rules
    .filter(rule => rule && rule.id)
    .map(rule => {
        const normalizedRule = normalizeShippingRule(rule, address);
        // Imprimir la regla normalizada justo después de que se devuelve
        console.log(`[DEBUG] Regla ${rule.id} normalizada a:`, JSON.stringify(normalizedRule, null, 2));
        return normalizedRule;
    })
    .filter(rule => rule !== null);
  
  console.log(`✅ Normalizadas ${normalizedRules.length} reglas de ${rules.length} originales`);
  
  // Post-normalization check
  const rulesWithoutType = normalizedRules.filter(rule => !rule.coverage_type);
  if (rulesWithoutType.length > 0) {
    console.error(`❌ ERROR CRÍTICO: ${rulesWithoutType.length} reglas quedaron sin 'coverage_type' después de normalizar!`);
    rulesWithoutType.forEach(rule => {
      console.error(`  • Regla ID: ${rule.id}, Datos Originales:`, rule); // Log full rule data for debugging
    });
     // Podrías querer lanzar un error aquí o manejarlo de otra forma
     // throw new Error("Fallo crítico en la normalización de reglas de envío.");
  }
  
  return normalizedRules;
};

export default {
  normalizeShippingRule,
  normalizeShippingRules
}; 