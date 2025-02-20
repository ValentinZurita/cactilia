import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig.js'



/**
 * Saves or updates a user in Firestore.
 * If the user already exists, updates only the necessary fields.
 *
 * @param {Object} userData - User data to save.
 * @param {string} userData.uid - User ID (Firebase Auth UID).
 * @param {string} userData.displayName - User's full name.
 * @param {string} userData.email - User's email.
 * @param {string} [userData.photoURL] - Profile picture URL (optional).
 * @param {string} [userData.phoneNumber] - Phone number (optional).
 * @param {string} [userData.role='user'] - User role ('user', 'admin', 'superadmin').
 * @returns {Promise<Object>} - Returns the updated user data.
 */

export const saveUserToFirestore = async (userData) => {
  if (!userData?.uid || !userData?.email) {
    throw new Error("❌ Invalid user data (missing UID or email).");
  }

  try {
    // 📌 Reference to Firestore "users/{uid}" document
    const userRef = doc(FirebaseDB, "users", userData.uid);
    const userSnap = await getDoc(userRef);

    // 🔹 Data structure to store
    let finalUserData = {
      uid: userData.uid,
      displayName: userData.displayName,
      email: userData.email,
      photoURL: userData.photoURL || "",
      phoneNumber: userData.phoneNumber || "",
      role: userData.role || "user", // Ensure default role is "user"
      updatedAt: new Date(),
    };

    if (userSnap.exists()) {
      // 🔥 User exists → Update only changed fields
      console.log("⚠️ User already exists in Firestore. Updating information...");

      const existingData = userSnap.data();

      // Preserve the existing role if already set
      finalUserData.role = existingData.role || "user";

      await updateDoc(userRef, finalUserData);
      console.log("✅ User successfully updated in Firestore.");
    } else {
      // 🆕 New user → Create in Firestore
      console.log("🟡 New user. Saving to Firestore...");

      finalUserData.createdAt = new Date(); // Only for new users

      await setDoc(userRef, finalUserData);
      console.log("✅ User successfully saved to Firestore.");
    }

    return finalUserData;
  } catch (error) {
    console.error("❌ Error saving user to Firestore:", error);
    throw new Error("Error saving user to Firestore.");
  }
};

/**
 * Obtiene un usuario desde Firestore.
 * @param {string} uid - ID del usuario (Firebase Auth UID).
 * @returns {Promise<Object|null>} - Datos del usuario o null si no existe.
 */

export const getUserFromFirestore = async (uid) => {
  if (!uid) return null;

  const userRef = doc(FirebaseDB, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    return null;
  }
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




/**
 * Obtiene el doc del usuario por uid.
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export const getUserDoc = async (uid) => {
  if (!uid) return null;

  const userRef = doc(FirebaseDB, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
};

/**
 * Crea o actualiza el doc de usuario en Firestore, sin query por email.
 * Si ya existe, hace merge de datos. Si no existe, lo crea.
 * Se asume que el usuario está loggeado y su uid coincide con `userData.uid`.
 *
 * @param {Object} userData
 * @param {string} userData.uid
 * @param {string} userData.email
 * @param {string} userData.displayName
 * @param {string} [userData.photoURL]
 * @param {string} [userData.role='user']
 * @param {string} [userData.phoneNumber]
 */
export const saveUserDoc = async (userData) => {
  if (!userData?.uid) {
    throw new Error("❌ Datos de usuario inválidos (falta uid).");
  }

  const {
    uid,
    email,
    displayName,
    photoURL = '',
    phoneNumber = '',
    role = 'user',
  } = userData;

  // 1) Referencia al doc en "users/{uid}"
  const userRef = doc(FirebaseDB, "users", uid);
  const snap = await getDoc(userRef);

  // 2) Construimos los campos que guardaremos/actualizaremos
  const finalData = {
    uid,
    email,
    displayName,
    photoURL,
    phoneNumber,
    role, // si ya existía doc, luego vemos si mergeamos o no
    updatedAt: new Date(),
  };

  // 3) Si existe, actualizamos
  if (snap.exists()) {
    console.log("⚠️ Usuario existe. Hacemos updateDoc con merge de datos...");
    // Opcional: si no quieres pisar el "role" que ya tenía, primero recupéralo:
    const existingData = snap.data();
    finalData.role = existingData.role || role; // prioriza el role antiguo
    // Actualizamos
    await updateDoc(userRef, finalData);
    console.log("✅ Usuario actualizado en Firestore.");
  } else {
    console.log("🟡 Usuario nuevo. Creando doc en Firestore...");
    finalData.createdAt = new Date();
    // Usamos setDoc para crearlo
    await setDoc(userRef, finalData);
    console.log("✅ Usuario creado en Firestore.");
  }
};