import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig.js'


/**
 * Guarda un usuario en Firestore.
 *
 * @param {Object} userData - Datos del usuario a guardar.
 * @param {string} userData.uid - ID del usuario (Firebase Auth UID).
 * @param {string} userData.displayName - Nombre del usuario.
 * @param {string} userData.email - Correo electrónico del usuario.
 * @param {string} [userData.photoURL] - URL de la foto de perfil.
 * @param {string} [userData.phoneNumber] - Número de teléfono (opcional).
 * @param {string} [userData.role='user'] - Rol del usuario ('user', 'admin', 'superadmin').
 * @returns {Promise<void>}
 */


export const saveUserToFirestore = async (userData) => {
  if (!userData || !userData.uid) throw new Error("Datos de usuario inválidos");

  const userRef = doc(FirebaseDB, 'users', userData.uid);
  await setDoc(userRef, {
    displayName: userData.displayName,
    email: userData.email,
    photoURL: userData.photoURL || '',
    phoneNumber: userData.phoneNumber || '',
    role: userData.role || 'user',
    createdAt: new Date(),
  }, { merge: true });
};


/**
 * Obtiene los datos de un usuario desde Firestore.
 *
 * @param {string} uid - UID del usuario a buscar.
 * @returns {Promise<Object|null>} - Datos del usuario o null si no existe.
 */

export const getUserFromFirestore = async (uid) => {
  if (!uid) throw new Error("UID inválido");

  const userRef = doc(FirebaseDB, 'users', uid);
  const userSnap = await getDoc(userRef);

  return userSnap.exists() ? userSnap.data() : null;
};


/**
 * Actualiza la información de un usuario en Firestore.
 *
 * @param {string} uid - UID del usuario a actualizar.
 * @param {Object} updatedData - Datos a actualizar.
 * @returns {Promise<void>}
 */

export const updateUserInFirestore = async (uid, updatedData) => {
  if (!uid || !updatedData) throw new Error("Datos inválidos");

  const userRef = doc(FirebaseDB, 'users', uid);
  await updateDoc(userRef, updatedData);
};


/**
 * Verifica si un usuario existe en Firestore.
 *
 * @param {string} uid - UID del usuario a verificar.
 * @returns {Promise<boolean>} - `true` si el usuario existe, `false` si no.
 */
export const checkUserExists = async (uid) => {
  if (!uid) throw new Error("UID inválido");

  const userRef = doc(FirebaseDB, 'users', uid);
  const userSnap = await getDoc(userRef);

  return userSnap.exists();
};


/**
 * Elimina un usuario de Firestore (Opcional).
 *
 * @param {string} uid - UID del usuario a eliminar.
 * @returns {Promise<void>}
 */

export const deleteUserFromFirestore = async (uid) => {
  if (!uid) throw new Error("UID inválido");

  const userRef = doc(FirebaseDB, 'users', uid);
  await deleteDoc(userRef);
};