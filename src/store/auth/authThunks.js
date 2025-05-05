import {
  checkingCredentials,
  logout,
  login,
  setEmailSent,
  setErrorMessage,
} from './authSlice.js'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  getAuth,
} from 'firebase/auth'
import { FirebaseAuth } from '../../config/firebase/firebaseConfig.js'
import { signInWithApple, signInWithGoogle } from '../../config/firebase/providers.js'
import { getUserFromFirestore, saveUserToFirestore } from '../../modules/auth/services/userService.js'
import { getFunctions, httpsCallable } from "firebase/functions";


export const startGoogleSignIn = () => {
  return async (dispatch) => {
    dispatch(checkingCredentials());

    // Llamamos a la función que creamos/ajustamos arriba
    const result = await signInWithGoogle();

    if (!result.ok) {
      // Si falló, despachamos logout con el error
      dispatch(logout(result.errorMessage));
      return { ok: false, errorMessage: result.errorMessage };
    }

    // Si salió ok, despachamos login con todos los datos, incluido role
    dispatch(login(result));

    return { ok: true, ...result };
  };
};


export const startAppleSignIn = () => {
  return async (dispatch) => {
    dispatch(checkingCredentials());

    const result = await signInWithApple();
    if (!result.ok) {
      dispatch(logout({ errorMessage: result.errorMessage }));
      return { ok: false, errorMessage: result.errorMessage };
    }

    dispatch(login(result)); // { uid, email, role, etc. }
    return { ok: true };
  };
};



/**
 *
 * Sign up with email and password
 * @param {string} fullName Nombre completo
 * @param {string} email Email
 * @param {string} phoneNumber Teléfono
 * @param {string} password Contraseña
 * @returns {Promise<{ok: boolean, errorField: string, errorMessage: string}|{ok: boolean}>}
 *
 * Return ok: true if the registration was successful, or an object with ok: false, errorField and errorMessage
 *
 * @example
 * dispatch(startRegisterWithEmailPassword({
 *  fullName: 'Juan Pérez', email: 'juan@mail.com', phoneNumber: '1234567890', password '123456' }))
 *  .then(response => { if (response.ok) { console.log('Usuario registrado con éxito!');}
 *  else { console.error('Error al registrar:', response.errorField, response.errorMessage);}});
 *
 */
export const startRegisterWithEmailPassword = ({
                                                 fullName,
                                                 email,
                                                 phoneNumber,
                                                 password,
                                               }) => {
  return async (dispatch) => {

    // 0) Dispatch checkingCredentials to indicate authentication process has started
    dispatch(checkingCredentials());

    try {
      // 1) Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        FirebaseAuth,
        email,
        password
      );

      if (userCredential.user) {
        const { uid } = userCredential.user;

        // 2) Send email verification
        await sendEmailVerification(userCredential.user);

        // 3) Update Firebase Auth profile with full name
        await updateProfile(userCredential.user, { displayName: fullName });

        // 4) Save user data in Firestore
        const userData = {
          uid,
          displayName: fullName,
          email,
          phoneNumber: phoneNumber || "", // If no phone number is provided, store an empty string
          role: "user", // Default role is "user"
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        try {
          await saveUserToFirestore(userData);
          console.log("✅ User successfully saved to Firestore:", userData);
        } catch (error) {
          console.error("❌ Error saving user to Firestore:", error);
        }

        // 5) Update Redux state with success message
        dispatch(setEmailSent(true));
        dispatch(
          setErrorMessage(
            "We have sent a verification email. Please confirm your email before logging in."
          )
        );

        // 6) Return success response
        return { ok: true, emailSent: true };
      }
    } catch (error) {
      console.error("Error creating the account:", error.code, error.message);

      // 🔥 Error handling: Default error field is "email"
      let errorField = "email";
      let errorMessage = "Account creation failed. Please try again later.";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorField = "email";
          errorMessage = "This email is already registered.";
          break;
        case "auth/invalid-email":
          errorField = "email";
          errorMessage = "The provided email is invalid.";
          break;
        case "auth/weak-password":
          errorField = "password";
          errorMessage = "The password is too weak (minimum 6 characters).";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password registration is disabled.";
          break;
        default:
          break;
      }

      // 7) Dispatch error in Redux state
      dispatch(logout({ errorMessage }));

      return {
        ok: false,
        errorField,
        errorMessage,
      };
    }
  };
};


/**
 *
 * Sing in with email and password
 *
 * @param {string} email Email
 * @param {string} password Contraseña
 * @returns {Promise<{ok: boolean, errorMessage: string}|{ok: boolean, emailSent: boolean}>}
 *
 * Return ok: true if the login was successful, or an object with ok: false and errorMessage
 *
 * @example
 * const response = await dispatch(startEmailSignIn(email: 'correo@mail.com', password: 'Password123'))
 * .then(response => { if (response.ok) { console.log('Usuario logueado con éxito!');}
 * else { console.error('Error al loguear:', response.errorMessage);}}
 *
 */
export const startEmailSignIn = (email, password) => {

  return async (dispatch) => {

    dispatch(checkingCredentials());

    try {

      // 1) Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(FirebaseAuth, email, password);
      const { uid, displayName, photoURL, email: userEmail } = userCredential.user;
      const user = userCredential.user;

      // 2) id email is not verified, send email verification
      if (!user.emailVerified) {
        await sendEmailVerification(user);

        // 2.1) Sign out in Firebase Auth
        await FirebaseAuth.signOut();

        // 2.2) Sign out in Redux
        dispatch(logout({ errorMessage: "Debes verificar tu correo. Te enviamos un nuevo enlace." }));

        // 2.3) Return error message
        return { ok: false, errorMessage: "Debes verificar tu correo. Te enviamos un nuevo enlace." };
      }

      // 3) If email is verified, dispatch login
      dispatch(login({ uid, email: userEmail, displayName, photoURL }));

      // 4) Return ok: true
      return { ok: true };

    } catch (error) {

      console.error("Error en el inicio de sesión:", error.message);

      // Dispatch logout
      dispatch(logout({ errorMessage: "Error al iniciar sesión. Inténtalo de nuevo más tarde." }));

      // Return error message
      return { ok: false, errorMessage: "Error al iniciar sesión. Inténtalo de nuevo más tarde." };

    }
  };
};

// ========================================================
// Logout Thunk - Added
// ========================================================
export const startLogout = () => {
  return async (dispatch) => {
    try {
      await FirebaseAuth.signOut(); // Sign out from Firebase
      dispatch(logout()); // Dispatch logout action from slice
    } catch (error) {
      console.error("Error during logout:", error);
      // Optionally dispatch an error message to the user
      dispatch(logout({ errorMessage: "Error al cerrar sesión." }));
    }
  };
};