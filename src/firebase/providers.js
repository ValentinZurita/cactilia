import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import { FirebaseAuth } from './firebaseConfig.js'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// Google provider for Firebase Auth
export const googleProvider = new GoogleAuthProvider();

// Login with Google account using Firebase Auth
export const signInWithGoogle = async () => {

  try {

    // Open Google sign-in popup and wait for the user to sign in
    const result = await signInWithPopup(FirebaseAuth, googleProvider);
    // Extract user data from the result
    const {displayName, email, photoURL, uid} = result.user

    // Return user data to store in Redux state and local storage (if needed)
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