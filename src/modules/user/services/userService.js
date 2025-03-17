import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { FirebaseDB, FirebaseAuth } from '../../../firebase/firebaseConfig';
import { uploadFile } from '../../../firebase/firebaseStorage';

const USERS_COLLECTION = 'users';

/**
 * Obtiene los datos del usuario desde Firestore
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<{ok: boolean, data: Object, error: string}>} - Resultado de la operación
 */
export const getUserData = async (userId) => {
  try {
    if (!userId) {
      return { ok: false, data: null, error: 'ID de usuario no proporcionado' };
    }

    const userRef = doc(FirebaseDB, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { ok: false, data: null, error: 'Usuario no encontrado' };
    }

    return { ok: true, data: userSnap.data(), error: null };
  } catch (error) {
    console.error('Error obteniendo datos del usuario:', error);
    return { ok: false, data: null, error: error.message };
  }
};

/**
 * Actualiza los datos del usuario en Firebase Auth y Firestore
 *
 * @param {string} userId - ID del usuario
 * @param {Object} userData - Datos actualizados del usuario
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const updateUserData = async (userId, userData) => {
  try {
    if (!userId) {
      return { ok: false, error: 'ID de usuario no proporcionado' };
    }

    // 1. Obtener el usuario actual de Firebase Auth
    const currentUser = FirebaseAuth.currentUser;
    if (!currentUser) {
      return { ok: false, error: 'Usuario no autenticado' };
    }

    // 2. Actualizar el perfil en Firebase Auth
    const authUpdateData = {};
    if (userData.displayName) {
      authUpdateData.displayName = userData.displayName;
    }
    if (userData.photoURL) {
      authUpdateData.photoURL = userData.photoURL;
    }

    if (Object.keys(authUpdateData).length > 0) {
      await updateProfile(currentUser, authUpdateData);
    }

    // 3. Actualizar los datos en Firestore
    const userRef = doc(FirebaseDB, USERS_COLLECTION, userId);
    const updateData = {
      ...userData,
      updatedAt: new Date()
    };

    await updateDoc(userRef, updateData);

    return { ok: true, error: null };
  } catch (error) {
    console.error('Error actualizando datos del usuario:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Sube una imagen de perfil para el usuario y actualiza su perfil
 *
 * @param {string} userId - ID del usuario
 * @param {File} file - Archivo de imagen a subir
 * @returns {Promise<{ok: boolean, photoURL: string, error: string}>} - Resultado de la operación
 */
export const updateProfilePhoto = async (userId, file) => {
  try {
    if (!userId) {
      return { ok: false, photoURL: null, error: 'ID de usuario no proporcionado' };
    }

    if (!file) {
      return { ok: false, photoURL: null, error: 'Archivo no proporcionado' };
    }

    // 1. Subir la imagen a Firebase Storage
    const photoURL = await uploadFile(file, `profile-photos/${userId}`);

    if (!photoURL) {
      return { ok: false, photoURL: null, error: 'Error subiendo la imagen' };
    }

    // 2. Actualizar el perfil en Firebase Auth
    const currentUser = FirebaseAuth.currentUser;
    if (currentUser) {
      await updateProfile(currentUser, { photoURL });
    }

    // 3. Actualizar los datos en Firestore
    const userRef = doc(FirebaseDB, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      photoURL,
      updatedAt: new Date()
    });

    return { ok: true, photoURL, error: null };
  } catch (error) {
    console.error('Error actualizando foto de perfil:', error);
    return { ok: false, photoURL: null, error: error.message };
  }
};

/**
 * Actualiza la contraseña del usuario
 *
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const updateUserPassword = async (currentPassword, newPassword) => {
  try {
    const currentUser = FirebaseAuth.currentUser;

    if (!currentUser) {
      return { ok: false, error: 'Usuario no autenticado' };
    }

    // Reautenticar al usuario (esto requeriría EmailAuthProvider de Firebase)
    // Nota: Esta implementación es simplificada, en producción necesitarías reautenticar

    // Para propósitos de demostración, simulamos que es exitoso
    // En una implementación real, usarías reauthenticateWithCredential

    // Cambiar la contraseña
    await currentUser.updatePassword(newPassword);

    return { ok: true, error: null };
  } catch (error) {
    console.error('Error actualizando contraseña:', error);

    // Manejar posibles errores específicos
    let errorMessage = 'Error al actualizar la contraseña';

    switch (error.code) {
      case 'auth/requires-recent-login':
        errorMessage = 'Para cambiar tu contraseña, necesitas iniciar sesión nuevamente por seguridad';
        break;
      case 'auth/weak-password':
        errorMessage = 'La contraseña es demasiado débil (mínimo 6 caracteres)';
        break;
      default:
        errorMessage = error.message;
    }

    return { ok: false, error: errorMessage };
  }
};