import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export const PrivateRoute = () => {
  const { status } = useSelector((state) => state.auth);

  // Show a loading spinner while the user's authentication status is being checked
  if (status === "checking") {
    return <div className="text-center py-5">Verificando sesión...</div>;
  }

  // If the user is authenticated, render the child routes
  return (
    status === "authenticated"
      ? <Outlet />
      : <Navigate to="/auth/login" />
  )
};