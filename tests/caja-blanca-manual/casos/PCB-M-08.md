# PCB-M-08: PROCESAMIENTO DE CONFIRMACIÓN DE PAGO

## Módulo del sistema:
Checkout - Pagos

## Historia de usuario: 
HU-C08 - Como cliente quiero recibir confirmación cuando mi pago ha sido procesado exitosamente para tener seguridad de mi compra

## Número y nombre de la prueba:
PCB-M-08 - Procesamiento de confirmación de pago

## Realizado por:
Valentin Alejandro Perez Zurita

## Fecha
18 de Abril del 2025


## Código Fuente


```js
/**
 * Cloud Function para confirmar el pago de una orden
 * Extracto de functions/payment/paymentIntents.js
 */
exports.confirmOrderPayment = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam]
}, async (request) => {
  // Verificar autenticación
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Debes iniciar sesión para confirmar pagos"
    );
  }

  const { orderId, paymentIntentId } = request.data;

  // Validar datos
  if (!orderId) {
    throw new HttpsError(
      "invalid-argument",
      "Se requiere un ID de orden"
    );
  }

  if (!paymentIntentId) {
    throw new HttpsError(
      "invalid-argument",
      "Se requiere un ID de Payment Intent"
    );
  }

  try {
    // Inicializar Stripe con el secreto
    const stripe = require("stripe")(stripeSecretParam.value());

    // Obtener la orden
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      throw new Error("La orden no existe");
    }

    const orderData = orderSnap.data();

    // Verificar que la orden pertenezca al usuario autenticado
    if (orderData.userId !== request.auth.uid) {
      throw new HttpsError(
        "permission-denied",
        "No tienes permiso para confirmar esta orden"
      );
    }

    // Consultar el estado del Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Actualizar el registro de Payment Intent
    await updatePaymentIntentStatus(paymentIntentId, paymentIntent.status);

    // Determinar el estado de la orden basado en el resultado del pago
    let orderStatus;
    let paymentStatus;

    switch (paymentIntent.status) {
      case 'succeeded':
        orderStatus = 'processing'; // La orden pasa a procesamiento
        paymentStatus = 'succeeded';
        break;
      case 'processing':
        orderStatus = 'pending';
        paymentStatus = 'processing';
        break;
      case 'requires_payment_method':
        orderStatus = 'payment_failed';
        paymentStatus = 'failed';
        break;
      case 'requires_action':
        orderStatus = 'pending';
        paymentStatus = 'requires_action';
        break;
      case 'canceled':
        orderStatus = 'cancelled';
        paymentStatus = 'cancelled';
        break;
      default:
        orderStatus = 'pending';
        paymentStatus = paymentIntent.status;
    }

    // Actualizar la orden con el estado actual
    await orderRef.update({
      status: orderStatus,
      'payment.status': paymentStatus,
      'payment.lastPaymentIntentStatus': paymentIntent.status,
      'payment.lastUpdated': admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Si el pago fue exitoso, actualizar el inventario
    if (paymentStatus === 'succeeded') {
      try {
        await updateInventory(orderData.items);
      } catch (inventoryError) {
        console.error("Error actualizando inventario:", inventoryError);
        // No interrumpir el flujo si falla la actualización de inventario
      }

      // Enviar email de confirmación
      try {
        await sendOrderConfirmationEmail(orderId);
      } catch (emailError) {
        console.error("Error enviando email de confirmación:", emailError);
        // No interrumpir si falla el envío del email
      }
    }

    return {
      success: true,
      orderStatus,
      paymentStatus,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret
      }
    };
  } catch (error) {
    console.error("Error confirmando pago:", error);
    throw new HttpsError("internal", error.message);
  }
});
```




## Diagrama de flujo


