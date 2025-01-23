import { Route, Routes } from 'react-router-dom'
import { AuthRoutes } from '../modules/auth/router/AuthRoutes'

export const AppRouter = () => {
  return (
    <Routes>
      {/* Auth module */}
      <Route path="/auth/*" element={<AuthRoutes />} />
    </Routes>
  );
};