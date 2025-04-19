# PCB-A-11: VALIDACIÓN DE FORMULARIO DE CONTACTO

## Información General

| Campo                      | Valor                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| No                         | PCB-A-11                                                                                        |
| Nombre de la prueba        | PCB-A-11 - Validación de formulario de contacto                                                |
| Módulo                    | Public/Contact                                                                                  |
| Descripción               | Prueba automatizada para validar la lógica de validación de campos del formulario de contacto |
| Caso de prueba relacionado | HU-P05: Formulario de contacto                                                                  |
| Realizado por              | Valentin Alejandro Perez Zurita                                                                 |
| Fecha                      | 17 de Abril del 2025                                                                            |

## Código Fuente a Probar

```javascript
// Ubicación: src/modules/public/services/contactForm.js

/**
 * Valida los campos del formulario de contacto y envía el mensaje
 * @param {Object} formData - Datos del formulario de contacto
 * @param {string} formData.name - Nombre del usuario
 * @param {string} formData.email - Correo electrónico del usuario
 * @param {string} formData.subject - Asunto del mensaje
 * @param {string} formData.message - Contenido del mensaje
 * @returns {Promise<Object>} - Resultado de la operación
 * @throws {Error} - Si hay errores en la validación o en el envío
 */
export const validateAndSendContactForm = async (formData) => {
  // Validar que existan todos los campos requeridos
  if (!formData || typeof formData !== 'object') {
    throw new Error("Se requieren los datos del formulario");
  }
  
  const { name, email, subject, message } = formData;
  
  // Validar campos individuales
  if (!name || name.trim().length < 2) {
    return {
      success: false,
      field: 'name',
      error: 'El nombre es obligatorio y debe tener al menos 2 caracteres'
    };
  }
  
  // Validar formato de email con una expresión regular simple
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      field: 'email',
      error: 'El correo electrónico no es válido'
    };
  }
  
  // Validar asunto
  if (!subject || subject.trim().length < 3) {
    return {
      success: false,
      field: 'subject',
      error: 'El asunto es obligatorio y debe tener al menos 3 caracteres'
    };
  }
  
  // Validar mensaje
  if (!message || message.trim().length < 10) {
    return {
      success: false,
      field: 'message',
      error: 'El mensaje es obligatorio y debe tener al menos 10 caracteres'
    };
  }
  
  try {
    // Simular envío del formulario a una API o servicio
    // En una implementación real, aquí se enviaría a un servicio o API
    await new Promise(resolve => setTimeout(resolve, 500));
  
    // Devolver resultado exitoso
    return {
      success: true,
      message: 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.'
    };
  } catch (error) {
    console.error('Error al enviar el formulario de contacto:', error);
    throw new Error('No se pudo enviar el mensaje. Por favor intente más tarde.');
  }
};
```

## Diagrama de flujo

![Diagrama de Flujo](../diagramas/exports/PCB-A-11.png)

## Cálculo de la Complejidad Ciclomática

### Nodos Predicado

| Nodo | Descripción                          |
| ---- | ------------------------------------- |
| 2    | Validación de existencia de formData |
| 3    | Validación del campo nombre          |
| 4    | Validación del campo email           |
| 5    | Validación del campo asunto          |
| 6    | Validación del campo mensaje         |
| 7    | Bloque catch (manejo de excepción)   |

### Cálculo

| Método             | Resultado                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| Número de Regiones | 6                                                                                                   |
| Aristas - Nodos + 2 | 14 - 10 + 2 = 6                                                                                     |
| Nodos Predicado + 1 | 6 + 1 = 7                                                                                           |
| Conclusión         | La complejidad ciclomática es 6, lo que implica que se deben identificar 6 caminos independientes. |

## Determinación del Conjunto Básico de Caminos Independientes

| No | Descripción              | Secuencia de nodos                                                                                           |
| -- | ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1  | formData no proporcionado | 1 → 2(No) → "Lanzar error formData" → Fin                                                                 |
| 2  | Nombre inválido          | 1 → 2(Sí) → 3(No) → "Retornar error nombre" → Fin                                                       |
| 3  | Email inválido           | 1 → 2(Sí) → 3(Sí) → 4(No) → "Retornar error email" → Fin                                              |
| 4  | Asunto inválido          | 1 → 2(Sí) → 3(Sí) → 4(Sí) → 5(No) → "Retornar error asunto" → Fin                                   |
| 5  | Mensaje inválido         | 1 → 2(Sí) → 3(Sí) → 4(Sí) → 5(Sí) → 6(No) → "Retornar error mensaje" → Fin                        |
| 6  | Envío exitoso            | 1 → 2(Sí) → 3(Sí) → 4(Sí) → 5(Sí) → 6(Sí) → "Enviar mensaje" → "Retornar éxito" → Fin          |
| 7  | Error en el envío        | 1 → 2(Sí) → 3(Sí) → 4(Sí) → 5(Sí) → 6(Sí) → "Enviar mensaje" → 7 → "Lanzar error envío" → Fin |

## Casos de Prueba Derivados

