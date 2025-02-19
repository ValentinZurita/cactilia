import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import { FirebaseAuth, FirebaseDB } from './firebaseConfig.js'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'

// Proveedor de autenticación con Google
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    // Iniciar sesión con Google
    const result = await signInWithPopup(FirebaseAuth, googleProvider);
    const { displayName, email, photoURL, uid } = result.user;

    // Obtener Custom Claims (para seguridad en roles)
    const idTokenResult = await result.user.getIdTokenResult();
    const role = idTokenResult.claims.role || "user"; // Asigna "user" si no tiene rol

    console.log("✅ Usuario autenticado:", { uid, displayName, email, role });

    // 📌 Referencia al documento del usuario en Firestore
    const userRef = doc(FirebaseDB, "users", uid);
    const userSnap = await getDoc(userRef);

    // 📌 Si el usuario no existe en Firestore, lo creamos
    if (!userSnap.exists()) {
      console.log("🟡 Usuario nuevo. Guardando en Firestore...");

      await setDoc(userRef, {
        uid,
        displayName,
        email,
        photoURL,
        role, // Guardamos el rol como referencia
        createdAt: new Date(),
      });

      console.log("✅ Usuario guardado en Firestore.");
    } else {
      console.log("⚪ Usuario ya registrado en Firestore.");
    }

    return {
      ok: true,
      uid,
      displayName,
      email,
      photoURL,
      role,
    };

  } catch (error) {
    console.error("❌ Error en signInWithGoogle:", error);
    return {
      ok: false,
      errorMessage: error.message,
    };
  }
};


// Login with email and password
export const registerWithEmailPassword = async ({ email, password, fullName }) => {

  try {
    // Create user with email and password in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(FirebaseAuth, email, password);
    const { uid } = userCredential.user;

    // Update user profile with full name
    await updateProfile(userCredential.user, {
      displayName: fullName,
    });

    // Return user data to store in Redux state and local storage (if needed)
    return {
      ok: true,
      uid,
      email,
      displayName: fullName,
    };

  } catch (error) {
    return {
      ok: false,
      errorMessage: error.message,
    };
  }
};