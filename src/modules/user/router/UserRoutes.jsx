import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '../../auth/components/RequireAuth';
import {
  AddressesPage,
  OrdersPage,
  PaymentsPage,
  SettingsPage,
  CartPage,
  OrderDetailPage
} from '../pages/index.js';
import { ProfileLayout } from '../components/profile/index.js';

/**
 * UserRoutes
 *
 * Define las rutas para la sección de usuario
 * Todas las rutas están protegidas con RequireAuth
 */
export const UserRoutes = () => {
  return (
    <Routes>
      {/* Página de carrito */}
      <Route path="/cart" element={<CartPage />} />

      {/* Checkout */}
      {/*<Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />*/}

      {/* Rutas del perfil */}
      <Route
        path="/profile"
        element={<RequireAuth><ProfileLayout /></RequireAuth>}
      >
        {/* Ruta por defecto - redireccionar a órdenes con 'replace' */}
        <Route index element={<Navigate to="orders" replace />} />

        {/* Secciones individuales del perfil */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="addresses" element={<AddressesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Redireccionar otras rutas a órdenes */}
        <Route path="*" element={<Navigate to="orders" replace />} />
      </Route>
    </Routes>
  );
};