import {GoogleAuthProvider, signInWithPopup, OAuthProvider} from 'firebase/auth';
import { FirebaseAuth, FirebaseDB } from './firebaseConfig.js'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getUserDoc, saveUserDoc } from '../../modules/auth/services/userService.js';


const googleProvider = new GoogleAuthProvider();

/**
 * Inicia sesión con Google y guarda/actualiza el usuario en Firestore.
 * Retorna { ok, uid, displayName, email, photoURL, role } si todo va bien.
 */
export const signInWithGoogle = async () => {
  try {
    // 1) Popup de Google
    const result = await signInWithPopup(FirebaseAuth, googleProvider);
    const { displayName, email, photoURL, uid } = result.user;

    // 2) Opcional: Forzar refresh token (por si usas Custom Claims)
    await result.user.getIdToken(true);

    // 3) Guardar o actualizar en Firestore. Asignar role='user' si es nuevo.
    await saveUserDoc({
      uid,
      displayName,
      email,
      photoURL,
      role: 'user', // Por defecto se lo damos a cualquiera que entre por Google
    });

    // 4) Volver a leer el doc final, para obtener el role exacto (por si existía)
    const finalUserData = await getUserDoc(uid);
    const finalRole = finalUserData?.role || 'user';

    // 5) Retornamos para que el thunk de Redux haga dispatch(login(...))
    return { ok: true, uid, displayName, email, photoURL, role: finalRole };

  } catch (error) {
    console.error("❌ Error en signInWithGoogle:", error);
    return { ok: false, errorMessage: error.message };
  }
};


const appleProvider = new OAuthProvider('apple.com');


export const signInWithApple = async () => {
  try {
    const result = await signInWithPopup(FirebaseAuth, appleProvider);
    const { uid, displayName, email, photoURL } = result.user;

    // Forzar refresh token si usas Custom Claims (opcional)
    await result.user.getIdToken(true);

    // Guardar/actualizar en Firestore
    await saveUserDoc({
      uid,
      email,
      displayName: displayName || '',  // Apple a veces no provee name
      photoURL: photoURL || '',
      role: 'user',
    });

    // Leer doc final para obtener role o lo que necesites
    const finalUserData = await getUserDoc(uid);
    const finalRole = finalUserData?.role || 'user';

    return { ok: true, uid, email, displayName, photoURL, role: finalRole };
  } catch (error) {
    console.error("❌ Error en signInWithApple:", error);
    return { ok: false, errorMessage: error.message };
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