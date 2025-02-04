import { Link } from 'react-router-dom';

export const AuthLinks = ({ type }) => {
  return (
    <div className="w-100 text-center mt-3 mb-3">
      {type === "forgot" ? (
        <Link to="/auth/forgot-password" className="text-primary text-decoration-none fw-light">
          ¿Olvidaste tu contraseña?
        </Link>
      ) : (
        <p className="text-muted">
          ¿No tienes cuenta?{" "}
          <Link to="/auth/register" className="text-primary text-decoration-none fw-light">
            Crea una aquí
          </Link>
        </p>
      )}
    </div>
  );
};