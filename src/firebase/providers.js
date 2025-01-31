import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import { FirebaseAuth } from './firebaseConfig.js'

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