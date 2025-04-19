# PCB-A-12: VALIDACIÓN DE REGLAS DE ENVÍO

## Información General

| Campo | Valor |
|-------|-------|
| No | PCB-A-12 |
| Nombre de la prueba | PCB-A-12 - Validación de reglas de envío |
| Módulo | Checkout/Shipping |
| Descripción | Prueba automatizada para evaluar la lógica que determina si una regla de envío aplica para una dirección específica |
| Caso de prueba relacionado | HU-C03: Cálculo de envío |
| Realizado por | Valentin Alejandro Perez Zurita |
| Fecha | 17 de Abril del 2025 |

## Código Fuente a Probar

```javascript
// Ubicación: src/modules/checkout/utils/shippingUtils.js

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
```

## Diagrama de Flujo

![Diagrama de Flujo](../diagramas/exports/PCB-A-12.png)

## Cálculo de la Complejidad Ciclomática

### Nodos Predicado

| Nodo | Descripción |
|------|-------------|
| 2 | ¿rule y address son válidos? |
| 5 | ¿zipCode existe? |
| 7 | ¿rule.zipcodes está vacío? |
| 9 | ¿rule.zipcodes incluye "nacional"? |
| 11 | ¿rule.zipcodes incluye zipCode exacto? |
| 14 | ¿Existe regla por estado? |
| 17 | ¿zipCode está en algún rango? |

### Cálculo

| Método | Resultado |
|--------|-----------|
| Número de Regiones | 8 (7 caminos independientes + 1 región externa) |
| Aristas - Nodos + 2 | 25 - 19 + 2 = 8 |
| Nodos Predicado + 1 | 7 + 1 = 8 |
| Conclusión | La complejidad ciclomática es 8, lo que implica que se deben identificar 8 caminos independientes. |

## Determinación del Conjunto Básico de Caminos Independientes

| No | Descripción | Secuencia de nodos |
|----|-------------|-------------------|
| 1 | Parámetros inválidos | 1 → 2(No) → 3 → Fin |
| 2 | Código postal no existe | 1 → 2(Sí) → 4 → 5(No) → 6 → Fin |
| 3 | Regla sin códigos postales | 1 → 2(Sí) → 4 → 5(Sí) → 7(Sí) → 8 → Fin |
| 4 | Regla incluye 'nacional' | 1 → 2(Sí) → 4 → 5(Sí) → 7(No) → 9(Sí) → 10 → Fin |
| 5 | Coincidencia exacta código postal | 1 → 2(Sí) → 4 → 5(Sí) → 7(No) → 9(No) → 11(Sí) → 12 → Fin |
| 6 | Coincidencia por estado | 1 → 2(Sí) → 4 → 5(Sí) → 7(No) → 9(No) → 11(No) → 13 → 14(Sí) → 15 → Fin |
| 7 | Coincidencia por rango | 1 → 2(Sí) → 4 → 5(Sí) → 7(No) → 9(No) → 11(No) → 13 → 14(No) → 16 → 17(Sí) → 18 → Fin |
| 8 | Sin coincidencia | 1 → 2(Sí) → 4 → 5(Sí) → 7(No) → 9(No) → 11(No) → 13 → 14(No) → 16 → 17(No) → 19 → Fin |

## Casos de Prueba Derivados

| Caso | Descripción | Entrada | Resultado Esperado |
|------|-------------|---------|-------------------|
| 1 | Parámetros inválidos | rule = null, address = { zipCode: '01000' } | false |
| 2 | Código postal no existe | rule = { zipcodes: ['01000'] }, address = {} | false |
| 3 | Regla sin códigos postales | rule = { zipcodes: [] }, address = { zipCode: '01000' } | true |
| 4 | Regla incluye 'nacional' | rule = { zipcodes: ['nacional'] }, address = { zipCode: '01000' } | true |
| 5 | Coincidencia exacta código postal | rule = { zipcodes: ['01000', '02000'] }, address = { zipCode: '01000' } | true |
| 6 | Coincidencia por estado | rule = { zipcodes: ['estado_AGU'] }, address = { zipCode: '01040', state: 'AGU' } | true |
| 7 | Coincidencia por rango | rule = { zipcodes: ['01000-01999'] }, address = { zipCode: '01500' } | true |
| 8 | Sin coincidencia | rule = { zipcodes: ['02000', '03000'] }, address = { zipCode: '01000', state: 'CMX' } | false |

## Tabla de Resultados

