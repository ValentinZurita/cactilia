import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { FirebaseDB } from "../../../firebase/firebaseConfig";
import { FirebaseAuth } from "../../../firebase/firebaseConfig";

/**
 * Obtiene el documento de usuario desde Firestore
 * @param {string} uid - ID del usuario
 * @returns {Object|null} Datos del usuario o null si no existe
 */
export const getUserDoc = async (uid) => {
  if (!uid) return null;

  try {
    const userRef = doc(FirebaseDB, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo documento de usuario:", error);
    return null;
  }
};

/**
 * Guarda o actualiza un documento de usuario en Firestore
 * @param {Object} userData - Datos del usuario a guardar
 * @returns {Object} Resultado de la operación
 */
export const saveUserDoc = async (userData) => {
  if (!userData || !userData.uid) {
    return { ok: false, error: "Se requiere un ID de usuario" };
  }

  try {
    // Añadir timestamps si no existen
    const dataToSave = {
      ...userData,
      updatedAt: serverTimestamp(),
    };

    // Si es un nuevo usuario, añadir fecha de creación
    if (!userData.createdAt) {
      dataToSave.createdAt = serverTimestamp();
    }

    const userRef = doc(FirebaseDB, "users", userData.uid);
    await setDoc(userRef, dataToSave, { merge: true });
    return { ok: true };
  } catch (error) {
    console.error("Error guardando usuario:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Obtiene todos los usuarios con un rol específico
 * @param {string[]} roles - Array de roles a buscar (e.j. ['user', 'admin'])
 * @returns {Object} Resultado de la operación con los usuarios encontrados
 */
export const getUsersByRole = async (roles = ['user']) => {
  try {
    // Si no se especifican roles, obtener todos los usuarios
    let users = [];

    if (roles.length === 0) {
      const querySnapshot = await getDocs(collection(FirebaseDB, "users"));
      users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      // Para cada rol, obtener los usuarios y combinarlos
      for (const role of roles) {
        const q = query(
          collection(FirebaseDB, "users"),
          where("role", "==", role),
          orderBy("displayName")
        );

        const querySnapshot = await getDocs(q);
        const roleUsers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        users = [...users, ...roleUsers];
      }
    }

    return { ok: true, data: users };
  } catch (error) {
    console.error("Error obteniendo usuarios por rol:", error);
    return { ok: false, error };
  }
};

/**
 * Actualiza el rol de un usuario
 * @param {string} uid - ID del usuario
 * @param {string} newRole - Nuevo rol para el usuario
 * @returns {Object} Resultado de la operación
 */
export const updateUserRole = async (uid, newRole) => {
  try {
    // 1. Actualizar en Firestore
    const userRef = doc(FirebaseDB, "users", uid);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date()
    });

    // 2. Llamar a la función Cloud Function para actualizar los custom claims
    // Importar la función de Firebase Functions
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const functions = getFunctions();

    // Llamar a la función setCustomClaims definida en tus Cloud Functions
    const setCustomClaims = httpsCallable(functions, 'setCustomClaims');
    await setCustomClaims({ uid, role: newRole });

    return { ok: true };
  } catch (error) {
    console.error("Error actualizando rol de usuario:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Elimina un usuario (solo elimina el documento, no la autenticación)
 * @param {string} uid - ID del usuario a eliminar
 * @returns {Object} Resultado de la operación
 */
export const deleteUserDoc = async (uid) => {
  try {
    const userRef = doc(FirebaseDB, "users", uid);
    await deleteDoc(userRef);
    return { ok: true };
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    return { ok: false, error };
  }
};

/**
 * Obtiene todos los usuarios (paginados)
 * @param {number} limit - Límite de usuarios a obtener
 * @param {Object} lastDoc - Último documento para paginación
 * @returns {Object} Resultado de la operación
 */
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(FirebaseDB, "users"));
    const users = querySnapshot.docs.map(docItem => ({
      id: docItem.id,
      ...docItem.data()
    }));

    return { ok: true, data: users };
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return { ok: false, error };
  }
};