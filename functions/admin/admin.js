const admin = require("firebase-admin");

// Cargar credenciales del servicio Firebase
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function checkUserRole(uid) {
  try {
    const user = await admin.auth().getUser(uid);
    console.log("🔎 Custom Claims:", user.customClaims);
  } catch (error) {
    console.error("❌ Error obteniendo los claims:", error);
  }
}

checkUserRole("OHYEZ2Ze9VXXJz3xnzT3OAJhJ8H2");