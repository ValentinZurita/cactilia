import { useDispatch, useSelector } from 'react-redux'
import { UserInfo } from "../components/UserInfo.jsx";
import { UserOrders } from "../components/UserOrders";
import { UserAddress } from "../components/UserAddress";
import { UserPayment } from "../components/UserPayment";
import { LogoutButton } from "../components/LogoutButton";
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../store/auth/authSlice.js'

export const UserProfilePage = () => {
  const { displayName, email, photoURL } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };


  return (
    <div className="container mt-5">
      <h2 className="text-center">Mi Perfil</h2>

      {/* Sección de Información Personal */}
      <UserInfo name={displayName} email={email} photo={photoURL} />

      {/* Secciones con pestañas o cards */}
      <div className="row mt-4">
        <div className="col-md-6">
          <UserOrders />
        </div>
        <div className="col-md-6">
          <UserAddress />
        </div>
        <div className="col-md-6">
          <UserPayment />
        </div>
      </div>

      {/* Botón para cerrar sesión */}
      <LogoutButton />
    </div>
  );
};