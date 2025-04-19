# PCB-A-12: VALIDACIÓN DE REGLAS DE ENVÍO (REVISADO)

## Información General

| Campo | Valor |
|-------|-------|
| No | PCB-A-12 |
| Nombre de la prueba | PCB-A-12 - Validación de reglas de envío (Versión simplificada) |
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

  // Si la regla no tiene restricciones o tiene cobertura nacional
  if (!rule.restrictions || rule.hasNationalCoverage) {
    return true;
  }

  // Verificar si el código postal coincide con las restricciones
  return hasZipCodeMatch(rule.restrictions, zipCode);
};
```

## Diagrama de Flujo

![Diagrama de Flujo](../diagramas/exports/PCB-A-12.revised.png)

## Cálculo de la Complejidad Ciclomática

### Nodos Predicado

| Nodo | Descripción |
|------|-------------|
| 2 | ¿rule y address existen? |
| 5 | ¿zipCode existe? |
| 7 | ¿!rule.restrictions o rule.hasNationalCoverage? |

### Cálculo

| Método | Resultado |
|--------|-----------|
| Número de Regiones | 4 (3 caminos independientes + 1 región externa) |
| Aristas - Nodos + 2 | 12 - 10 + 2 = 4 |
| Nodos Predicado + 1 | 3 + 1 = 4 |
| Conclusión | La complejidad ciclomática es 4, lo que implica que se deben identificar 4 caminos independientes. |

## Determinación del Conjunto Básico de Caminos Independientes

| No | Descripción | Secuencia de nodos |
|----|-------------|-------------------|
| 1 | Parámetros inválidos | 1 → 2(No) → 3 → Fin |
| 2 | Código postal no existe | 1 → 2(Sí) → 4 → 5(No) → 6 → Fin |
| 3 | Sin restricciones o cobertura nacional | 1 → 2(Sí) → 4 → 5(Sí) → 7(Sí) → 8 → Fin |
| 4 | Verificar coincidencia de código postal | 1 → 2(Sí) → 4 → 5(Sí) → 7(No) → 9 → 10 → Fin |

## Casos de Prueba Derivados

| Caso | Descripción | Entrada | Resultado Esperado |
|------|-------------|---------|-------------------|
| 1 | Parámetros inválidos | rule = null, address = { zipCode: '01000' } | false |
| 2 | Código postal no existe | rule = { restrictions: ['01000'] }, address = {} | false |
| 3a | Regla sin restricciones | rule = { }, address = { zipCode: '01000' } | true |
| 3b | Regla con cobertura nacional | rule = { hasNationalCoverage: true, restrictions: ['02000'] }, address = { zipCode: '01000' } | true |
| 4a | Código postal coincide | rule = { restrictions: ['01000'] }, address = { zipCode: '01000' } | true |
| 4b | Código postal no coincide | rule = { restrictions: ['02000'] }, address = { zipCode: '01000' } | false |

## Tabla de Resultados

| Caso | Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|------|---------|-------------------|-------------------|--------|
| 1 | rule = null, address = { zipCode: '01000' } | false | false | ✅ Pasó |
| 2 | rule = { restrictions: ['01000'] }, address = {} | false | false | ✅ Pasó |
| 3a | rule = { }, address = { zipCode: '01000' } | true | true | ✅ Pasó |
| 3b | rule = { hasNationalCoverage: true, restrictions: ['02000'] }, address = { zipCode: '01000' } | true | true | ✅ Pasó |
| 4a | rule = { restrictions: ['01000'] }, address = { zipCode: '01000' } | true | true | ✅ Pasó |
| 4b | rule = { restrictions: ['02000'] }, address = { zipCode: '01000' } | false | false | ✅ Pasó |

## Herramienta Usada

- Jest

## Script de Prueba Automatizada

```javascript
// Ubicación: pruebas-de-caja-blanca-automatizadas/__tests__/PCB-A-12.revised.test.js

// Función auxiliar para verificar coincidencia de código postal (simulada)
const hasZipCodeMatch = (restrictions, zipCode) => {
  return restrictions.includes(zipCode);
};

// Función principal a probar
const isRuleValidForAddress = (rule, address) => {
  if (!rule || !address) return false;

  // Obtener código postal de la dirección
  const zipCode = address.zipCode || address.postalCode;
  if (!zipCode) return false;

  // Si la regla no tiene restricciones o tiene cobertura nacional
  if (!rule.restrictions || rule.hasNationalCoverage) {
    return true;
  }

  // Verificar si el código postal coincide con las restricciones
  return hasZipCodeMatch(rule.restrictions, zipCode);
};

describe('PCB-A-12 (Revisado): Validación de reglas de envío', () => {
  // Caso 1: Parámetros inválidos
  test('debería retornar false cuando los parámetros son inválidos', () => {
    expect(isRuleValidForAddress(null, { zipCode: '01000' })).toBe(false);
    expect(isRuleValidForAddress(undefined, { zipCode: '01000' })).toBe(false);
    expect(isRuleValidForAddress({}, null)).toBe(false);
    expect(isRuleValidForAddress()).toBe(false);
  });

  // Caso 2: Código postal no existe
  test('debería retornar false cuando el código postal no existe', () => {
    const rule = { restrictions: ['01000'] };
    const address = {};
    expect(isRuleValidForAddress(rule, address)).toBe(false);
  });

  // Caso 3a: Regla sin restricciones
  test('debería retornar true cuando la regla no tiene restricciones', () => {
    const rule = { };
    const address = { zipCode: '01000' };
    expect(isRuleValidForAddress(rule, address)).toBe(true);
  });

  // Caso 3b: Regla con cobertura nacional
  test('debería retornar true cuando la regla tiene cobertura nacional', () => {
    const rule = { hasNationalCoverage: true, restrictions: ['02000'] };
    const address = { zipCode: '01000' };
    expect(isRuleValidForAddress(rule, address)).toBe(true);
  });

  // Caso 4a: Código postal coincide
  test('debería retornar true cuando el código postal coincide con las restricciones', () => {
    const rule = { restrictions: ['01000'] };
    const address = { zipCode: '01000' };
    expect(isRuleValidForAddress(rule, address)).toBe(true);
    
    // Probar también con postalCode en lugar de zipCode
    const address2 = { postalCode: '01000' };
    expect(isRuleValidForAddress(rule, address2)).toBe(true);
  });
  
  // Caso 4b: Código postal no coincide
  test('debería retornar false cuando el código postal no coincide con las restricciones', () => {
    const rule = { restrictions: ['02000'] };
    const address = { zipCode: '01000' };
    expect(isRuleValidForAddress(rule, address)).toBe(false);
  });
});
``` 