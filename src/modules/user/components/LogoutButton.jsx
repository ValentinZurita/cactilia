import { useDispatch } from "react-redux";
import { logout } from '../../public/store/auth/authSlice.js'
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { FirebaseAuth } from '../../../firebase/firebaseConfig.js'

export const LogoutButton = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // ✅ Confirm logout
    const confirmLogout = window.confirm("¿Estás seguro de que quieres cerrar sesión?");

    // ❌ If user cancels, return
    if (!confirmLogout) return;

    // 🚪 Close session
    try {
      await signOut(FirebaseAuth); // 🔥 Close session in Firebase Auth
      dispatch(logout()); // 🔥 Update Redux state
      navigate("/"); // 🔄 Redirect to home page
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