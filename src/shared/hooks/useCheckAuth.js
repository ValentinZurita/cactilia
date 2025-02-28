// src/hooks/useCheckAuth.js
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useDispatch, useSelector } from 'react-redux'
import { checkingCredentials, login, logout } from '../../store/auth/authSlice.js'
import { FirebaseAuth } from '../../firebase/firebaseConfig.js'
import { getUserRole } from '../../firebase/authUtils.js'  // ✅ Importación corregida

export const useCheckAuth = () => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkingCredentials()); // Indica que está verificando sesión

    // Listener de Firebase para detectar cambios en la autenticación
    const unsubscribe = onAuthStateChanged(FirebaseAuth, async (user) => {
      if (!user) {
        dispatch(logout()); // Si no hay usuario, hace logout
      } else if (!user.emailVerified) {
        dispatch(logout({ errorMessage: "Por favor verifica tu email antes de iniciar sesión." }));
      } else {
        try {
          const token = await user.getIdToken(true); // 🔥 Recupera el token para mantener sesión
          const role = await getUserRole(); // 🔥 Obtiene el rol del usuario

          dispatch(
            login({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role, // ✅ Se mantiene la lógica del rol
              token, // ✅ Se guarda el token para persistencia
            })
          );
        } catch (error) {
          console.error("Error restaurando sesión:", error);
          dispatch(logout());
        }
      }
    });

    return () => unsubscribe(); // Cleanup al desmontar

  }, [dispatch]);

  return status;
};