| Caso | Descripción              | Entrada                                                                                               | Resultado Esperado                                                           |
| ---- | ------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1    | formData no proporcionado | formData=null                                                                                         | Error: "Se requieren los datos del formulario"                               |
| 2    | Nombre inválido          | formData={name:"", email:"valid@email.com", subject:"Asunto", message:"Mensaje largo"}                | {success:false, field:'name', error:'El nombre es obligatorio...'}           |
| 3    | Email inválido           | formData={name:"Juan", email:"invalid-email", subject:"Asunto", message:"Mensaje largo"}              | {success:false, field:'email', error:'El correo electrónico no es válido'} |
| 4    | Asunto inválido          | formData={name:"Juan", email:"valid@email.com", subject:"", message:"Mensaje largo"}                  | {success:false, field:'subject', error:'El asunto es obligatorio...'}        |
| 5    | Mensaje inválido         | formData={name:"Juan", email:"valid@email.com", subject:"Asunto", message:"Corto"}                    | {success:false, field:'message', error:'El mensaje es obligatorio...'}       |
| 6    | Envío exitoso            | formData={name:"Juan", email:"valid@email.com", subject:"Asunto", message:"Este es un mensaje largo"} | {success:true, message:'Mensaje enviado correctamente...'}                   |
| 7    | Error en el envío        | formData={datos válidos}, error de red simulado                                                      | Error: "No se pudo enviar el mensaje..."                                     |

## Tabla de Resultados

| Caso | Entrada               | Resultado Esperado                             | Resultado Obtenido                             | Estado   |
| ---- | --------------------- | ---------------------------------------------- | ---------------------------------------------- | -------- |
| 1    | formData=null         | Error: "Se requieren los datos del formulario" | Error: "Se requieren los datos del formulario" | ✅ Pasó |
| 2    | name=""               | {success:false, field:'name'}                  | {success:false, field:'name'}                  | ✅ Pasó |
| 3    | email="invalid-email" | {success:false, field:'email'}                 | {success:false, field:'email'}                 | ✅ Pasó |
| 4    | subject=""            | {success:false, field:'subject'}               | {success:false, field:'subject'}               | ✅ Pasó |
| 5    | message="Corto"       | {success:false, field:'message'}               | {success:false, field:'message'}               | ✅ Pasó |
| 6    | Datos válidos        | {success:true}                                 | {success:true}                                 | ✅ Pasó |
| 7    | Error simulado        | Error: "No se pudo enviar el mensaje..."       | Error: "No se pudo enviar el mensaje..."       | ✅ Pasó |

## Herramienta Usada

- Jest

## Script de Prueba Automatizada

```javascript
// Ubicación: pruebas-de-caja-blanca-automatizadas/tests/PCB-A-11.test.js

import { validateAndSendContactForm } from '../../src/modules/public/services/contactForm';

describe('PCB-A-11: Validación de formulario de contacto', () => {
  // Datos de prueba válidos
  const validFormData = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    subject: 'Consulta sobre productos',
    message: 'Me gustaría obtener más información sobre los productos de cactus disponibles.'
  };
  
  // Caso 1: formData no proporcionado
  test('1. Debe rechazar formData inválido', async () => {
    await expect(validateAndSendContactForm(null)).rejects.toThrow('Se requieren los datos del formulario');
    await expect(validateAndSendContactForm()).rejects.toThrow('Se requieren los datos del formulario');
  });
  
  // Caso 2: Nombre inválido
  test('2. Debe validar el campo nombre', async () => {
    const result1 = await validateAndSendContactForm({
      ...validFormData,
      name: ''
    });
  
    expect(result1.success).toBe(false);
    expect(result1.field).toBe('name');
  
    const result2 = await validateAndSendContactForm({
      ...validFormData,
      name: 'A'
    });
  
    expect(result2.success).toBe(false);
    expect(result2.field).toBe('name');
  });
  
  // Caso 3: Email inválido
  test('3. Debe validar el campo email', async () => {
    const result1 = await validateAndSendContactForm({
      ...validFormData,
      email: ''
    });
  
    expect(result1.success).toBe(false);
    expect(result1.field).toBe('email');
  
    const result2 = await validateAndSendContactForm({
      ...validFormData,
      email: 'correo-invalido'
    });
  
    expect(result2.success).toBe(false);
    expect(result2.field).toBe('email');
  });
  
  // Caso 4: Asunto inválido
  test('4. Debe validar el campo asunto', async () => {
    const result1 = await validateAndSendContactForm({
      ...validFormData,
      subject: ''
    });
  
    expect(result1.success).toBe(false);
    expect(result1.field).toBe('subject');
  
    const result2 = await validateAndSendContactForm({
      ...validFormData,
      subject: 'AB'
    });
  
    expect(result2.success).toBe(false);
    expect(result2.field).toBe('subject');
  });
  
  // Caso 5: Mensaje inválido
  test('5. Debe validar el campo mensaje', async () => {
    const result = await validateAndSendContactForm({
      ...validFormData,
      message: 'Corto'
    });
  
    expect(result.success).toBe(false);
    expect(result.field).toBe('message');
  });
  
  // Caso 6: Envío exitoso
  test('6. Debe procesar un formulario válido correctamente', async () => {
    const result = await validateAndSendContactForm(validFormData);
  
    expect(result.success).toBe(true);
    expect(result.message).toContain('Mensaje enviado correctamente');
  });
  
  // Caso 7: Error en el envío
  test('7. Debe manejar errores en el envío', async () => {
    // Mockear Promise.prototype.then para simular un error
    const originalThen = Promise.prototype.then;
    Promise.prototype.then = function() {
      return Promise.reject(new Error('Error simulado'));
    };
  
    try {
      await expect(validateAndSendContactForm(validFormData))
        .rejects.toThrow('No se pudo enviar el mensaje');
    } finally {
      // Restaurar el método original
      Promise.prototype.then = originalThen;
    }
  });
});
```

npx jest pruebas-de-caja-blanca-automatizadas/__tests__/PCB-A-11.test.js --config=jest.config.cjs
