import { Routes, Route, Navigate } from "react-router-dom";
import { AuthRoutes } from '../modules/auth/router/AuthRoutes.jsx';
import { AdminRoutes } from '../modules/admin/routes/AdminRoutes.jsx';
import { PublicRoutes } from '../modules/public/router/PublicRoutes.jsx';
import { ShopRoutes } from '../modules/shop/router/ShopRoutes.jsx';
import { UserRoutes } from '../modules/user/router/UserRoutes.jsx';
import { CheckoutPage } from '../modules/shop/pages';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Módulo público */}
      <Route path="/*" element={<PublicRoutes />} />

      {/* Módulo de autenticación */}
      <Route path="/auth/*" element={<AuthRoutes />} />

      {/* Módulo de tienda */}
      <Route path="/shop/*" element={<ShopRoutes />} />

      {/* Checkout directo (para facilitar el acceso) */}
      <Route path="/checkout" element={<CheckoutPage />} />

      {/* Módulo de usuario (incluye checkout y carrito) */}
      <Route path="/*" element={<UserRoutes />} />

      {/* Módulo admin */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};