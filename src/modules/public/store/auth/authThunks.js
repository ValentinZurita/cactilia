import { checkingCredentials, logout, login } from './authSlice.js'
import { registerWithEmailPassword, signInWithGoogle } from '../../../../firebase/providers.js'


export const startGoogleSingIn = () => {
  return async (dispatch) => {

    dispatch(checkingCredentials());

    const result = await signInWithGoogle();

    if (!result.ok) {
      return dispatch(logout(result.errorMessage));
    }

    dispatch(login(result));

  }
}



export const startRegisterWithEmailPassword = ({ fullName, email, password }) => {
  return async (dispatch) => {
    dispatch(checkingCredentials());

    const result = await registerWithEmailPassword({ fullName, email, password });

    if (!result.ok) {
      return dispatch(logout(result.errorMessage));
    }

    dispatch(login(result));
  };
};