import { Routes, Route, Navigate } from "react-router-dom";
import { AuthRoutes } from '../modules/auth/router/AuthRoutes.jsx'
import { AdminRoutes } from '../modules/admin/routes/AdminRoutes.jsx'
import { PublicRoutes } from '../modules/public/router/PublicRoutes.jsx'

export const AppRouter = () => {
  return (
    <Routes>
      {/* Módulo público (contiene HOME, SHOP, CART y el outlet para AUTH) */}
      <Route path="/*" element={<PublicRoutes />} />

      {/* Módulo admin (rutas separadas) */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};