| Caso | Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|------|---------|-------------------|-------------------|--------|
| 1 | rule = null, address = { zipCode: '01000' } | false | false | ✅ Pasó |
| 2 | rule = { zipcodes: ['01000'] }, address = {} | false | false | ✅ Pasó |
| 3 | rule = { zipcodes: [] }, address = { zipCode: '01000' } | true | true | ✅ Pasó |
| 4 | rule = { zipcodes: ['nacional'] }, address = { zipCode: '01000' } | true | true | ✅ Pasó |
| 5 | rule = { zipcodes: ['01000', '02000'] }, address = { zipCode: '01000' } | true | true | ✅ Pasó |
| 6 | rule = { zipcodes: ['estado_AGU'] }, address = { zipCode: '01040', state: 'AGU' } | true | true | ✅ Pasó |
| 7 | rule = { zipcodes: ['01000-01999'] }, address = { zipCode: '01500' } | true | true | ✅ Pasó |
| 8 | rule = { zipcodes: ['02000', '03000'] }, address = { zipCode: '01000', state: 'CMX' } | false | false | ✅ Pasó |

## Herramienta Usada

- Jest

## Script de Prueba Automatizada

```javascript
// Ubicación: pruebas-de-caja-blanca-automatizadas/__tests__/PCB-A-12.test.js

// Simulando la importación del módulo shippingUtils
const isRuleValidForAddress = (rule, address) => {
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

describe('PCB-A-12: Validación de reglas de envío', () => {
  // Caso 1: Parámetros inválidos
  test('debería retornar false cuando los parámetros son inválidos', () => {
    expect(isRuleValidForAddress(null, { zipCode: '01000' })).toBe(false);
    expect(isRuleValidForAddress(undefined, { zipCode: '01000' })).toBe(false);
    expect(isRuleValidForAddress({}, null)).toBe(false);
    expect(isRuleValidForAddress()).toBe(false);
  });

  // Caso 2: Código postal no existe
  test('debería retornar false cuando el código postal no existe', () => {
    const rule = { zipcodes: ['01000'] };
    const address = {};
    expect(isRuleValidForAddress(rule, address)).toBe(false);
  });

  // Caso 3: Regla sin códigos postales
  test('debería retornar true cuando la regla no tiene códigos postales', () => {
    const rule = { zipcodes: [] };
    const address = { zipCode: '01000' };
    expect(isRuleValidForAddress(rule, address)).toBe(true);
    
    const rule2 = { };
    expect(isRuleValidForAddress(rule2, address)).toBe(true);
  });

  // Caso 4: Regla incluye 'nacional'
  test('debería retornar true cuando la regla incluye cobertura nacional', () => {
    const rule = { zipcodes: ['nacional', '02000'] };
    const address = { zipCode: '01000' };
    expect(isRuleValidForAddress(rule, address)).toBe(true);
  });

  // Caso 5: Coincidencia exacta código postal
  test('debería retornar true cuando hay coincidencia exacta de código postal', () => {
    const rule = { zipcodes: ['01000', '02000'] };
    const address = { zipCode: '01000' };
    expect(isRuleValidForAddress(rule, address)).toBe(true);
    
    // Probar también con postalCode en lugar de zipCode
    const address2 = { postalCode: '02000' };
    expect(isRuleValidForAddress(rule, address2)).toBe(true);
  });

  // Caso 6: Coincidencia por estado
  test('debería retornar true cuando hay coincidencia por estado', () => {
    const rule = { zipcodes: ['estado_AGU', 'estado_JAL'] };
    const address = { zipCode: '01040', state: 'AGU' };
    expect(isRuleValidForAddress(rule, address)).toBe(true);
  });

  // Caso 7: Coincidencia por rango
  test('debería retornar true cuando el código postal está en un rango', () => {
    const rule = { zipcodes: ['01000-01999'] };
    const address = { zipCode: '01500' };
    expect(isRuleValidForAddress(rule, address)).toBe(true);
  });

  // Caso 8: Sin coincidencia
  test('debería retornar false cuando no hay coincidencia', () => {
    const rule = { zipcodes: ['02000', '03000', 'estado_JAL'] };
    const address = { zipCode: '01000', state: 'CMX' };
    expect(isRuleValidForAddress(rule, address)).toBe(false);
    
    // Probar también rango sin coincidencia
    const rule2 = { zipcodes: ['02000-02999'] };
    expect(isRuleValidForAddress(rule2, address)).toBe(false);
  });
});
``` 