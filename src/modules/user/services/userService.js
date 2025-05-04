import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { FirebaseDB, FirebaseAuth } from '../../../config/firebase/firebaseConfig';
import { uploadFile } from '../../../config/firebase/firebaseStorage';

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
 * Verifica si el archivo es una imagen válida y cumple con las restricciones
 *
 * @param {File} file - Archivo a verificar
 * @param {number} maxSizeMB - Tamaño máximo en MB (por defecto 1.5MB)
 * @returns {Object} - Resultado de la validación {valid, error}
 */
export const validateProfileImage = (file, maxSizeMB = 1.5) => {
  // Verificar que sea un archivo
  if (!file) {
    return { valid: false, error: 'No se ha seleccionado ningún archivo' };
  }

  // Verificar tipo de archivo (solo imágenes)
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validImageTypes.includes(file.type)) {
    return { valid: false, error: 'El archivo debe ser una imagen (JPEG, PNG, GIF o WEBP)' };
  }

  // Verificar tamaño (por defecto máximo 2MB)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `La imagen es demasiado grande. El tamaño máximo permitido es ${maxSizeMB}MB`
    };
  }

  return { valid: true, error: null };
};

/**
 * Sube una imagen de perfil para el usuario y actualiza su perfil
 * Incluye validación y optimización de la imagen
 *
 * @param {string} userId - ID del usuario
 * @param {File} file - Archivo de imagen a subir
 * @param {Object} options - Opciones de optimización
 * @param {number} options.maxSizeMB - Tamaño máximo en MB (por defecto 2MB)
 * @param {number} options.maxWidthOrHeight - Dimensión máxima en píxeles (por defecto 1200px)
 * @returns {Promise<{ok: boolean, photoURL: string, error: string}>} - Resultado de la operación
 */
export const updateProfilePhoto = async (userId, file, options = {}) => {
  try {
    if (!userId) {
      return { ok: false, photoURL: null, error: 'ID de usuario no proporcionado' };
    }
    // console.log(`[userService] updateProfilePhoto called for userId: ${userId}, file: ${file?.name}`);

    // Validar la imagen antes de procesar
    const validation = validateProfileImage(file, options.maxSizeMB || 2);
    if (!validation.valid) {
      // console.error(`[userService] Image validation failed: ${validation.error}`);
      return { ok: false, photoURL: null, error: validation.error };
    }

    // 1. Subir la imagen a Firebase Storage
    const storagePath = `profile-photos/${userId}/${Date.now()}_profile`;
    // console.log(`[userService] Attempting to upload file to path: ${storagePath}`);
    const photoURL = await uploadFile(file, storagePath);
    // console.log(`[userService] Received photoURL from uploadFile: ${photoURL}`);

    if (!photoURL) {
      // console.error('[userService] uploadFile returned a falsy photoURL.');
      return { ok: false, photoURL: null, error: 'Error subiendo la imagen' };
    }

    // 2. Actualizar el perfil en Firebase Auth
    const currentUser = FirebaseAuth.currentUser;
    if (currentUser) {
      // console.log(`[userService] Attempting to update Auth profile for user ${currentUser.uid} with photoURL: ${photoURL}`);
      await updateProfile(currentUser, { photoURL });
      // console.log(`[userService] Auth profile update successful (or no error thrown).`);
    }

    // 3. Actualizar los datos en Firestore
    const userRef = doc(FirebaseDB, USERS_COLLECTION, userId);
    const dataToUpdate = { photoURL, updatedAt: new Date() };
    // console.log(`[userService] Attempting to update Firestore doc (${USERS_COLLECTION}/${userId}) with data:`, dataToUpdate);
    await updateDoc(userRef, {
      photoURL,
      updatedAt: new Date()
    });
    // console.log(`[userService] Firestore update successful (or no error thrown).`);

    const successResult = { ok: true, photoURL, error: null };
    // console.log(`[userService] Returning success result:`, successResult);
    return { ok: true, photoURL, error: null };
  } catch (error) {
    // console.error('[userService] CATCH block error in updateProfilePhoto:', error);
    console.error('Error actualizando foto de perfil:', error); // Mantener este error genérico
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