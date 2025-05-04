// functions/payment/stripeWebhookHandler.js
const { onRequest } = require("firebase-functions/v2/https"); // <-- Importar v2 onRequest
const admin = require('firebase-admin');
const stripe = require('stripe'); // <-- Solo requerir, no inicializar globalmente con clave v1
const { stripeWebhookSecretParam } = require("./stripeService"); // <-- Importar el secreto v2

// Asegúrate de inicializar Firebase Admin si aún no lo está
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Manejador para los webhooks de Stripe.
 * Escucha eventos como payment_intent.succeeded y payment_intent.payment_failed
 * para actualizar el estado de la orden en Firestore.
 */
exports.handleStripeWebhook = onRequest({
  region: "us-central1", // Opcional, pero bueno tenerlo
  secrets: [stripeWebhookSecretParam] // <-- Declarar dependencia del secreto v2
}, async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = stripeWebhookSecretParam.value(); // <-- Acceder al valor del secreto v2

  let event;
  try {
    // La verificación sigue usando el SDK de stripe, pero con el secreto obtenido de v2
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Manejar el evento específico
  console.log(`Received Stripe event: ${event.type}`);
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent ${paymentIntent.id} succeeded.`);
      // TODO: Buscar la orden en Firestore usando paymentIntent.id
      // (Necesitamos asegurarnos de guardar el paymentIntentId en la orden)
      // TODO: Actualizar el estado de la orden a 'processing' o 'completed'
      try {
        // Placeholder: Lógica para encontrar y actualizar la orden
        const orderRef = db.collection('orders').where('payment.paymentIntentId', '==', paymentIntent.id).limit(1);
        const orderSnapshot = await orderRef.get();

        if (orderSnapshot.empty) {
          console.error(`No order found for PaymentIntent ID: ${paymentIntent.id}`);
          // Aún así respondemos 200 OK a Stripe para que no reintente este evento
          return res.status(200).send('Order not found, but webhook received.');
        }

        const orderDoc = orderSnapshot.docs[0];
        console.log(`Updating order ${orderDoc.id} status to processing.`);
        await orderDoc.ref.update({
          status: 'processing', // O 'completed' si aplica
          'payment.status': 'succeeded', // Actualizar también el estado del pago
           updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Order ${orderDoc.id} updated successfully.`);

      } catch (dbError) {
        console.error(`Error updating order for PaymentIntent ${paymentIntent.id}:`, dbError);
        // Respondemos 500 para que Stripe pueda reintentar si falla la DB
        return res.status(500).send('Database error processing webhook.');
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntentFailed = event.data.object;
      const paymentIntentId = paymentIntentFailed.id;
      let orderId = paymentIntentFailed.metadata?.orderId; // Extraer de metadata

      console.warn(`PaymentIntent ${paymentIntentId} failed.`);

      if (!orderId) {
        // Intentar buscar por paymentIntentId si no está en metadata (menos ideal)
        console.warn(`No orderId in metadata for failed PI ${paymentIntentId}. Attempting lookup.`);
        try {
          const orderQuery = db.collection("orders").where("payment.paymentIntentId", "==", paymentIntentId).limit(1);
          const orderSnapshot = await orderQuery.get();
          if (!orderSnapshot.empty) {
            orderId = orderSnapshot.docs[0].id;
            console.log(`Found order ${orderId} via PI lookup.`);
          } else {
            console.error(`No order found matching failed PI ${paymentIntentId} via lookup.`);
            // Si no encontramos la orden de ninguna forma, no podemos hacer nada más.
            return res.status(200).send("Webhook received, but no matching order found for failed PI.");
          }
        } catch(lookupError) {
          console.error(`Error looking up order for failed PI ${paymentIntentId}:`, lookupError);
          return res.status(500).send("DB error during order lookup for failed PI.");
        }
      }

      // Ahora tenemos orderId (de metadata o lookup)
      console.info(`Processing failure for order ${orderId}. Attempting stock restore.`);
      const orderRef = db.collection("orders").doc(orderId);

      try {
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) {
          console.error(`Order ${orderId} not found during failure processing.`);
          return res.status(200).send("Webhook received, order not found.");
        }

        const orderData = orderSnap.data();
        const itemsToRestore = orderData.items;

        // Validar items y proceder con la restauración
        if (Array.isArray(itemsToRestore) && itemsToRestore.length > 0) {
          console.info(`Restoring stock for ${itemsToRestore.length} item types in order ${orderId}.`);
          await db.runTransaction(async (transaction) => {
            const productUpdates = [];
            for (const item of itemsToRestore) {
              if (!item.id || !item.quantity || item.quantity <= 0) {
                console.warn(`Skipping invalid item during stock restore: ${JSON.stringify(item)}`);
                continue;
              }
              const productRef = db.collection("products").doc(item.id);
              // Leer DENTRO de la transacción
              const productDoc = await transaction.get(productRef);
              if (!productDoc.exists) {
                console.warn(`Product ${item.id} not found during stock restore for order ${orderId}.`);
                continue;
              }
              const currentStock = productDoc.data().stock || 0;
              const newStock = currentStock + item.quantity;
              transaction.update(productRef, { 
                stock: newStock,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(), 
              });
              productUpdates.push({ id: item.id, old: currentStock, new: newStock, restored: item.quantity });
            }
            console.info(`Stock restoration transaction prepared for order ${orderId}:`, productUpdates);
            // La transacción se confirma automáticamente si no hay errores aquí
          });
          console.info(`Stock successfully restored for order ${orderId}.`);
        } else {
          console.warn(`No valid items found in order ${orderId} to restore stock.`);
        }

        // Siempre actualizar el estado de la orden a fallido
        console.info(`Updating order ${orderId} status to failed.`);
        await orderRef.update({
          status: "failed",
          "payment.status": "failed",
          "payment.error": paymentIntentFailed.last_payment_error?.message || "Payment failed",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.info(`Order ${orderId} updated to failed.`);

      } catch (error) {
        console.error(`Error during stock restore/update for order ${orderId}:`, error);
        // Intentar marcar como fallido si la transacción falló
        try {
          await orderRef.update({ 
            status: "failed", 
            "payment.status": "failed",
            "payment.error": "Error during failure processing loop",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (fallbackError) {
          console.error(`Fallback status update failed for order ${orderId}:`, fallbackError);
        }
        return res.status(500).send("Error processing payment failure webhook.");
      }
      break;
    }
    // ... maneja otros tipos de eventos si es necesario
    // ej. 'charge.succeeded', 'checkout.session.completed'
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // 3. Responder a Stripe para confirmar la recepción del evento
  res.status(200).send('Webhook received successfully.');
}); 