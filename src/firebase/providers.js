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



/**
 * Registers a new user with email and password.
 * @param {Object} param0 - User credentials.
 * @param {string} param0.email - User's email.
 * @param {string} param0.password - User's password.
 * @param {string} param0.displayName - User's full name.
 * @returns {Promise<Object>} - User credentials or error.
 */
export const registerUserWithEmailPassword = async ({ email, password, displayName }) => {
  try {
    const resp = await createUserWithEmailAndPassword(FirebaseAuth, email, password);
    const { uid } = resp.user;

    // Update user profile with display name
    await updateProfile(FirebaseAuth.currentUser, { displayName });

    return {
      ok: true,
      uid,
      email,
      displayName
    };

  } catch (error) {
    console.log(error);
    return {
      ok: false,
      errorMessage: error.message
    };
  }
};