// pruebas-de-caja-blanca-automatizadas/__tests__/PCB-A-12.test.js

/**
 * Test automatizado para la función isRuleValidForAddress
 * Caso de prueba: PCB-A-12
 */

/**
 * Valida si una regla de restricción geográfica aplica a una dirección
 * @param {Object} rule - Regla de restricción (contiene tipo y valores)
 * @param {Object} address - Dirección del cliente
 * @return {boolean} - true si la regla aplica a la dirección, false en caso contrario
 */
function isRuleValidForAddress(rule, address) {
  // Validar que rule y address existen
  if (!rule || !address) {
    return false;
  }
  
  // Extraer el zip code de la dirección
  const zipCode = address.zipCode || "";
  
  // Verificar regla basada en el tipo
  switch(rule.type) {
    case 'ZIP_CODE_INCLUSION':
      // Si el zip code está en la lista de inclusión, la regla aplica
      return rule.values.includes(zipCode);
      
    case 'ZIP_CODE_EXCLUSION':
      // Si el zip code está en la lista de exclusión, la regla NO aplica
      return !rule.values.includes(zipCode);
      
    case 'ZIP_CODE_PREFIX':
      // Si el zip code comienza con alguno de los prefijos, la regla aplica
      return rule.values.some(prefix => zipCode.startsWith(prefix));
      
    case 'STATE_INCLUSION':
      // Si el estado está en la lista de inclusión, la regla aplica
      return rule.values.includes(address.state || "");
      
    case 'STATE_EXCLUSION':
      // Si el estado está en la lista de exclusión, la regla NO aplica
      return !rule.values.includes(address.state || "");
      
    default:
      // Tipo de regla desconocido, no aplica
      return false;
  }
}

describe('isRuleValidForAddress', () => {
  // Escenarios cuando faltan parámetros
  test('debería retornar false cuando no hay regla', () => {
    const address = { zipCode: '12345', state: 'CA' };
    expect(isRuleValidForAddress(null, address)).toBe(false);
    expect(isRuleValidForAddress(undefined, address)).toBe(false);
  });
  
  test('debería retornar false cuando no hay dirección', () => {
    const rule = { type: 'ZIP_CODE_INCLUSION', values: ['12345'] };
    expect(isRuleValidForAddress(rule, null)).toBe(false);
    expect(isRuleValidForAddress(rule, undefined)).toBe(false);
  });
  
  // Escenarios para ZIP_CODE_INCLUSION
  test('debería retornar true cuando el código postal está incluido en ZIP_CODE_INCLUSION', () => {
    const rule = { type: 'ZIP_CODE_INCLUSION', values: ['12345', '67890'] };
    const address = { zipCode: '12345', state: 'CA' };
    expect(isRuleValidForAddress(rule, address)).toBe(true);
  });
  
  test('debería retornar false cuando el código postal no está incluido en ZIP_CODE_INCLUSION', () => {
    const rule = { type: 'ZIP_CODE_INCLUSION', values: ['12345', '67890'] };
    const address = { zipCode: '11111', state: 'CA' };
    expect(isRuleValidForAddress(rule, address)).toBe(false);
  });
  
  // Escenarios para ZIP_CODE_EXCLUSION
  test('debería retornar false cuando el código postal está incluido en ZIP_CODE_EXCLUSION', () => {
    const rule = { type: 'ZIP_CODE_EXCLUSION', values: ['12345', '67890'] };
    const address = { zipCode: '12345', state: 'CA' };
    expect(isRuleValidForAddress(rule, address)).toBe(false);
  });
  
  test('debería retornar true cuando el código postal no está incluido en ZIP_CODE_EXCLUSION', () => {
    const rule = { type: 'ZIP_CODE_EXCLUSION', values: ['12345', '67890'] };
    const address = { zipCode: '11111', state: 'CA' };
    expect(isRuleValidForAddress(rule, address)).toBe(true);
  });
  
  // Escenarios para ZIP_CODE_PREFIX
  test('debería retornar true cuando el código postal comienza con un prefijo incluido', () => {
    const rule = { type: 'ZIP_CODE_PREFIX', values: ['123', '678'] };
    const address = { zipCode: '12399', state: 'CA' };
    expect(isRuleValidForAddress(rule, address)).toBe(true);
  });
  
  test('debería retornar false cuando el código postal no comienza con ningún prefijo incluido', () => {
    const rule = { type: 'ZIP_CODE_PREFIX', values: ['123', '678'] };
    const address = { zipCode: '45699', state: 'CA' };
    expect(isRuleValidForAddress(rule, address)).toBe(false);
  });
  
  // Escenarios para STATE_INCLUSION
  test('debería retornar true cuando el estado está incluido en STATE_INCLUSION', () => {
    const rule = { type: 'STATE_INCLUSION', values: ['CA', 'NY'] };
    const address = { zipCode: '12345', state: 'CA' };
    expect(isRuleValidForAddress(rule, address)).toBe(true);
  });
  
  test('debería retornar false cuando el estado no está incluido en STATE_INCLUSION', () => {
    const rule = { type: 'STATE_INCLUSION', values: ['CA', 'NY'] };
    const address = { zipCode: '12345', state: 'TX' };
    expect(isRuleValidForAddress(rule, address)).toBe(false);
  });
  
  // Escenarios para STATE_EXCLUSION
  test('debería retornar false cuando el estado está incluido en STATE_EXCLUSION', () => {
    const rule = { type: 'STATE_EXCLUSION', values: ['CA', 'NY'] };
    const address = { zipCode: '12345', state: 'CA' };
    expect(isRuleValidForAddress(rule, address)).toBe(false);
  });
  
  test('debería retornar true cuando el estado no está incluido en STATE_EXCLUSION', () => {
    const rule = { type: 'STATE_EXCLUSION', values: ['CA', 'NY'] };
    const address = { zipCode: '12345', state: 'TX' };
    expect(isRuleValidForAddress(rule, address)).toBe(true);
  });
  
  // Escenario para tipo de regla desconocido
  test('debería retornar false para un tipo de regla desconocido', () => {
    const rule = { type: 'UNKNOWN_RULE_TYPE', values: ['12345'] };
    const address = { zipCode: '12345', state: 'CA' };
    expect(isRuleValidForAddress(rule, address)).toBe(false);
  });
  
  // Escenarios para valores faltantes
  test('debería manejar valores faltantes en la dirección', () => {
    const ruleZip = { type: 'ZIP_CODE_INCLUSION', values: ['12345'] };
    const ruleState = { type: 'STATE_INCLUSION', values: ['CA'] };
    
    expect(isRuleValidForAddress(ruleZip, {})).toBe(false);
    expect(isRuleValidForAddress(ruleState, {})).toBe(false);
  });
}); 