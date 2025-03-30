// src/routes/AppRouter.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import { AuthRoutes } from "../modules/auth/router/AuthRoutes";
import { AdminRoutes } from "../modules/admin/routes/AdminRoutes";
import { PublicLayout } from "../layout/PublicLayout";

// Páginas públicas
import { HomePage } from "../modules/public/pages/HomePage";
import { ContactPage } from "../modules/public/pages/ContactPage";

// Páginas/routers de shop y user
import { ShopRoutes } from "../modules/shop/router/ShopRoutes";
import { CartPage } from "../modules/shop/pages/CartPage.jsx";
import { RequireAuth } from "../modules/auth/components/RequireAuth";

// Anidado de rutas de perfil
import { ProfileLayout } from '../modules/user/components/profile/index.js';
import { OrdersPage, OrderDetailPage, AddressesPage, PaymentsPage, SettingsPage } from "../modules/user/pages";
import { CheckoutPage } from '../modules/shop/pages/CheckoutPage.jsx'


export const AppRouter = () => {
  return (
    <Routes>
      {/** 1) Rutas de autenticación (sin layout público) */}
      <Route path="/auth/*" element={<AuthRoutes />} />

      {/** 2) Rutas de administrador (tienen AdminLayout dentro) */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/** 3) Rutas públicas/usuario, con PublicLayout */}
      <Route path="/" element={<PublicLayout />}>

        {/** Home como ruta index */}
        <Route index element={<HomePage />} />

        {/** Otra pública: /contacto */}
        <Route path="contacto" element={<ContactPage />} />

        {/** Rutas de la tienda: /shop/... */}
        <Route path="shop/*" element={<ShopRoutes />} />

        {/** Carrito (no requiere auth) */}
        <Route path="cart" element={<CartPage />} />

        {/** Checkout (requiere auth) */}
        <Route
          path="checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />

        {/** Rutas anidadas de perfil: /profile/... */}
        <Route
          path="profile"
          element={
            <RequireAuth>
              <ProfileLayout />
            </RequireAuth>
          }
        >
          {/** Redirección por defecto a /profile/orders */}
          <Route index element={<Navigate to="orders" replace />} />

          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/** Si algo no coincide en /profile/... => redirige a orders */}
          <Route path="*" element={<Navigate to="orders" replace />} />
        </Route>

        {/** Cualquier otra ruta que no matchee, a la home */}
        <Route path="*" element={<Navigate to="/" />} />

      </Route> {/* Fin de <Route path="/" element={<PublicLayout />}> */}

    </Routes>
  );
};