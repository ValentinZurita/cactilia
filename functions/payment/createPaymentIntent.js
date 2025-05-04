// functions/payment/paymentIntents.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { stripeSecretParam, getOrCreateCustomer, logPaymentIntent, updatePaymentIntentStatus } = require("./stripeService");

/**
 * Cloud Function to create a Stripe Payment Intent
 */
exports.createPaymentIntent = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam],
  cors: ['http://localhost:5174', 'http://localhost:5173']
}, async (request) => {
  // --- Añadir Log de Inicio ---
  console.log("*** createPaymentIntent function started ***");
  console.log("Auth context:", request.auth ? request.auth.uid : 'No auth');
  console.log("Request data:", JSON.stringify(request.data)); // Loguear datos recibidos
  // --- Fin Log de Inicio ---

  // Verify authentication
  if (!request.auth) {
    console.error("Authentication failed: No auth context found."); // Log específico
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to make payments"
    );
  }

  const { 
    amount, 
    paymentMethodId, 
    description = "Purchase at Cactilia", 
    savePaymentMethod = false
  } = request.data;
  
  console.log("Received savePaymentMethod flag:", savePaymentMethod);

  // Validate data
  if (!amount || amount <= 0) {
    console.error("Validation failed: Invalid amount.", amount); // Log específico
    throw new HttpsError(
      "invalid-argument",
      "Amount must be greater than zero"
    );
  }

  if (!paymentMethodId) {
    console.error("Validation failed: Missing paymentMethodId."); // Log específico
    throw new HttpsError(
      "invalid-argument",
      "Payment method is required"
    );
  }

  try {
    console.log("Initializing Stripe and getting customer...");
    // Initialize Stripe with the secret
    const stripeApiKey = stripeSecretParam.value();

    const stripe = require("stripe")(stripeApiKey);

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateCustomer(request.auth.uid, stripe);
    console.log("Stripe Customer ID:", stripeCustomerId);

    // Preparar opciones base para el PaymentIntent
    const paymentIntentOptions = {
      amount: amount,
      currency: 'mxn',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      description,
      capture_method: 'manual',
      confirmation_method: 'automatic',
      confirm: false,
      metadata: {
        firebaseUserId: request.auth.uid
      }
    };

    // Añadir setup_future_usage CONDICIONALMENTE
    if (savePaymentMethod && stripeCustomerId) {
      paymentIntentOptions.setup_future_usage = 'off_session';
      console.log("Flag savePaymentMethod is TRUE. Adding setup_future_usage.");
    } else {
      console.log("Flag savePaymentMethod is FALSE or no Customer ID. NOT adding setup_future_usage.");
    }

    console.log("Creating Stripe Payment Intent with options:", paymentIntentOptions);
    // Crear el Payment Intent con las opciones construidas
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);
    
    console.log("Stripe Payment Intent created:", paymentIntent.id, "Status:", paymentIntent.status);

    // Log payment attempt
    console.log("Logging Payment Intent to Firestore...");
    await logPaymentIntent(
      paymentIntent.id,
      request.auth.uid,
      amount,
      paymentIntent.status
    );
    console.log("Payment Intent logged.");

    // <<<--- INICIO: Obtener detalles de la tarjeta usada (RESTAURADO) --->>>
    let cardBrand = null;
    let cardLast4 = null;
    // Usar el ID del PM del Payment Intent creado
    let retrievedPmId = paymentIntent.payment_method;

    if (retrievedPmId && typeof retrievedPmId === 'string' && retrievedPmId.startsWith('pm_')) {
      try {
        console.log(`Recuperando detalles del PM: ${retrievedPmId} desde backend`);
        // Usar el mismo objeto 'stripe' ya inicializado
        const paymentMethod = await stripe.paymentMethods.retrieve(retrievedPmId);
        if (paymentMethod.card) {
          cardBrand = paymentMethod.card.brand;
          cardLast4 = paymentMethod.card.last4;
          console.log(`Detalles recuperados: ${cardBrand} **** ${cardLast4}`);
        } else {
           console.warn(`PaymentMethod ${retrievedPmId} no tiene detalles de tarjeta.`);
        }
      } catch (pmError) {
        console.error(`Error recuperando PaymentMethod ${retrievedPmId} desde backend:`, pmError.message);
        // No bloquear el flujo si falla, solo loggear
      }
    } else {
       // A veces el objeto viene expandido directamente en el PI, intentar usarlo
       if (typeof retrievedPmId === 'object' && retrievedPmId?.id && retrievedPmId?.card) {
         cardBrand = retrievedPmId.card.brand;
         cardLast4 = retrievedPmId.card.last4;
         retrievedPmId = retrievedPmId.id; // Guardar el ID también
         console.log(`Detalles obtenidos directamente del objeto PM expandido: ${cardBrand} **** ${cardLast4}`);
       } else {
         console.warn('No se encontró un ID de PaymentMethod válido (o expandido) en el PaymentIntent para recuperar detalles.');
       }
    }
    // <<<--- FIN: Obtener detalles de la tarjeta usada --->>>

    // Return client_secret, paymentIntentId, y los detalles de la tarjeta
    console.log("Returning clientSecret, paymentIntentId, and card details."); // Log actualizado
    return {
      ok: true, 
      data: {   
        result: { 
          clientSecret: paymentIntent.client_secret,   
          paymentIntentId: paymentIntent.id,           
          cardBrand: cardBrand, 
          cardLast4: cardLast4, 
          paymentMethodIdUsed: typeof retrievedPmId === 'string' ? retrievedPmId : null, 
          stripeCustomerId: stripeCustomerId
        }
      },
      error: null 
    };
  } catch (error) {
    console.error("Error during Payment Intent creation process:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Cloud Function to confirm an order payment
 */
exports.confirmOrderPayment = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam],
  cors: ['http://localhost:5174', 'http://localhost:5173']
}, async (request) => {
  // Similar implementation to the one you already have, but using v2 format
  // ...
});

/**
 * Function to update inventory after successful purchase
 */
async function updateInventory(items) {
  // Your existing implementation
  // ...
}