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
import { FirebaseAuth } from '../../../../firebase/firebaseConfig.js'
import { signInWithGoogle } from '../../../../firebase/providers.js'

/**
 * Iniciar sesión con Google
 */
export const startGoogleSignIn = () => {
  return async (dispatch) => {
    dispatch(checkingCredentials());

    const result = await signInWithGoogle();

    if (!result.ok) {
      dispatch(logout(result.errorMessage));
      return { ok: false, errorMessage: result.errorMessage };
    }

    // Si ok: true, despacha login y retorna
    dispatch(login(result));
    return { ok: true, ...result };
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

    // 0) Dispatch checkingCredentials
    dispatch(checkingCredentials());

    try {
      // 1 ) Create user with email and password in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        FirebaseAuth,
        email,
        password
      );

      if (userCredential.user){

        // 2) Send email verification
        await sendEmailVerification(userCredential.user);

        // 2.1) Optional displayName
        await updateProfile(FirebaseAuth.currentUser, {
          displayName: fullName,
        })

        // 3) Store user data in Redux state
        dispatch(setEmailSent(true))
        dispatch(setErrorMessage("Hemos enviado un email de verificación. Confirma tu correo antes de iniciar sesión."));

      }

      // 4) Return ok: true and email sent true
      return { ok: true, emailSent: true };

    } catch (error) {

      console.error('Error al crear la cuenta:', error.code, error.message);

      // By default, we'll show an error on the email field
      let errorField = 'email';
      let errorMessage = 'No se pudo crear la cuenta. Inténtalo más tarde.';

      // Handle specific errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorField = 'email';
          errorMessage = 'Ese correo ya está registrado.';
          break;
        case 'auth/invalid-email':
          errorField = 'email';
          errorMessage = 'El email ingresado no es válido.';
          break;
        case 'auth/weak-password':
          errorField = 'password';
          errorMessage = 'La contraseña es demasiado débil (mínimo 6 carácteres).';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Registro con email/password deshabilitado.';
          break;
        default:
          break;
      }

      // Let the form know that there was an error
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