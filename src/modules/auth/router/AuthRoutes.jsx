import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useSelector } from 'react-redux'
import { Spinner } from '../../../shared/components/spinner/Spinner.jsx'

// Función de ayuda para importar componentes con exportaciones nombradas
const lazyLoadNamed = (importFn, componentName) => {
  return lazy(async () => {
    const module = await importFn();
    return { default: module[componentName] };
  });
};

// Lazy loading de páginas de autenticación
const LoginPage = lazyLoadNamed(() => import('../pages/LoginPage'), "LoginPage");
const SignUpPage = lazyLoadNamed(() => import('../pages/SignUpPage'), "SignUpPage");

// Fallback para cuando se está cargando un componente
const SuspenseFallback = () => <Spinner />

const AuthRoutes = () => {
  const {status} = useSelector((state) => state.auth)

  if (status === "authenticated") {
    return <Navigate to="/profile" />;
  }

  return (
    <Routes>
      <Route path="login" element={
        <Suspense fallback={<SuspenseFallback />}>
          <LoginPage />
        </Suspense>
      } />
      <Route path="register" element={
        <Suspense fallback={<SuspenseFallback />}>
          <SignUpPage />
        </Suspense>
      } />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};

export default AuthRoutes;