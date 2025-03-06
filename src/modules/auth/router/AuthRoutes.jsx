import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage, SignUpPage } from '../pages/index.js'
import { useSelector } from 'react-redux'

export const AuthRoutes = () => {

  const {status} = useSelector((state) => state.auth)

  if (status === "authenticated") {
    return <Navigate to="/profile" />;
  }

  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<SignUpPage />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};