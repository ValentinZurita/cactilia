import { Routes, Route, Navigate } from 'react-router-dom';
import {
  AddressesPage,
  OrdersPage,
  PaymentsPage,
  SettingsPage,
  OrderDetailPage
} from '../pages/index.js';
import { ProfileLayout } from '../components/profile/index.js';

/**
 * UserProfileRoutes
 *
 * Define las rutas para la sección de perfil de usuario dentro del PublicLayout
 * No es necesario RequireAuth aquí porque ya está aplicado en AppRouter
 */
export const UserProfileRoutes = () => {
  return (
    <Routes>
      {/* Rutas del perfil usando ProfileLayout como contenedor */}
      <Route path="/" element={<ProfileLayout />}>
        {/* Ruta por defecto - redireccionar a órdenes */}
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