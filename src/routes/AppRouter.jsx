/*
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthRoutes } from '../modules/auth/router/AuthRoutes'
import { PublicRoutes } from '../modules/public/router/PublicRoutes.jsx'
import { AdminRoutes } from '../modules/admin/routes/AdminRoutes.jsx'



export const AppRouter = () => {
  return (
    <Routes>
      {/!* Auth module *!/}
      <Route path="/auth/!*" element={<AuthRoutes />} />

      {/!* Public module *!/}
      <Route path="/!*" element={<PublicRoutes />} />

      {/!* Private route for authenticated users *!/}
      {/!*<Route path="/profile/!*" element={<PrivateRoute />}>
        <Route index element={<UserProfilePage />} />
      </Route>*!/}

      {/!* Admin module *!/}
      <Route path="admin/!*" element={<AdminRoutes />} />

      {/!* Any other route *!/}
      <Route path="*" element={<Navigate to = "/" />} />

    </Routes>
  );
};
*/



import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "../layout/PublicLayout.jsx";
import { AdminLayout } from "../layout/AdminLayout.jsx";
import { RequireAdminAuth } from "../modules/admin/components/admin-login-page/index.js";
import { AdminHomePage, AdminLoginPage, ProductManagementPage } from "../modules/admin/pages/index.js";
import { HomePage } from "../modules/public/pages/HomePage.jsx";
import { ShopPage } from '../modules/shop/pages/ShopPage.jsx'
import { CartPage } from '../modules/user/pages/CartPage.jsx'
import { AuthRoutes } from '../modules/auth/router/AuthRoutes.jsx'
import { CategoryManagementPage } from '../modules/admin/pages/CategoryManagementPage.jsx'
import { AdminRoutes } from '../modules/admin/routes/AdminRoutes.jsx'

export const AppRouter = () => {
  return (
    <Routes>

      {/* Rutas de autenticación */}


      {/* Public Layout (con Navbar y Footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/auth/*" element={<AuthRoutes />} />
      </Route>

      {/* Admin Login (sin layout) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Panel (protegido y con AdminLayout) */}

      {/* Rutas de administrador */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Redirección si la ruta no existe */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};