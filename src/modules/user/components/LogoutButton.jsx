import { useDispatch } from "react-redux";
import { logout } from '../../../store/auth/authSlice.js'
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { FirebaseAuth } from '../../../firebase/firebaseConfig.js'

export const LogoutButton = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {

    // Close session
    try {
      await signOut(FirebaseAuth);
      dispatch(logout());
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Button to logout
  return (
    <button className="btn btn-danger mt-4" onClick={handleLogout}>
      Cerrar Sesión
    </button>
  );
};