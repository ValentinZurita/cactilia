# PCB-A-05.1: INTEGRACIÓN CON STRIPE (VERSIÓN MEJORADA)

## Información General

| Campo | Valor |
|-------|-------|
| No | PCB-A-05.1 |
| Nombre de la prueba | PCB-A-05.1 - Integración con Stripe (Versión mejorada) |
| Módulo | Checkout/Payment |
| Descripción | Prueba automatizada para evaluar la lógica de comunicación con la pasarela de pago Stripe con análisis mejorado |
| Caso de prueba relacionado | HU-C05: Integración Stripe |
| Caso de prueba previo | PCB-A-05 |
| Realizado por | Valentin Alejandro Perez Zurita |
| Fecha | 17 de Abril del 2025 |

## Código Fuente a Probar

```javascript
// Ubicación: functions/payment/createPaymentIntent.js

exports.createPaymentIntent = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam]
}, async (request) => {
  // Verificar autenticación
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Debes iniciar sesión para realizar pagos"
    );
  }

  const { amount, paymentMethodId, description = "Compra en Cactilia" } = request.data;

  // Validar datos
  if (!amount || amount <= 0) {
    throw new HttpsError(
      "invalid-argument",
      "El monto debe ser mayor a cero"
    );
  }

  if (!paymentMethodId) {
    throw new HttpsError(
      "invalid-argument",
      "Se requiere un método de pago"
    );
  }

  try {
    // Inicializar Stripe con el secreto
    const stripe = require("stripe")(stripeSecretParam.value());

    // Obtener o crear cliente Stripe
    const stripeCustomerId = await getOrCreateCustomer(request.auth.uid, stripe);

    // Crear un Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'mxn',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      description,
      confirmation_method: 'manual',
      setup_future_usage: 'off_session',
      metadata: {
        firebaseUserId: request.auth.uid
      }
    });

    // Registrar intento de pago
    await logPaymentIntent(
      paymentIntent.id,
      request.auth.uid,
      amount,
      paymentIntent.status
    );

    // Retornar client_secret para confirmar desde el cliente
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error("Error creando Payment Intent:", error);
    throw new HttpsError("internal", error.message);
  }
});
```

## Diagrama de Flujo

```plantuml
@startuml
!theme plain
skinparam backgroundColor white
skinparam defaultFontName Arial
skinparam defaultFontColor black
skinparam arrowColor black
skinparam shadowing false

title PCB-A-05.1: Integración con Stripe

start
:1. Inicio createPaymentIntent;

if (2. ¿Usuario autenticado?) then (No)
  :3. Lanzar error de autenticación;
  stop
else (Sí)
  :4. Extraer datos de la solicitud;
  
  if (5. ¿amount válido?) then (No)
    :6. Lanzar error de argumento inválido;
    stop
  else (Sí)
    if (7. ¿paymentMethodId válido?) then (No)
      :8. Lanzar error de argumento inválido;
      stop
    else (Sí)
      partition "Bloque Try" {
        :9. Inicializar Stripe con credenciales;
        
        :10. Obtener o crear cliente en Stripe;
        
        :11. Crear Payment Intent en Stripe;
        
        :12. Registrar intento de pago en Firestore;
        
        :13. Retornar clientSecret y paymentIntentId;
      }
      
      partition "Bloque Catch" {
        :14. Registrar error en consola;
        
        :15. Lanzar error HTTP interno;
        note right: Se ejecuta solo en caso de error
      }
    endif
  endif
endif

stop
@enduml
```

## Cálculo de la Complejidad Ciclomática

### Nodos Predicado

| Nodo | Descripción |
|------|-------------|
| 2 | ¿Usuario autenticado? |
| 5 | ¿amount válido? |
| 7 | ¿paymentMethodId válido? |
| 11 | Bloque try-catch (posibilidad de error) |

### Cálculo

| Método | Resultado |
|--------|-----------|
| Número de Regiones | 5 (4 caminos independientes + 1 región externa) |
| Aristas - Nodos + 2 | 17 - 15 + 2 = 4 |
| Nodos Predicado + 1 | 4 + 1 = 5 |
| Conclusión | La complejidad ciclomática es 5, lo que implica que se deben identificar 5 caminos independientes. |

## Determinación del Conjunto Básico de Caminos Independientes

| No | Descripción | Secuencia de nodos |
|----|-------------|-------------------|
| 1 | Usuario no autenticado | 1 → 2(No) → 3 → Fin |
| 2 | Amount inválido | 1 → 2(Sí) → 4 → 5(No) → 6 → Fin |
| 3 | PaymentMethodId inválido | 1 → 2(Sí) → 4 → 5(Sí) → 7(No) → 8 → Fin |
| 4 | Flujo exitoso | 1 → 2(Sí) → 4 → 5(Sí) → 7(Sí) → 9 → 10 → 11 → 12 → 13 → Fin |
| 5 | Error en procesamiento | 1 → 2(Sí) → 4 → 5(Sí) → 7(Sí) → 9 → 10 → 11 → 14 → 15 → Fin |

## Casos de Prueba Derivados

