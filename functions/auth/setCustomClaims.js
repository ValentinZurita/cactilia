const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

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
exports.setCustomClaims = onCall({ region: "us-central1" }, async (request) => {
  const { uid, role } = request.data;

  // ✅ Verificar si el usuario está autenticado
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "El usuario debe estar autenticado para asignar roles."
    );
  }

  // ✅ Verificar que el usuario tiene permisos de Super Admin
  if (!request.auth.token || request.auth.token.role !== "superadmin") {
    throw new HttpsError(
      "permission-denied",
      "Solo los superadmins pueden asignar roles."
    );
  }

  // ✅ Validar que se envió UID y rol
  if (!uid || !role) {
    throw new HttpsError(
      "invalid-argument",
      "Se requiere un UID y un rol válido."
    );
  }

  // ✅ Validar que el rol sea permitido
  if (!VALID_ROLES.includes(role)) {
    throw new HttpsError(
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
    throw new HttpsError("internal", "Error al asignar el rol.");
  }
});

/**
 * Cloud Function para eliminar usuarios
 * Elimina un usuario tanto en Auth como en Firestore
 */
exports.deleteUser = onCall({ region: "us-central1" }, async (request) => {
  const { uid } = request.data;

  // ✅ Verificar si el usuario está autenticado
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "El usuario debe estar autenticado para eliminar usuarios."
    );
  }

  // ✅ Verificar que el usuario tiene permisos de Super Admin
  if (!request.auth.token || request.auth.token.role !== "superadmin") {
    throw new HttpsError(
      "permission-denied",
      "Solo los superadmins pueden eliminar usuarios."
    );
  }

  // ✅ Validar que se envió UID
  if (!uid) {
    throw new HttpsError(
      "invalid-argument",
      "Se requiere un UID válido."
    );
  }

  try {
    // ✅ Eliminar el usuario en Firebase Auth
    await admin.auth().deleteUser(uid);

    // ✅ Eliminar el documento del usuario en Firestore
    await admin.firestore().collection('users').doc(uid).delete();

    return {
      success: true,
      message: `✅ Usuario ${uid} eliminado correctamente.`
    };
  } catch (error) {
    console.error("❌ Error eliminando usuario:", error);
    throw new HttpsError(
      "internal",
      "Error al eliminar el usuario."
    );
  }
});

/**
 * Cloud Function para obtener datos detallados de los usuarios
 * Obtiene información tanto de Auth como de Firestore
 */
exports.getUsersDetail = onCall({ region: "us-central1" }, async (request) => {
  // ✅ Verificar si el usuario está autenticado
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "El usuario debe estar autenticado para obtener detalles de usuarios."
    );
  }

  // ✅ Verificar que el usuario tiene permisos de Admin
  if (!request.auth.token ||
    (request.auth.token.role !== "admin" && request.auth.token.role !== "superadmin")) {
    throw new HttpsError(
      "permission-denied",
      "Solo los administradores pueden obtener detalles de usuarios."
    );
  }

  try {
    // ✅ Obtener todos los usuarios de Auth (limitado a 1000)
    const listUsersResult = await admin.auth().listUsers(1000);

    // ✅ Obtener documentos de usuarios de Firestore
    const usersSnapshot = await admin.firestore().collection('users').get();
    const firestoreUsers = {};

    usersSnapshot.forEach(doc => {
      firestoreUsers[doc.id] = doc.data();
    });

    // ✅ Combinar datos de Auth y Firestore
    const users = listUsersResult.users.map(user => {
      const firestoreData = firestoreUsers[user.uid] || {};

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        disabled: user.disabled,
        emailVerified: user.emailVerified,
        providerData: user.providerData,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
        },
        customClaims: user.customClaims,
        ...firestoreData
      };
    });

    return { success: true, users };
  } catch (error) {
    console.error("❌ Error obteniendo usuarios:", error);
    throw new HttpsError(
      "internal",
      "Error al obtener detalles de los usuarios."
    );
  }
});