// pruebas-de-caja-blanca-automatizadas/__tests__/PCB-A-13.test.js

/**
 * Test automatizado para la función validateReferenceCode
 * Caso de prueba: PCB-A-13
 */

/**
 * Valida si un código de referencia cumple con todas las reglas establecidas
 * @param {string} code - Código de referencia a validar
 * @return {boolean} - true si el código es válido, false en caso contrario
 */
function validateReferenceCode(code) {
  // Validar que el código existe
  if (!code) {
    return false;
  }
  
  // Validar que es un string
  if (typeof code !== 'string') {
    return false;
  }
  
  // Eliminar espacios en blanco
  code = code.trim();
  
  // Validar longitud (entre 6 y 20 caracteres)
  if (code.length < 6 || code.length > 20) {
    return false;
  }
  
  // Validar formato (solo letras mayúsculas y números)
  if (!/^[A-Z0-9]+$/.test(code)) {
    return false;
  }
  
  // Validar que comienza con "REF"
  if (!code.startsWith('REF')) {
    return false;
  }
  
  // Verificar suma de control
  // La suma de los códigos ASCII de todos los caracteres debe ser divisible por 7
  let sum = 0;
  for (let i = 0; i < code.length; i++) {
    sum += code.charCodeAt(i);
  }
  
  if (sum % 7 !== 0) {
    return false;
  }
  
  return true;
}

describe('validateReferenceCode', () => {
  test('debería rechazar códigos vacíos', () => {
    expect(validateReferenceCode('')).toBe(false);
  });

  test('debería rechazar códigos nulos', () => {
    expect(validateReferenceCode(null)).toBe(false);
  });

  test('debería rechazar entradas que no sean string', () => {
    expect(validateReferenceCode(12345)).toBe(false);
  });

  test('debería rechazar códigos demasiado cortos', () => {
    expect(validateReferenceCode('REF12')).toBe(false);
  });

  test('debería rechazar códigos demasiado largos', () => {
    expect(validateReferenceCode('REF12345678901234567890')).toBe(false);
  });

  test('debería rechazar códigos con caracteres inválidos', () => {
    expect(validateReferenceCode('REF12@')).toBe(false);
  });

  test('debería rechazar códigos sin el prefijo REF', () => {
    expect(validateReferenceCode('ABC1234')).toBe(false);
  });

  test('debería rechazar códigos con suma no divisible por 7', () => {
    expect(validateReferenceCode('REF1234')).toBe(false);
  });

  test('debería aceptar códigos válidos', () => {
    // REF2023 tiene una suma ASCII de 329, que es divisible por 7
    expect(validateReferenceCode('REF2023')).toBe(true);
  });
}); 