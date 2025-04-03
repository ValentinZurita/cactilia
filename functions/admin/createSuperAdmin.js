const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://firebase-adminsdk-fbsvc@cactilia-3678a.iam.gserviceaccount.com",
});

const auth = admin.auth();
const firestore = admin.firestore();

// Función para crear un SuperAdmin
const createSuperAdmin = async () => {
  try {
    // Crear usuario en Firebase Authentication
    const userRecord = await auth.createUser({
      email: "valentin.alejandro@outlook.com",
      password: "Alejandro123",
      displayName: "Super Admin",
    });

    // Asignar custom claims
    await auth.setCustomUserClaims(userRecord.uid, { role: "superadmin" });

    // Guardar datos en Firestore
    await firestore.collection("users").doc(userRecord.uid).set({
      email: "valentin.alejandro@outlook.com",
      displayName: "Super Admin",
      role: "superadmin",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true,
    });

    console.log("=========================================");
    console.log("✅ Superadmin creado exitosamente");
    console.log("📧 Email:", userRecord.email);
    console.log("🔑 Password:", userRecord.password);
    console.log("🆔 UID:", userRecord.uid);
    console.log("=========================================");

    return userRecord;
  } catch (error) {
    console.error("❌ Error al crear SuperAdmin:", error);
    process.exit(1);
  }
};

// Ejecutar función
createSuperAdmin()
  .then(() => {
    console.log("🎉 Proceso completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("🚨 Error en el proceso:", error);
    process.exit(1);
  });