```plantuml
@startuml
!theme plain
skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam ArrowFontSize 11

title Función confirmOrderPayment - Procesamiento de confirmación de pago

start

' 1 - Decisión 1
if (¿Usuario autenticado?) then (No)
  ' 2
  :2. Lanzar error de autenticación;
  stop
else (Sí)
endif

' 3
:3. Extraer orderId y paymentIntentId de request;

' 4 - Decisión 2
if (¿orderId válido?) then (No)
  ' 5
  :5. Lanzar error de argumento inválido;
  stop
else (Sí)
endif

' 6 - Decisión 3
if (¿paymentIntentId válido?) then (No)
  ' 7
  :7. Lanzar error de argumento inválido;
  stop
else (Sí)
endif

partition "Bloque Try" {
  ' 8
  :8. Inicializar cliente Stripe;
  
  ' 9
  :9. Obtener datos de la orden;
  
  ' 10 - Decisión 4
  if (¿Orden existe?) then (No)
    ' 11
    :11. Lanzar error de orden inexistente;
    stop
  else (Sí)
  endif
  
  ' 12 - Decisión 5
  if (¿Orden pertenece al usuario?) then (No)
    ' 13
    :13. Lanzar error de permisos;
    stop
  else (Sí)
  endif
  
  ' 14
  :14. Consultar estado del PaymentIntent en Stripe;
  
  ' 15
  :15. Actualizar registro del PaymentIntent;
  
  ' 16
  :16. Determinar estados según resultado del pago;
  
  ' 17 - Decisión 6 (Switch)
  switch (paymentIntent.status)
    case (succeeded)
      ' 18
      :18. orderStatus = processing, paymentStatus = succeeded;
    case (processing)
      ' 19
      :19. orderStatus = pending, paymentStatus = processing;
    case (requires_payment_method)
      ' 20
      :20. orderStatus = payment_failed, paymentStatus = failed;
    case (requires_action)
      ' 21
      :21. orderStatus = pending, paymentStatus = requires_action;
    case (canceled)
      ' 22
      :22. orderStatus = cancelled, paymentStatus = cancelled;
    case (default)
      ' 23
      :23. orderStatus = pending, paymentStatus = status original;
  endswitch
  
  ' 24
  :24. Actualizar orden con nuevos estados;
  
  ' 25 - Decisión 7
  if (¿Pago exitoso (succeeded)?) then (Sí)
    ' 26
    :26. Actualizar inventario;
    
    ' 27 - Decisión 8
    if (¿Error en actualización?) then (Sí)
      ' 28
      :28. Registrar error y continuar;
    else (No)
    endif
    
    ' 29
    :29. Enviar email de confirmación;
    
    ' 30 - Decisión 9
    if (¿Error en envío de email?) then (Sí)
      ' 31
      :31. Registrar error y continuar;
    else (No)
    endif
  else (No)
    ' 32
    :32. No realizar acciones adicionales;
  endif
  
  ' 33
  :33. Retornar respuesta exitosa;
}

partition "Bloque Catch" {
  ' 34
  :34. Registrar error;
  ' 35
  :35. Lanzar HttpsError;
}

stop

@enduml
```




## Cálculo de la Complejidad Ciclomática


**Número de regiones:**
- Regiones: 11

**Fórmula Aristas - Nodos + 2**
- Nodos: 35
- Aristas: 44
- Cálculo: V(G) = 44 - 35 + 2 = 11

**Nodos predicado + 1**
- Nodos predicado (decisiones): 10
  1. Decisión 1: ¿Usuario autenticado? (Nodo 1)
  2. Decisión 2: ¿orderId válido? (Nodo 4)
  3. Decisión 3: ¿paymentIntentId válido? (Nodo 6)
  4. Decisión 4: ¿Orden existe? (Nodo 10)
  5. Decisión 5: ¿Orden pertenece al usuario? (Nodo 12)
  6. Decisión 6: Switch paymentIntent.status (Nodo 17, con 6 casos)
  7. Decisión 7: ¿Pago exitoso? (Nodo 25)
  8. Decisión 8: ¿Error en actualización? (Nodo 27)
  9. Decisión 9: ¿Error en envío de email? (Nodo 30)
  10. Decisión implícita del bloque try-catch (entre nodo 8 y nodo 34)
- Cálculo: V(G) = 10 + 1 = 11

**Conclusión:** La complejidad ciclomática es 11, lo que implica que se deben identificar 11 caminos independientes dentro del grafo.




## Determinación del Conjunto Básico de Caminos Independientes


