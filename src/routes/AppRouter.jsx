import { Route, Routes } from 'react-router-dom'
import { AuthRoutes } from '../modules/auth/router/AuthRoutes'
import { PublicRoutes } from '../modules/public/router/PublicRoutes.jsx'

export const AppRouter = () => {
  return (
    <Routes>
      {/* Auth module */}
      <Route path="/auth/*" element={<AuthRoutes />} />
      <Route path="/" element={<PublicRoutes />} />
    </Routes>
  );
};