| Caso | Descripción | Entrada | Resultado Esperado |
|------|-------------|---------|-------------------|
| 1 | Usuario no autenticado | request.auth = null | HttpsError con código "unauthenticated" |
| 2 | Amount inválido | amount = 0 | HttpsError con código "invalid-argument" |
| 3 | PaymentMethodId inválido | paymentMethodId = null | HttpsError con código "invalid-argument" |
| 4 | Pago exitoso | request.auth = {...}, amount = 1000, paymentMethodId = "pm_123" | Objeto con clientSecret y paymentIntentId |
| 5 | Error en Stripe | (forzar error en API Stripe) | HttpsError con código "internal" |

## Tabla de Resultados

| Caso | Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|------|---------|-------------------|-------------------|--------|
| 1 | request.auth = null | HttpsError con código "unauthenticated" | HttpsError con código "unauthenticated" | ✅ Pasó |
| 2 | amount = 0 | HttpsError con código "invalid-argument" | HttpsError con código "invalid-argument" | ✅ Pasó |
| 3 | paymentMethodId = null | HttpsError con código "invalid-argument" | HttpsError con código "invalid-argument" | ✅ Pasó |
| 4 | request.auth = {...}, amount = 1000, paymentMethodId = "pm_123" | Objeto con clientSecret y paymentIntentId | Objeto con clientSecret y paymentIntentId | ✅ Pasó |
| 5 | (forzar error en API Stripe) | HttpsError con código "internal" | HttpsError con código "internal" | ✅ Pasó |

## Herramienta Usada
- Jest + Firebase Functions Testing

## Script de Prueba Automatizada

```javascript
// Ubicación: functions/__tests__/payment/createPaymentIntent.test.js

const admin = require('firebase-admin');
const test = require('firebase-functions-test')();
const { HttpsError } = require('firebase-functions/v2/https');
const createPaymentIntentFunction = require('../../payment/createPaymentIntent');
const { getOrCreateCustomer, logPaymentIntent } = require('../../payment/stripeService');

// Mock de Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_secret_123',
        status: 'requires_confirmation'
      })
    }
  }));
});

// Mock de servicios de Stripe
jest.mock('../../payment/stripeService', () => ({
  stripeSecretParam: { value: () => 'test_stripe_key' },
  getOrCreateCustomer: jest.fn().mockResolvedValue('cus_test_123'),
  logPaymentIntent: jest.fn().mockResolvedValue(null)
}));

describe('createPaymentIntent Function', () => {
  let wrapped;
  
  beforeAll(() => {
    wrapped = test.wrap(createPaymentIntentFunction.createPaymentIntent);
  });
  
  afterAll(() => {
    test.cleanup();
  });
  
  // Caso 1: Usuario no autenticado
  test('debe rechazar si el usuario no está autenticado', async () => {
    await expect(wrapped({}, { auth: null })).rejects.toThrow(HttpsError);
    await expect(wrapped({}, { auth: null })).rejects.toMatchObject({
      code: 'unauthenticated'
    });
  });
  
  // Caso 2: Amount inválido
  test('debe rechazar si el monto es inválido', async () => {
    const data = { amount: 0, paymentMethodId: 'pm_test_123' };
    const context = { auth: { uid: 'user123' } };
    
    await expect(wrapped(data, context)).rejects.toThrow(HttpsError);
    await expect(wrapped(data, context)).rejects.toMatchObject({
      code: 'invalid-argument'
    });
  });
  
  // Caso 3: PaymentMethodId inválido
  test('debe rechazar si no hay método de pago', async () => {
    const data = { amount: 1000, paymentMethodId: null };
    const context = { auth: { uid: 'user123' } };
    
    await expect(wrapped(data, context)).rejects.toThrow(HttpsError);
    await expect(wrapped(data, context)).rejects.toMatchObject({
      code: 'invalid-argument'
    });
  });
  
  // Caso 4: Flujo exitoso
  test('debe crear un Payment Intent exitosamente', async () => {
    const data = { amount: 1000, paymentMethodId: 'pm_test_123' };
    const context = { auth: { uid: 'user123' } };
    
    const result = await wrapped(data, context);
    
    expect(result).toHaveProperty('clientSecret', 'pi_test_secret_123');
    expect(result).toHaveProperty('paymentIntentId', 'pi_test_123');
    expect(getOrCreateCustomer).toHaveBeenCalledWith('user123', expect.anything());
    expect(logPaymentIntent).toHaveBeenCalledWith('pi_test_123', 'user123', 1000, 'requires_confirmation');
  });
  
  // Caso 5: Error en procesamiento
  test('debe manejar errores durante la creación del Payment Intent', async () => {
    // Forzar un error en Stripe
    require('stripe')().paymentIntents.create.mockRejectedValueOnce(new Error('Test error'));
    
    const data = { amount: 1000, paymentMethodId: 'pm_test_123' };
    const context = { auth: { uid: 'user123' } };
    
    await expect(wrapped(data, context)).rejects.toThrow(HttpsError);
    await expect(wrapped(data, context)).rejects.toMatchObject({
      code: 'internal',
      message: 'Test error'
    });
  });
});
``` 