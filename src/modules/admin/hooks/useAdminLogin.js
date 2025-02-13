import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getUserRole } from "../../../firebase/authUtils";
import { FirebaseAuth } from '../../../firebase/firebaseConfig.js'


/*
  Custom hook that handles the admin login logic.
 */


export const useAdminLogin = () => {

  const [firebaseError, setFirebaseError] = useState("");
  const navigate = useNavigate();

  const login = async ({ email, password }) => {

    setFirebaseError(""); // Limpiar errores previos

    try {
      // Authentication with Firebase
      await signInWithEmailAndPassword(FirebaseAuth, email, password);

      // Get the user role
      const role = await getUserRole();

      // Redirect to the admin home page if the user is an admin or superadmin
      if (role === "admin" || role === "superadmin") {
        navigate("/admin/home");
      } else {
        setFirebaseError("⚠️ No tienes permisos de administrador.");
        await FirebaseAuth.signOut();
      }

    } catch (error) {
      setFirebaseError("🔑 Credenciales incorrectas. Intenta nuevamente.");
    }

  };

  return { login, firebaseError };
};