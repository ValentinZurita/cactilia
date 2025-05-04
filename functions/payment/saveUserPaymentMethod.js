const { onCall, HttpsError } = require("firebase-functions/v2/https");
const functions = require("firebase-functions"); // Importar para acceder a params
const admin = require("firebase-admin");
const { stripeSecretParam, initializeStripe } = require("./stripeService"); // Importar initializeStripe

const PAYMENT_METHODS_COLLECTION = 'payment_methods';

// Inicializar Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const FirebaseDB = admin.firestore();

// Declarar la variable para Stripe, pero NO inicializarla aquí
let stripe;

/**
 * Cloud Function to save a reference to a Stripe Payment Method in Firestore
 * after a successful purchase where the user opted to save the card.
 */
exports.saveUserPaymentMethod = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam],
  cors: ['http://localhost:5174', 'http://localhost:5173']
}, async (request) => {
  console.log("*** saveUserPaymentMethod function started ***");

  // Inicializar Stripe aquí DENTRO si aún no está inicializado
  if (!stripe) {
    console.log("Initializing Stripe instance inside function...");
    stripe = initializeStripe(); // Ahora llamamos a initializeStripe aquí
  } else {
    console.log("Stripe instance already available inside function.");
  }

  // 1. Autenticación
  if (!request.auth) {
    console.error("Authentication failed: No auth context.");
    throw new HttpsError("unauthenticated", "Authentication required.");
  }
  const userId = request.auth.uid;

  // 2. Validación de Datos de Entrada (solo necesitamos PM ID y Customer ID ahora)
  const {
    stripePaymentMethodId,
    stripeCustomerId,
    // Ya no necesitamos cardBrand y cardLast4 del frontend
  } = request.data;

  console.log("Received data:", JSON.stringify(request.data));

  if (!stripePaymentMethodId || !stripePaymentMethodId.startsWith('pm_')) {
    console.error("Validation failed: Missing or invalid stripePaymentMethodId.");
    throw new HttpsError("invalid-argument", "Stripe Payment Method ID is required.");
  }
  if (!stripeCustomerId || !stripeCustomerId.startsWith('cus_')) {
    console.error("Validation failed: Missing or invalid stripeCustomerId.");
    throw new HttpsError("invalid-argument", "Stripe Customer ID is required.");
  }

  try {
    // 3. Recuperar detalles del PaymentMethod desde Stripe
    console.log(`Retrieving PaymentMethod ${stripePaymentMethodId} details from Stripe...`);
    const paymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId);

    if (!paymentMethod || !paymentMethod.card) {
      console.error(`Failed to retrieve valid card details for PaymentMethod ${stripePaymentMethodId}`);
      throw new HttpsError("not-found", "Could not retrieve valid card details from Stripe.");
    }

    const cardDetails = paymentMethod.card;
    const billingDetails = paymentMethod.billing_details;

    const cardBrand = cardDetails.brand;
    const cardLast4 = cardDetails.last4;
    const expiryMonth = cardDetails.exp_month.toString().padStart(2, '0');
    const expiryYear = cardDetails.exp_year;
    const expiryDate = `${expiryMonth}/${expiryYear}`;
    const cardholderName = billingDetails.name; // Puede ser null si no se proporcionó

    console.log(`Retrieved details: Brand=${cardBrand}, Last4=${cardLast4}, Expiry=${expiryDate}, Name=${cardholderName}`);

    // 4. Preparar Datos para Firestore (con detalles completos)
    const paymentMethodData = {
      userId: userId,
      stripePaymentMethodId: stripePaymentMethodId,
      stripeCustomerId: stripeCustomerId,
      brand: cardBrand,
      last4: cardLast4,
      expiryDate: expiryDate,
      cardholderName: cardholderName || null, // Guardar null si no hay nombre
      isDefault: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // 5. Guardar en Firestore
    console.log(`Attempting to save payment method ${stripePaymentMethodId} for user ${userId}...`);
    const paymentMethodsRef = FirebaseDB.collection(PAYMENT_METHODS_COLLECTION);
    
    // Opcional: Verificar si ya existe una entrada con el mismo stripePaymentMethodId para este usuario
    const existingQuery = await paymentMethodsRef
        .where('userId', '==', userId)
        .where('stripePaymentMethodId', '==', stripePaymentMethodId)
        .limit(1)
        .get();
        
    if (!existingQuery.empty) {
        console.warn(`Payment method ${stripePaymentMethodId} already exists for user ${userId}. Skipping save.`);
        // Considera si quieres actualizarla (ej. updatedAt) o simplemente no hacer nada
        // Podrías devolver un éxito indicando que ya existía
        const existingDocId = existingQuery.docs[0].id;
        await paymentMethodsRef.doc(existingDocId).update({ updatedAt: admin.firestore.FieldValue.serverTimestamp() }); // <-- Usar admin para timestamp
        console.log(`Updated existing payment method document ${existingDocId}.`);
        return { ok: true, message: "Payment method already existed and was updated." };
    }

    // Si no existe, crear el nuevo documento
    const docRef = await paymentMethodsRef.add(paymentMethodData);
    console.log(`Payment method saved successfully with Firestore ID: ${docRef.id}`);

    // 6. Devolver Éxito
    return { ok: true, message: "Payment method saved successfully." };

  } catch (error) {
    console.error(`Error saving payment method ${stripePaymentMethodId} for user ${userId}:`, error);
    throw new HttpsError("internal", `Failed to save payment method: ${error.message}`);
  }
});

// Asegúrate de tener un archivo 'stripeService.js' que defina stripeSecretParam 