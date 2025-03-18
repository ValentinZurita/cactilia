const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret);

// Verificar si Firebase Admin ya está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function para crear un Payment Intent de Stripe
 * Permite procesar un pago con un método de pago existente
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  // Verificar si el usuario está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Debes iniciar sesión para realizar pagos"
    );
  }

  const { amount, paymentMethodId, description = "Compra en Cactilia" } = data;

  // Validar datos
  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "El monto debe ser mayor a cero"
    );
  }

  if (!paymentMethodId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Se requiere un método de pago"
    );
  }

  try {
    // Obtener el Stripe Customer ID asociado al usuario
    const userSnapshot = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    let stripeCustomerId = userSnapshot.exists ? userSnapshot.data().stripeCustomerId : null;

    // Si no hay Stripe Customer, crear uno
    if (!stripeCustomerId) {
      const user = await admin.auth().getUser(context.auth.uid);

      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName || '',
        metadata: {
          firebaseUserId: context.auth.uid
        }
      });

      stripeCustomerId = customer.id;

      // Guardar el ID del customer en Firestore
      await admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .set({
          stripeCustomerId
        }, { merge: true });
    }

    // Crear un Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Stripe requiere el monto en centavos
      currency: 'mxn', // Moneda mexicana
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      description,
      confirmation_method: 'manual', // Confirmar manualmente para evitar cobros inmediatos
      setup_future_usage: 'off_session', // Permite usar este método para pagos futuros
      metadata: {
        firebaseUserId: context.auth.uid
      }
    });

    // Retornar client_secret para confirmar el pago desde el cliente
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error("Error creando Payment Intent:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Cloud Function para confirmar el pago de una orden
 * Actualiza el estado de la orden y verifica el estado del pago
 */
exports.confirmOrderPayment = functions.https.onCall(async (data, context) => {
  // Verificar si el usuario está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Debes iniciar sesión para confirmar pagos"
    );
  }

  const { orderId, paymentIntentId } = data;

  // Validar datos
  if (!orderId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Se requiere un ID de orden"
    );
  }

  if (!paymentIntentId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Se requiere un ID de Payment Intent"
    );
  }

  try {
    // Obtener la orden
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      throw new Error("La orden no existe");
    }

    const orderData = orderSnap.data();

    // Verificar que la orden pertenezca al usuario autenticado
    if (orderData.userId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "No tienes permiso para confirmar esta orden"
      );
    }

    // Consultar el estado del Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Actualizar el estado de la orden según el estado del pago
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
      case 'canceled':
        orderStatus = 'cancelled';
        paymentStatus = 'cancelled';
        break;
      default:
        orderStatus = 'pending';
        paymentStatus = paymentIntent.status;
    }

    // Actualizar la orden con el estado del pago
    await orderRef.update({
      status: orderStatus,
      'payment.status': paymentStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Si el pago fue exitoso, actualizar el inventario
    if (paymentStatus === 'succeeded') {
      await updateInventory(orderData.items);
    }

    return {
      success: true,
      orderStatus,
      paymentStatus
    };
  } catch (error) {
    console.error("Error confirmando pago:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Función para actualizar el inventario después de una compra exitosa
 * @param {Array} items - Productos comprados
 */
async function updateInventory(items) {
  // Obtener un batch para hacer múltiples actualizaciones
  const batch = admin.firestore().batch();

  // Iterar sobre cada producto en la orden
  for (const item of items) {
    const productRef = admin.firestore().collection('products').doc(item.id);
    const productSnap = await productRef.get();

    if (productSnap.exists) {
      const product = productSnap.data();
      const newStock = Math.max(0, (product.stock || 0) - item.quantity);

      // Actualizar el stock
      batch.update(productRef, {
        stock: newStock,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  // Ejecutar todas las actualizaciones en un batch
  await batch.commit();
}

/**
 * Cloud Function para generar facturas (integración con servicio de facturación)
 */
exports.generateInvoice = functions.https.onCall(async (data, context) => {
  // Verificar si el usuario está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Debes iniciar sesión para solicitar facturas"
    );
  }

  const { orderId, fiscalData } = data;

  // Validar datos
  if (!orderId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Se requiere un ID de orden"
    );
  }

  if (!fiscalData || !fiscalData.rfc || !fiscalData.businessName) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Se requieren datos fiscales completos"
    );
  }

  try {
    // Obtener la orden
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      throw new Error("La orden no existe");
    }

    const orderData = orderSnap.data();

    // Verificar que la orden pertenezca al usuario autenticado
    if (orderData.userId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "No tienes permiso para facturar esta orden"
      );
    }

    // Verificar que la orden esté pagada
    if (orderData.status !== 'processing' && orderData.status !== 'completed') {
      throw new Error("La orden debe estar pagada para generar factura");
    }

    // Aquí iría la integración con el servicio de facturación electrónica
    // Este es un ejemplo simulado:

    // 1. Preparar datos para el servicio de facturación
    const invoiceData = {
      receptor: {
        rfc: fiscalData.rfc,
        nombre: fiscalData.businessName,
        regimenFiscal: fiscalData.regimenFiscal || '601',
        usoCfdi: fiscalData.usoCFDI || 'G03'
      },
      conceptos: orderData.items.map(item => ({
        claveProdServ: '01010101', // Código general por defecto
        cantidad: item.quantity,
        claveUnidad: 'H87', // Pieza
        unidad: 'PZA',
        descripcion: item.name,
        valorUnitario: (item.price * 0.84).toFixed(2), // Quitar IVA
        importe: (item.price * item.quantity * 0.84).toFixed(2), // Subtotal
        impuestos: {
          traslados: [{
            base: (item.price * item.quantity * 0.84).toFixed(2),
            impuesto: '002', // IVA
            tipoFactor: 'Tasa',
            tasaOCuota: '0.160000', // 16%
            importe: (item.price * item.quantity * 0.16).toFixed(2) // Monto del IVA
          }]
        }
      })),
      total: orderData.totals.finalTotal.toFixed(2),
      subtotal: orderData.totals.subtotal.toFixed(2),
      moneda: 'MXN',
      formaPago: '04', // Tarjeta de crédito
      metodoPago: 'PUE', // Pago en una sola exhibición
    };

    // 2. Simular llamada a servicio de facturación
    // En un caso real, aquí se llamaría a un servicio de facturación electrónica
    console.log("Generando factura con datos:", invoiceData);

    // Generar un ID de factura ficticio
    const mockInvoiceId = `INV-${Date.now()}`;

    // 3. Actualizar la orden con el ID de factura
    await orderRef.update({
      'billing.requiresInvoice': true,
      'billing.fiscalData': fiscalData,
      'billing.invoiceId': mockInvoiceId,
      'billing.invoiceDate': admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      invoiceId: mockInvoiceId
    };
  } catch (error) {
    console.error("Error generando factura:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});