# Test PCB-A-13: Validación de Códigos de Referencia

## Información General

| Campo | Descripción |
| ----- | ----------- |
| **Nombre del test** | PCB-A-13 |
| **Módulo** | Descuentos |
| **Descripción** | Test para validar la función validateReferenceCode, que verifica si un código de referencia de descuento cumple con todas las reglas establecidas |
| **Caso de prueba relacionado** | PCN-D-04 |
| **Autor** | Valentina Pérez |
| **Fecha** | 15/11/2023 |

## Código Fuente

```javascript
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
```

## Diagrama de Flujo

![Diagrama de Flujo PCB-A-13](../diagramas/PCB-A-13.png)

## Complejidad Ciclomática

### Cálculo

Utilizando la fórmula V(G) = P + 1, donde P es el número de nodos predicado:

| Nodo Predicado | Descripción |
| -------------- | ----------- |
| P1 | Validar que el código existe |
| P2 | Validar que es un string |
| P3 | Validar longitud (entre 6 y 20 caracteres) |
| P4 | Validar formato (solo letras mayúsculas y números) |
| P5 | Validar que comienza con "REF" |
| P6 | Verificar que la suma de códigos ASCII sea divisible por 7 |

Número de nodos predicado (P) = 6
Complejidad ciclomática V(G) = 6 + 1 = 7

Esto significa que hay 7 caminos independientes a través del código.

## Determinación de Caminos Independientes

| Camino | Descripción | Secuencia |
| ------ | ----------- | --------- |
| 1 | Código no existe | 1, 2 |
| 2 | Código no es string | 1, 3, 4 |
| 3 | Código no cumple con longitud requerida | 1, 3, 5, 6 |
| 4 | Código con formato inválido | 1, 3, 5, 7, 8 |
| 5 | Código no comienza con 'REF' | 1, 3, 5, 7, 9, 10 |
| 6 | Suma de código ASCII no divisible por 7 | 1, 3, 5, 7, 9, 11, 12 |
| 7 | Código válido | 1, 3, 5, 7, 9, 11, 13 |

## Casos de Prueba Derivados

| ID | Descripción | Entradas | Resultado Esperado |
| -- | ----------- | -------- | ----------------- |
| CP1 | Código vacío | code = "" | false |
| CP2 | Código nulo | code = null | false |
| CP3 | Código no es string | code = 12345 | false |
| CP4 | Código demasiado corto | code = "REF12" | false |
| CP5 | Código demasiado largo | code = "REF12345678901234567890" | false |
| CP6 | Código con caracteres inválidos | code = "REF12@" | false |
| CP7 | Código sin prefijo 'REF' | code = "ABC1234" | false |
| CP8 | Código con suma no divisible por 7 | code = "REF1234" | false |
| CP9 | Código válido | code = "REF2023" | true |

## Resultados

| Caso de Prueba | Resultado Esperado | Resultado Obtenido | Observaciones |
| -------------- | ------------------ | ------------------ | ------------- |
| CP1 | false | false | Prueba exitosa |
| CP2 | false | false | Prueba exitosa |
| CP3 | false | false | Prueba exitosa |
| CP4 | false | false | Prueba exitosa |
| CP5 | false | false | Prueba exitosa |
| CP6 | false | false | Prueba exitosa |
| CP7 | false | false | Prueba exitosa |
| CP8 | false | false | Prueba exitosa |
| CP9 | true | true | Prueba exitosa |

## Herramienta de Prueba

Se utilizó Jest para implementar las pruebas automatizadas.

```javascript
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