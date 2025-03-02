import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '../../auth/components/RequireAuth';
import { ProfileLayout } from '../components/profile/ProfileLayout';
import {
  AddressesPage,
  OrdersPage,
  PaymentsPage,
  SettingsPage
} from '../pages/index.js'

/**
 * UserRoutes
 *
 * Defines routes for the user profile section
 * All routes are protected with RequireAuth
 */
export const UserRoutes = () => {
  return (
    <Routes>

      {/* Default route - redirect to orders */}
      <Route
        path="/"
        element={<RequireAuth><Navigate to="/profile/orders" replace /></RequireAuth>}
      />

      {/* Profile routes */}
      <Route
        path="/profile"
        element={<RequireAuth><ProfileLayout /></RequireAuth>}
      >
        {/* Default profile route - redirect to orders with 'replace' */}
        <Route index element={<Navigate to="orders" replace />} />

        {/* Individual profile sections */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="addresses" element={<AddressesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Redirect all other paths to orders */}
        <Route path="*" element={<Navigate to="orders" replace />} />
      </Route>
    </Routes>
  );
};