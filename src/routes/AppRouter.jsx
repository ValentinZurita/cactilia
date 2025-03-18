import { Routes, Route, Navigate } from "react-router-dom";
import { AuthRoutes } from '../modules/auth/router/AuthRoutes.jsx';
import { AdminRoutes } from '../modules/admin/routes/AdminRoutes.jsx';
import { PublicRoutes } from '../modules/public/router/PublicRoutes.jsx';
import { ShopRoutes } from '../modules/shop/router/ShopRoutes.jsx';
import { CartPage } from '../modules/user/pages/CartPage.jsx';
import { PublicLayout } from '../layout/PublicLayout.jsx';
import { RequireAuth } from '../modules/auth/components/RequireAuth.jsx';
import { UserProfileRoutes } from '../modules/user/router/UserRoutes.jsx'

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas para el módulo público - Incluye PublicLayout */}
      <Route element={<PublicLayout />}>
        {/* Módulo público */}
        <Route path="/*" element={<PublicRoutes />} />

        {/* Módulo de autenticación */}
        <Route path="/auth/*" element={<AuthRoutes />} />

        {/* Módulo de tienda */}
        <Route path="/shop/*" element={<ShopRoutes />} />

        {/* Carrito */}
        <Route path="/cart" element={<CartPage />} />

        {/* Perfil de usuario - Con Navbar y Footer del PublicLayout */}
        <Route path="/profile/*" element={<RequireAuth><UserProfileRoutes /></RequireAuth>} />
      </Route>

      {/* Módulo admin - Sin PublicLayout */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};