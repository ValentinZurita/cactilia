// src/hooks/useCheckAuth.js
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useDispatch, useSelector } from 'react-redux'
import { checkingCredentials, login, logout } from '../../modules/public/store/auth/authSlice.js'
import { FirebaseAuth } from '../../firebase/firebaseConfig.js'

export const useCheckAuth = () => {

  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);

  useEffect(() => {

    // 🚀 Dispatch "checkingCredentials()" only if necessary
    if (status === "checking") {
      dispatch(checkingCredentials());
    }

    // 🔥 Firebase listener for authentication state
    const unsubscribe = onAuthStateChanged(FirebaseAuth, (user) => {
      if (!user) {
        // 🛑 No user is logged in → force logout
        dispatch(logout());
      } else if (!user.emailVerified) {
        // ⚠ Prevent unverified users from logging in
        dispatch(logout({ errorMessage: "Por favor verifica tu email antes de inciar sesión." }));
      } else {
        // ✅ Successfully authenticated user
        const { uid, email, displayName, photoURL } = user;
        dispatch(login({ uid, email, displayName, photoURL }));
      }
    });

    // 🧹 Cleanup: Unsubscribe from Firebase listener on unmount
    return () => unsubscribe();
  }, [dispatch, status]);

  return status;
};