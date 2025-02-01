import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import { FirebaseAuth } from './firebaseConfig.js'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {

  try {

    const result = await signInWithPopup(FirebaseAuth, googleProvider);
    console.log(result)
    const {displayName, email, photoURL, uid} = result.user

    return {
      ok: true,
      displayName,
      email,
      photoURL,
      uid
    }

  }

  catch (error) {
    console.log(error)
    return {
      ok: false,
      error
    }
  }
}


export const registerWithEmailPassword = async ({ email, password, fullName }) => {
  try {
    // Crear usuario en Firebase
    const userCredential = await createUserWithEmailAndPassword(FirebaseAuth, email, password);
    const { uid } = userCredential.user;

    // Actualizar perfil con el nombre del usuario
    await updateProfile(userCredential.user, {
      displayName: fullName,
    });

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