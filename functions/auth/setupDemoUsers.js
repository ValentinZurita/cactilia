const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin/firestore"); // Import Timestamp

// Evitar inicialización duplicada
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function para configurar usuarios de demostración ESPECÍFICOS:
 * (Visitante, Admin, SuperAdmin con UIDs/emails hardcodeados)
 * - Asigna Custom Claims (rol) en Auth.
 * - Marca el email como verificado en Auth.
 * - Crea/Actualiza el documento del usuario en Firestore (colección 'users').
 * Debe ser llamada por un superadmin.
 */
exports.setupDemoUsers = onCall({ region: "us-central1" }, async (request) => { // Removed runtime options, adjust if needed
  // Verificar si el usuario está autenticado y es superadmin
  if (!request.auth || request.auth.token.role !== 'superadmin') {
    console.warn("Intento no autorizado para setupDemoUsers:", request.auth?.uid);
    throw new HttpsError("permission-denied", "Solo los superadmins pueden ejecutar esta acción.");
  }

  // --- DATOS DE USUARIOS DEMO HARDCODEADOS ---
  const demoUsers = [
    // uid: "Zf2IzClkhrOjEXPdrvh3vLut9tz1", email: "visitante@demo.com", displayName: "Visitante Demo", role: "user"
    { uid: "Zf2IzClkhrOjEXPdrvh3vLut9tz1", email: "visitante@demo.com", displayName: "Visitante Demo", role: "user" },
    // uid: "wyVhO0jvJWMhMGgZyNcI6DwL8cp2", email: "admin@demo.com", displayName: "Admin Demo", role: "admin"
    { uid: "wyVhO0jvJWMhMGgZyNcI6DwL8cp2", email: "admin@demo.com", displayName: "Admin Demo", role: "admin" },
    // uid: "SIjElDECZSgLiGkDtylX8k0X0KE2", email: "superadmin@demo.com", displayName: "Super Admin Demo", role: "superadmin"
    { uid: "SIjElDECZSgLiGkDtylX8k0X0KE2", email: "superadmin@demo.com", displayName: "Super Admin Demo", role: "superadmin" },
  ];
  // -----------------------------------------

  const results = [];
  const firestore = admin.firestore();
  const auth = admin.auth();
  const now = Timestamp.now();

  console.log(`Iniciando configuración para ${demoUsers.length} usuarios demo específicos por ${request.auth.uid}`);

  // Procesar cada usuario en el array hardcodeado
  for (const user of demoUsers) {
    const { uid, email, displayName, role } = user; // Datos vienen del array interno

    // Validación interna (no debería fallar si los datos están bien escritos arriba)
    if (!uid || !email || !displayName || !role) {
      console.error("Error interno: Datos hardcodeados incompletos para:", user);
      results.push({ uid: uid || 'DESCONOCIDO', success: false, message: "Error interno en datos hardcodeados." });
      continue;
    }

    try {
      // 1. Asignar Rol (Custom Claim)
      await auth.setCustomUserClaims(uid, { role: role });
      console.log(`[${uid}] Rol '${role}' asignado en Auth.`);

      // 2. Marcar Email como Verificado
      await auth.updateUser(uid, { emailVerified: true });
      console.log(`[${uid}] Email marcado como verificado en Auth.`);

      // 3. Crear/Actualizar Documento en Firestore
      const userDocRef = firestore.collection('users').doc(uid);
      const userData = {
        email: email,
        displayName: displayName,
        role: role,
        active: true, // Asumimos activo por defecto para demo
        emailVerified: true, // Mantener consistencia
        updatedAt: now,
        // Añadir createdAt solo si el documento no existe
      };
      const docSnap = await userDocRef.get();
      if (!docSnap.exists) {
        userData.createdAt = now;
      }
      await userDocRef.set(userData, { merge: true }); // merge: true crea o actualiza
      console.log(`[${uid}] Documento creado/actualizado en Firestore.`);

      results.push({ uid: uid, success: true, message: `Usuario ${uid} procesado.` });

    } catch (error) {
      console.error(`[${uid}] Error procesando usuario:`, error);
      let detailedErrorMessage = error.message;
       // Intentar dar mensajes más específicos para errores comunes
       if (error.code === 'auth/user-not-found') {
          detailedErrorMessage = `Usuario de Auth con UID ${uid} NO encontrado. Asegúrate de que exista en Firebase Authentication antes de ejecutar esta función.`;
       } else if (error.code === 'permission-denied') {
           detailedErrorMessage = `Permiso denegado al actualizar Firestore o Auth para ${uid}. Revisa las reglas de seguridad o permisos del Admin SDK.`;
       } else if (error.code) {
          detailedErrorMessage = `Error (${error.code}): ${error.message}`;
       }
      results.push({ uid: uid, success: false, message: detailedErrorMessage });
    }
  }

  console.log("Proceso de configuración de usuarios demo completado.");
  return { results }; // Devuelve un array con el resultado para cada usuario
}); 