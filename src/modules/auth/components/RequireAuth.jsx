import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a la página de login si el usuario no está autenticado
 */
export const RequireAuth = ({ children }) => {
  const { status } = useSelector(state => state.auth);
  const location = useLocation();

  // Si está verificando la autenticación, mostrar un spinner
  if (status === 'checking') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login con la ruta actual como returnUrl
  if (status !== 'authenticated') {
    const returnPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?returnUrl=${returnPath}`} replace />;
  }

  // Si está autenticado, mostrar el contenido protegido
  return children;
};