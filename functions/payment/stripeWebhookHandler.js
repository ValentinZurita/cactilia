// functions/payment/stripeWebhookHandler.js
const { onRequest } = require("firebase-functions/v2/https"); // <-- Importar v2 onRequest
const admin = require('firebase-admin');
const stripe = require('stripe'); // <-- Solo requerir, no inicializar globalmente con clave v1
const { stripeWebhookSecretParam } = require("./stripeService"); // <-- Importar el secreto v2
const { sendEmail, sendgridApiKey, defaultSender } = require("../services/emailService");
const { getOrderConfirmationTemplate } = require('../templates/orderTemplates');

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
  secrets: [stripeWebhookSecretParam, sendgridApiKey, defaultSender] // <-- Declarar dependencia del secreto v2 y de email
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
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.orderId;

  switch (event.type) {
    case 'payment_intent.requires_action': {
      console.log(`PaymentIntent ${paymentIntent.id} requires action.`);
      if (paymentIntent.next_action?.type === 'oxxo_display_details') {
        console.log(`OXXO details ready for PaymentIntent ${paymentIntent.id}.`);

        if (!orderId) {
          console.error(`Webhook Error: Missing orderId in metadata for PaymentIntent ${paymentIntent.id} requiring OXXO action.`);
          return res.status(200).send('Webhook received, but missing orderId metadata.');
        }

        try {
          console.log(`[Webhook] Adding 5-second delay for potential Firestore consistency before reading order ${orderId}...`);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
          console.log(`[Webhook] Delay finished for order ${orderId}. Reading document...`);
          
          const orderDoc = await db.collection('orders').doc(orderId).get();
          if (!orderDoc.exists) {
            console.error(`Webhook Error: Order ${orderId} not found for OXXO PI ${paymentIntent.id}.`);
            return res.status(200).send('Webhook received, order not found.');
          }
          const orderData = orderDoc.data();

          // >>> LOG DE DIAGNÓSTICO <<<
          console.log(`[Webhook] Read order data for ${orderId}. Payment object:`, JSON.stringify(orderData.payment || null));
          // >>> FIN LOG <<<

          if (orderData.emailStatus?.oxxoVoucherSent) {
            console.log(`OXXO voucher email already sent for order ${orderId}. Skipping.`);
            return res.status(200).send('Webhook received, email already sent.');
          }

          // Obtener datos del usuario (email)
          const userDoc = await db.collection('users').doc(orderData.userId).get();
          // Corregir: usar la propiedad .exists en lugar de la función exists()
          const userEmail = userDoc.exists ? userDoc.data().email : null;

          if (!userEmail) {
            console.error(`Webhook Error: User email not found for user ${orderData.userId} in order ${orderId}.`);
            return res.status(200).send('Webhook received, user email not found.');
          }

          // --- VALIDACIÓN CORREGIDA ---
          // Verificar si existe el objeto voucherDetails y tiene al menos la URL
          if (!orderData.payment?.voucherDetails?.hosted_voucher_url) {
            console.error(`Webhook Error: Missing OXXO voucherDetails or hosted_voucher_url in order ${orderId}. Frontend might not have saved them correctly or completely. Payment object read:`, JSON.stringify(orderData.payment || null));
            // Devolver 200 para que Stripe no reintente indefinidamente si es un error persistente del frontend
            return res.status(200).send('Webhook received, but missing necessary OXXO voucher details in order document.');
          }
          // --- FIN VALIDACIÓN CORREGIDA ---

          // >>> INICIO: Obtener remitente desde Firestore <<<
          let senderEmail = null;
          try {
            const settingsDoc = await db.collection('settings').doc('company_info').get();
            if (settingsDoc.exists) {
              senderEmail = settingsDoc.data()?.contact?.email;
              console.log(`[Webhook] Sender email fetched from Firestore: ${senderEmail}`);
            }
            if (!senderEmail) { // Fallback si no existe doc o campo
              console.warn(`[Webhook] Sender email not found in settings/company_info. Falling back to default sender secret.`);
              senderEmail = defaultSender.value(); // Usa el secreto como fallback
            }
            if (!senderEmail) { // Doble fallback si el secreto tampoco existe
               console.error('[Webhook] CRITICAL: Sender email could not be determined from Firestore or Secret!');
               senderEmail = 'error@cactilia.com'; // Fallback extremo
            }
          } catch (dbError) {
            console.error(`[Webhook] Error fetching sender email from Firestore:`, dbError);
            senderEmail = defaultSender.value() || 'error@cactilia.com'; // Fallback en caso de error DB
          }
          // >>> FIN: Obtener remitente desde Firestore <<<

          const emailContent = getOrderConfirmationTemplate(orderData, orderId);

          const emailData = {
            to: userEmail,
            subject: `Tu Recibo de Pago OXXO para el Pedido #${orderId}`,
            html: emailContent
            // No necesitamos 'from' aquí, se pasará a sendEmail
          };

          console.log(`Attempting to send OXXO voucher email for order ${orderId} to ${userEmail} FROM ${senderEmail}`);
          const emailSent = await sendEmail(
            emailData,
            sendgridApiKey.value(),
            senderEmail // <--- Usar el email obtenido de Firestore (o fallback)
          );

          if (emailSent) {
            console.log(`OXXO voucher email successfully sent for order ${orderId}.`);
            await orderDoc.ref.update({
              'emailStatus.oxxoVoucherSent': true,
              'emailStatus.oxxoVoucherSentAt': admin.firestore.FieldValue.serverTimestamp()
            });
          } else {
            console.error(`Failed to send OXXO voucher email for order ${orderId}.`);
            return res.status(500).send('Webhook processing failed: Email sending failed.');
          }

        } catch (error) {
          console.error(`Webhook Error processing OXXO requires_action for order ${orderId}:`, error);
          return res.status(500).send('Webhook processing failed due to internal error.');
        }
      } else {
        console.log(`PaymentIntent ${paymentIntent.id} requires action, but not OXXO type (${paymentIntent.next_action?.type}). Skipping email.`);
      }
      break;
    }
    case 'payment_intent.succeeded': {
      console.log(`PaymentIntent ${paymentIntent.id} succeeded.`);
      try {
        const orderRef = db.collection('orders').where('payment.paymentIntentId', '==', paymentIntent.id).limit(1);
        const orderSnapshot = await orderRef.get();

        if (orderSnapshot.empty) {
          console.error(`No order found for PaymentIntent ID: ${paymentIntent.id}`);
          return res.status(200).send('Order not found, but webhook received.');
        }

        const orderDoc = orderSnapshot.docs[0];
        console.log(`Updating order ${orderDoc.id} status to processing.`);
        await orderDoc.ref.update({
          status: 'processing',
          'payment.status': 'succeeded',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Order ${orderDoc.id} updated successfully.`);

      } catch (dbError) {
        console.error(`Error updating order for PaymentIntent ${paymentIntent.id}:`, dbError);
        return res.status(500).send('Database error processing webhook.');
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      console.warn(`PaymentIntent ${paymentIntent.id} failed.`);

      if (!orderId) {
        console.warn(`No orderId in metadata for failed PI ${paymentIntent.id}. Attempting lookup.`);
        try {
          const orderQuery = db.collection("orders").where("payment.paymentIntentId", "==", paymentIntent.id).limit(1);
          const orderSnapshot = await orderQuery.get();
          if (!orderSnapshot.empty) {
            orderId = orderSnapshot.docs[0].id;
            console.log(`Found order ${orderId} via PI lookup.`);
          } else {
            console.error(`No order found matching failed PI ${paymentIntent.id} via lookup.`);
            return res.status(200).send("Webhook received, but no matching order found for failed PI.");
          }
        } catch (lookupError) {
          console.error(`Error looking up order for failed PI ${paymentIntent.id}:`, lookupError);
          return res.status(500).send('Database error processing webhook.');
        }
      }
      break;
    }
  }

  return res.status(200).send('Webhook processed successfully.');
});