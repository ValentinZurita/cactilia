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
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent ${paymentIntent.id} failed.`);
      // TODO: Buscar la orden en Firestore usando paymentIntent.id
      // TODO: Actualizar el estado de la orden a 'payment_failed'
       try {
        // Placeholder: Lógica para encontrar y actualizar la orden
        const orderRef = db.collection('orders').where('payment.paymentIntentId', '==', paymentIntent.id).limit(1);
        const orderSnapshot = await orderRef.get();

        if (orderSnapshot.empty) {
          console.error(`No order found for failed PaymentIntent ID: ${paymentIntent.id}`);
          return res.status(200).send('Order not found, but webhook received.');
        }

        const orderDoc = orderSnapshot.docs[0];
         console.log(`Updating order ${orderDoc.id} status to payment_failed.`);
        await orderDoc.ref.update({
          status: 'payment_failed',
          'payment.status': 'failed', // Actualizar también el estado del pago
           updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
         console.log(`Order ${orderDoc.id} updated to payment_failed.`);

      } catch (dbError) {
        console.error(`Error updating order for failed PaymentIntent ${paymentIntent.id}:`, dbError);
        return res.status(500).send('Database error processing webhook.');
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