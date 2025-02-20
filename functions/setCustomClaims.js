const admin = require("firebase-admin");
const functions = require("firebase-functions");

// ✅ Evitar inicialización duplicada
if (!admin.apps.length) {
  admin.initializeApp();
}

// ✅ Lista de roles permitidos
const VALID_ROLES = ["user", "admin", "superadmin"];

/**
 * Cloud Function para asignar Custom Claims (Roles de Usuario)
 * Se ejecuta cuando se llama desde el cliente con Firebase Callable Functions.
 */
exports.setCustomClaims = functions.https.onCall(async (data, context) => {
  const { uid, role } = data;

  // ✅ Verificar si el usuario está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "El usuario debe estar autenticado para asignar roles."
    );
  }

  // ✅ Verificar que el usuario tiene permisos de Super Admin
  if (!context.auth.token || context.auth.token.role !== "superadmin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Solo los superadmins pueden asignar roles."
    );
  }

  // ✅ Validar que se envió UID y rol
  if (!uid || !role) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Se requiere un UID y un rol válido."
    );
  }

  // ✅ Validar que el rol sea permitido
  if (!VALID_ROLES.includes(role)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `El rol "${role}" no es válido. Roles permitidos: ${VALID_ROLES.join(", ")}.`
    );
  }

  try {
    // ✅ Asignar los Custom Claims al usuario en Firebase Authentication
    await admin.auth().setCustomUserClaims(uid, { role });

    console.log(`✅ Rol "${role}" asignado a UID: ${uid}`);

    // ✅ Refrescar el token del usuario para que los cambios sean inmediatos
    const user = await admin.auth().getUser(uid);
    await admin.auth().revokeRefreshTokens(user.uid);

    return { success: true, message: `✅ Rol "${role}" asignado a ${uid} y tokens revocados.` };
  } catch (error) {
    console.error("❌ Error asignando Custom Claims:", error);
    throw new functions.https.HttpsError("internal", "Error al asignar el rol.");
  }
});