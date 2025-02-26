/**
 * setCustomClaims.js
 * --------------------------------------------
 * Cloud Functions para la gestión de usuarios en Firebase:
 *  - Asignar custom claims (roles)
 *  - Eliminar un usuario por UID
 *  - Obtener detalles de un usuario con Admin SDK
 */

const admin = require("firebase-admin");
const functions = require("firebase-functions");

// Evitar inicialización duplicada
if (!admin.apps.length) {
  admin.initializeApp();
}

const VALID_ROLES = ["user", "admin", "superadmin"];

/**
 * Asignar Custom Claims (Roles de Usuario)
 */
exports.setCustomClaims = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    // Verificar permisos: solo superadmin puede asignar roles
    if (!context.auth || !context.auth.token || context.auth.token.role !== "superadmin") {
      return { ok: false, error: "No tienes permisos para asignar roles." };
    }
    const { uid, role } = data;
    if (!uid || !role) {
      return { ok: false, error: "Faltan parámetros: uid y role son requeridos." };
    }
    if (!VALID_ROLES.includes(role)) {
      return { ok: false, error: `Rol inválido: '${role}'.` };
    }
    try {
      await admin.auth().getUser(uid);
      await admin.auth().setCustomUserClaims(uid, { role });
      return { ok: true, message: `Rol '${role}' asignado al usuario ${uid}.` };
    } catch (error) {
      console.error("Error asignando custom claim:", error);
      return { ok: false, error: error.message };
    }
  });

/**
 * Eliminar un usuario completamente (solo superadmin)
 */
exports.deleteUserByUID = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token || context.auth.token.role !== "superadmin") {
      return { ok: false, error: "No tienes permisos para eliminar usuarios." };
    }
    const { uid } = data;
    if (!uid) {
      return { ok: false, error: "Falta el UID del usuario." };
    }
    try {
      await admin.auth().deleteUser(uid);
      await admin.firestore().collection("users").doc(uid).delete();
      return { ok: true, message: "Usuario eliminado correctamente." };
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      return { ok: false, error: error.message };
    }
  });

/**
 * Obtener detalles de un usuario desde Admin SDK
 */
exports.getUserDetailsByUID = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    if (
      !context.auth ||
      !context.auth.token ||
      !["admin", "superadmin"].includes(context.auth.token.role)
    ) {
      return { ok: false, error: "No autorizado para ver detalles de usuarios." };
    }
    const { uid } = data;
    if (!uid) {
      return { ok: false, error: "Falta el UID del usuario." };
    }
    try {
      const userRecord = await admin.auth().getUser(uid);
      return {
        ok: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || "Sin nombre",
          role: userRecord.customClaims?.role || "user",
          lastSignInTime: userRecord.metadata.lastSignInTime,
          creationTime: userRecord.metadata.creationTime,
        },
      };
    } catch (error) {
      console.error("Error getUserDetailsByUID:", error);
      return { ok: false, error: "Error al obtener detalles: " + error.message };
    }
  });