| Nº | Descripción | Secuencia de nodos |
|---|---|---|
| 1 | Error: usuario no autenticado | 1(No) → 2 → Fin |
| 2 | Error: orderId inválido | 1(Sí) → 3 → 4(No) → 5 → Fin |
| 3 | Error: paymentIntentId inválido | 1(Sí) → 3 → 4(Sí) → 6(No) → 7 → Fin |
| 4 | Error: orden no existe | 1(Sí) → 3 → 4(Sí) → 6(Sí) → 8 → 9 → 10(No) → 11 → Fin |
| 5 | Error: orden no pertenece al usuario | 1(Sí) → 3 → 4(Sí) → 6(Sí) → 8 → 9 → 10(Sí) → 12(No) → 13 → Fin |
| 6 | Pago exitoso (succeeded) sin errores | 1(Sí) → 3 → 4(Sí) → 6(Sí) → 8 → 9 → 10(Sí) → 12(Sí) → 14 → 15 → 16 → 17(succeeded) → 18 → 24 → 25(Sí) → 26 → 27(No) → 29 → 30(No) → 33 → Fin |
| 7 | Pago en procesamiento (processing) | 1(Sí) → 3 → 4(Sí) → 6(Sí) → 8 → 9 → 10(Sí) → 12(Sí) → 14 → 15 → 16 → 17(processing) → 19 → 24 → 25(No) → 32 → 33 → Fin |
| 8 | Pago fallido (requires_payment_method) | 1(Sí) → 3 → 4(Sí) → 6(Sí) → 8 → 9 → 10(Sí) → 12(Sí) → 14 → 15 → 16 → 17(requires_payment_method) → 20 → 24 → 25(No) → 32 → 33 → Fin |
| 9 | Pago exitoso con error en inventario | 1(Sí) → 3 → 4(Sí) → 6(Sí) → 8 → 9 → 10(Sí) → 12(Sí) → 14 → 15 → 16 → 17(succeeded) → 18 → 24 → 25(Sí) → 26 → 27(Sí) → 28 → 29 → 30(No) → 33 → Fin |
| 10 | Pago exitoso con error en email | 1(Sí) → 3 → 4(Sí) → 6(Sí) → 8 → 9 → 10(Sí) → 12(Sí) → 14 → 15 → 16 → 17(succeeded) → 18 → 24 → 25(Sí) → 26 → 27(No) → 29 → 30(Sí) → 31 → 33 → Fin |
| 11 | Error inesperado (excepción) | 1(Sí) → 3 → 4(Sí) → 6(Sí) → 8 → (excepción) → 34 → 35 → Fin |



## Derivación de Casos de Prueba


| Camino | Caso de Prueba | Datos de Entrada | Resultado Esperado |
|---|---|---|---|
| 1 | Usuario no autenticado | request.auth = null | Se lanza HttpsError con código "unauthenticated" y mensaje "Debes iniciar sesión para confirmar pagos" |
| 2 | orderId inválido | request.auth = { uid: "user123" }, request.data = { orderId: null, paymentIntentId: "pi_123" } | Se lanza HttpsError con código "invalid-argument" y mensaje "Se requiere un ID de orden" |
| 3 | paymentIntentId inválido | request.auth = { uid: "user123" }, request.data = { orderId: "order123", paymentIntentId: null } | Se lanza HttpsError con código "invalid-argument" y mensaje "Se requiere un ID de Payment Intent" |
| 4 | Orden no existe | request.auth = { uid: "user123" }, request.data = { orderId: "order456", paymentIntentId: "pi_123" }, orderSnap.exists = false | Se lanza Error con mensaje "La orden no existe" |
| 5 | Orden no pertenece al usuario | request.auth = { uid: "user123" }, request.data = { orderId: "order789", paymentIntentId: "pi_123" }, orderData = { userId: "user456" } | Se lanza HttpsError con código "permission-denied" y mensaje "No tienes permiso para confirmar esta orden" |
| 6 | Pago exitoso sin errores | request.auth = { uid: "user123" }, request.data = { orderId: "order123", paymentIntentId: "pi_123" }, paymentIntent.status = "succeeded" | Se actualiza la orden con status "processing", se actualiza el inventario, se envía email, y se retorna respuesta con success=true |
| 7 | Pago en procesamiento | request.auth = { uid: "user123" }, request.data = { orderId: "order123", paymentIntentId: "pi_123" }, paymentIntent.status = "processing" | Se actualiza la orden con status "pending", no se actualiza inventario, no se envía email, y se retorna respuesta con success=true |
| 8 | Pago fallido | request.auth = { uid: "user123" }, request.data = { orderId: "order123", paymentIntentId: "pi_123" }, paymentIntent.status = "requires_payment_method" | Se actualiza la orden con status "payment_failed", no se actualiza inventario, no se envía email, y se retorna respuesta con success=true |
| 9 | Pago exitoso con error en inventario | request.auth = { uid: "user123" }, request.data = { orderId: "order123", paymentIntentId: "pi_123" }, paymentIntent.status = "succeeded", updateInventory lanza error | Se registra error de inventario pero se continúa, se envía email, y se retorna respuesta con success=true |
| 10 | Pago exitoso con error en email | request.auth = { uid: "user123" }, request.data = { orderId: "order123", paymentIntentId: "pi_123" }, paymentIntent.status = "succeeded", sendOrderConfirmationEmail lanza error | Se registra error de email pero se continúa, y se retorna respuesta con success=true |
| 11 | Error inesperado | request.auth = { uid: "user123" }, request.data = { orderId: "order123", paymentIntentId: "pi_123" }, stripe.paymentIntents.retrieve lanza error | Se registra error y se lanza HttpsError con código "internal" |
</rewritten_file> 