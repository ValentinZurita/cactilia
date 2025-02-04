import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthRoutes } from '../modules/auth/router/AuthRoutes'
import { PublicRoutes } from '../modules/public/router/PublicRoutes.jsx'
import { UserProfilePage } from '../modules/user/pages/UserProfilePage.jsx'
import { PrivateRoute } from './PrivateRoute.jsx'

export const AppRouter = () => {
  return (
    <Routes>
      {/* Auth module */}
      <Route path="/auth/*" element={<AuthRoutes />} />

      {/* Public module */}
      <Route path="/" element={<PublicRoutes />} />

      {/* Private route for authenticated users */}
      <Route path="/profile/*" element={<PrivateRoute />}>
        <Route index element={<UserProfilePage />} />
      </Route>

      {/* Any other route */}
      <Route path="*" element={<Navigate to = "/" />} />

    </Routes>
  );
};