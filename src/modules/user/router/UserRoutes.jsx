// src/modules/user/router/UserRoutes.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "../../auth/components/RequireAuth";
import {
  CartPage,
  OrdersPage,
  OrderDetailPage,
  AddressesPage,
  PaymentsPage,
  SettingsPage,
} from "../pages";
import { ProfileLayout } from '../components/profile/index.js';
import { CheckoutPage } from '../../shop/pages/index.js'

export const UserRoutes = () => {
  return (
    <Routes>
      {/* Carrito sin protección */}
      <Route path="cart" element={<CartPage />} />

      {/* Checkout requiere autenticación */}
      <Route
        path="checkout"
        element={
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        }
      />

      {/* /profile requiere autenticación y muestra ProfileLayout */}
      <Route
        path="profile"
        element={
          <RequireAuth>
            <ProfileLayout />
          </RequireAuth>
        }
      >
        {/* Redirección por defecto a /profile/orders */}
        <Route index element={<Navigate to="orders" replace />} />

        {/* Diferentes secciones del perfil */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="addresses" element={<AddressesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Cualquier ruta dentro de /profile que no exista -> /profile/orders */}
        <Route path="*" element={<Navigate to="orders" replace />} />
      </Route>

      {/* Cualquier ruta */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};